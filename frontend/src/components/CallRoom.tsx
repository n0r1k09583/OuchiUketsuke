"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CallRecord, CallRole, ChatMessage } from "@/lib/types";
import { formatDateTimeJa } from "@/lib/format";

type Props = {
  callId: string;
  role: CallRole;
};

export function CallRoom({ callId, role }: Props) {
  const router = useRouter();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [call, setCall] = useState<CallRecord | null>(null);
  const [text, setText] = useState("");
  const [mediaError, setMediaError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  const home = role === "admin" ? "/admin" : "/reception";

  const refreshCall = useCallback(async () => {
    const res = await fetch(`/api/calls/${callId}`, { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as CallRecord;
    setCall(json);
    if (json.status === "ended") {
      router.push(home);
    }
  }, [callId, home, router]);

  useEffect(() => {
    void fetch(`/api/calls/${callId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
  }, [callId]);

  useEffect(() => {
    const start = window.setTimeout(() => void refreshCall(), 0);
    const id = window.setInterval(() => void refreshCall(), 1200);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [refreshCall]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [call?.messages.length]);

  useEffect(() => {
    let cancelled = false;
    let pc: RTCPeerConnection | null = null;
    let poll = 0;
    const pending: RTCIceCandidateInit[] = [];

    async function addIce(candidate: RTCIceCandidateInit) {
      if (!pc) return;
      if (!pc.remoteDescription) {
        pending.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* ignore stale candidates */
      }
    }

    async function flushIce() {
      while (pending.length) {
        const next = pending.shift();
        if (next) await addIce(next);
      }
    }

    async function start() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        setMediaError(true);
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
        await localRef.current.play().catch(() => undefined);
      }

      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      stream.getTracks().forEach((track) => pc?.addTrack(track, stream));
      pc.ontrack = (ev) => {
        if (remoteRef.current) {
          remoteRef.current.srcObject = ev.streams[0];
          void remoteRef.current.play().catch(() => undefined);
          setRemoteReady(true);
        }
      };
      pc.onicecandidate = (ev) => {
        if (!ev.candidate) return;
        void fetch(`/api/calls/${callId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            type: "ice",
            payload: ev.candidate.toJSON(),
          }),
        });
      };

      if (role === "visitor") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await fetch(`/api/calls/${callId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, type: "offer", payload: offer }),
        });
      }

      let visitorIce = 0;
      let adminIce = 0;
      poll = window.setInterval(async () => {
        if (!pc) return;
        const res = await fetch(`/api/calls/${callId}/signal`, { cache: "no-store" });
        if (!res.ok) return;
        const sig = (await res.json()) as CallRecord["signal"];
        if (role === "admin" && sig.offer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(sig.offer);
          await flushIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await fetch(`/api/calls/${callId}/signal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, type: "answer", payload: answer }),
          });
        }
        if (role === "visitor" && sig.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(sig.answer);
          await flushIce();
        }
        const incoming = role === "admin" ? sig.iceFromVisitor : sig.iceFromAdmin;
        let idx = role === "admin" ? visitorIce : adminIce;
        for (; idx < incoming.length; idx += 1) {
          await addIce(incoming[idx]);
        }
        if (role === "admin") visitorIce = idx;
        else adminIce = idx;
      }, 700);
    }

    void start();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      pc?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [callId, role]);

  function toggleMute() {
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    setMuted(next);
  }

  function toggleCam() {
    const next = !camOff;
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !next;
    });
    setCamOff(next);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = text;
    setText("");
    await fetch(`/api/calls/${callId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, text: payload }),
    });
    await refreshCall();
  }

  async function hangUp() {
    await fetch(`/api/calls/${callId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    });
    router.push(home);
  }

  const other = role === "admin" ? call?.visitorName ?? "お客様" : "受付担当";
  const messages: ChatMessage[] = call?.messages ?? [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-navy-deep text-ivory">
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold-soft">LIVE DESK</p>
          <h1 className="font-serif text-xl">{other} と通話中</h1>
        </div>
        <button
          type="button"
          onClick={() => void hangUp()}
          className="rounded-full bg-[var(--alert)] px-5 py-2 text-sm font-semibold"
        >
          通話終了
        </button>
      </header>

      <div className="grid flex-1 gap-4 px-4 pb-5 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="relative min-h-[280px] overflow-hidden rounded-3xl bg-black">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {!remoteReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/80 p-6 text-center">
              <p className="font-serif text-2xl">{other}</p>
              <p className="mt-3 text-sm text-ivory/70">
                {mediaError
                  ? "カメラが使えないため、チャットでご案内します。"
                  : "映像を接続しています。相手が参加するとこちらに映ります。"}
              </p>
            </div>
          )}
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="absolute bottom-4 right-4 h-28 w-40 rounded-xl border border-white/20 object-cover shadow-lg"
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full bg-black/55 px-4 py-2 text-xs"
            >
              {muted ? "マイクOFF" : "マイクON"}
            </button>
            <button
              type="button"
              onClick={toggleCam}
              className="rounded-full bg-black/55 px-4 py-2 text-xs"
            >
              {camOff ? "カメラOFF" : "カメラON"}
            </button>
          </div>
        </section>

        <section className="flex min-h-[320px] flex-col rounded-3xl bg-navy p-4">
          <h2 className="px-1 text-sm font-semibold tracking-wide">チャット</h2>
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-2xl bg-navy-deep/60 p-3">
            {messages.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-ivory/50">
                映像がつながらないときは、こちらで用件をお伝えください。
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  m.role === role ? "ml-auto bg-gold/90 text-navy-deep" : "bg-white/10"
                }`}
              >
                <p>{m.text}</p>
                <p className="mt-1 text-[10px] opacity-70">{formatDateTimeJa(m.at)}</p>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <form onSubmit={(e) => void sendMessage(e)} className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="メッセージを入力"
              className="flex-1 rounded-full border border-white/15 bg-navy-deep px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-gold px-5 text-sm font-semibold text-navy-deep">
              送信
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
