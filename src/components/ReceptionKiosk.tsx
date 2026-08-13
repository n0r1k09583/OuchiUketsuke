"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSnapshot } from "@/hooks/useSnapshot";
import { formatTime, todayISO } from "@/lib/format";
import type { Appointment, CallRecord } from "@/lib/types";

type Mode = "home" | "reserved" | "inquiry" | "waiting";

export function ReceptionKiosk() {
  const router = useRouter();
  const { data } = useSnapshot(2000);
  const [mode, setMode] = useState<Mode>("home");
  const [query, setQuery] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const settings = data?.settings;
  const today = todayISO();

  const incoming = useMemo(() => {
    if (!appointment || !data) return null;
    return (
      data.calls.find(
        (c) =>
          (c.status === "ringing" || c.status === "active") &&
          c.appointmentId === appointment.id,
      ) ?? null
    );
  }, [appointment, data]);

  useEffect(() => {
    if (mode === "waiting" && incoming) {
      router.push(`/call/${incoming.id}?role=visitor`);
    }
  }, [incoming, mode, router]);

  async function checkIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = (await res.json()) as { appointment?: Appointment; error?: string };
      if (!res.ok || !json.appointment) {
        throw new Error(json.error ?? "受付できませんでした");
      }
      setAppointment(json.appointment);
      setMode("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  async function startCall(payload: {
    visitorName: string;
    appointmentId?: string | null;
    reason: "arrival" | "inquiry";
  }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, startedBy: "visitor" }),
      });
      const json = (await res.json()) as CallRecord & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "通話を開始できませんでした");
      router.push(`/call/${json.id}?role=visitor`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setBusy(false);
    }
  }

  async function inquiry(e: FormEvent) {
    e.preventDefault();
    if (!walkInName.trim()) return;
    await startCall({ visitorName: walkInName.trim(), reason: "inquiry" });
  }

  return (
    <div className="grain flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-gold">RECEPTION</p>
          <h1 className="font-serif text-2xl text-navy md:text-3xl">
            {settings?.facilityName ?? "おうち受付"}
          </h1>
        </div>
        <p className="text-sm text-navy/60">{today.replaceAll("-", ".")}</p>
      </header>
      <div className="gold-rule" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
        {mode === "home" && (
          <div className="text-center">
            <p className="font-serif text-3xl leading-snug text-navy md:text-4xl">
              ようこそ
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-navy/70">
              {settings?.greeting}
            </p>
            <div className="mt-10 grid gap-4">
              <button
                type="button"
                className="kiosk-btn bg-navy text-ivory"
                onClick={() => {
                  setError(null);
                  setMode("reserved");
                }}
              >
                ご予約の方
              </button>
              <button
                type="button"
                className="kiosk-btn border border-[var(--line)] bg-paper text-navy"
                onClick={() => {
                  setError(null);
                  setMode("inquiry");
                }}
              >
                お問い合わせ・直接お話
              </button>
            </div>
          </div>
        )}

        {mode === "reserved" && (
          <form onSubmit={checkIn} className="rounded-3xl bg-paper p-8 shadow-[0_16px_40px_rgba(16,36,60,0.08)]">
            <h2 className="font-serif text-2xl text-navy">ご予約の確認</h2>
            <p className="mt-2 text-sm leading-6 text-navy/65">
              お名前、または4桁の受付番号を入力してください。到着が担当者へ届きます。
            </p>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例）田中 美咲 ／ 4821"
              className="mt-6 w-full rounded-2xl border border-[var(--line)] bg-ivory px-5 py-4 text-lg outline-none focus:border-gold"
            />
            {error && <p className="mt-3 text-sm text-[var(--alert)]">{error}</p>}
            <button
              type="submit"
              disabled={busy || !query.trim()}
              className="kiosk-btn mt-6 w-full bg-navy text-ivory disabled:opacity-40"
            >
              {busy ? "確認中…" : "到着を知らせる"}
            </button>
            <button
              type="button"
              className="mt-4 w-full py-3 text-sm text-navy/60"
              onClick={() => setMode("home")}
            >
              戻る
            </button>
          </form>
        )}

        {mode === "inquiry" && (
          <form onSubmit={inquiry} className="rounded-3xl bg-paper p-8 shadow-[0_16px_40px_rgba(16,36,60,0.08)]">
            <h2 className="font-serif text-2xl text-navy">受付とお話しする</h2>
            <p className="mt-2 text-sm leading-6 text-navy/65">
              ご予約がなくても、お名前を入れて担当者とビデオ・チャットでお話できます。
            </p>
            <input
              autoFocus
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="お名前"
              className="mt-6 w-full rounded-2xl border border-[var(--line)] bg-ivory px-5 py-4 text-lg outline-none focus:border-gold"
            />
            {error && <p className="mt-3 text-sm text-[var(--alert)]">{error}</p>}
            <button
              type="submit"
              disabled={busy || !walkInName.trim()}
              className="kiosk-btn mt-6 w-full bg-navy text-ivory disabled:opacity-40"
            >
              {busy ? "接続中…" : "受付を呼び出す"}
            </button>
            <button
              type="button"
              className="mt-4 w-full py-3 text-sm text-navy/60"
              onClick={() => setMode("home")}
            >
              戻る
            </button>
          </form>
        )}

        {mode === "waiting" && appointment && (
          <div className="rounded-3xl bg-paper p-8 text-center shadow-[0_16px_40px_rgba(16,36,60,0.08)]">
            <p className="text-xs tracking-[0.2em] text-[var(--arrive)]">ARRIVED</p>
            <h2 className="mt-3 font-serif text-3xl text-navy">{appointment.visitorName} 様</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              到着を担当者へお伝えしました。
              <br />
              {formatTime(appointment.startTime)} 〜 {appointment.purpose}
              {appointment.hostName ? `（担当：${appointment.hostName}）` : ""}
            </p>
            <p className="mt-6 rounded-2xl bg-ivory px-4 py-3 text-sm text-navy/70">
              この画面のままお待ちください。担当者からお呼び出しがあるか、下のボタンから直接お話もできます。
            </p>
            {error && <p className="mt-3 text-sm text-[var(--alert)]">{error}</p>}
            <button
              type="button"
              disabled={busy}
              className="kiosk-btn mt-8 w-full bg-navy text-ivory"
              onClick={() =>
                void startCall({
                  visitorName: appointment.visitorName,
                  appointmentId: appointment.id,
                  reason: "arrival",
                })
              }
            >
              受付とビデオ通話する
            </button>
            <button
              type="button"
              className="mt-4 w-full py-3 text-sm text-navy/60"
              onClick={() => {
                setAppointment(null);
                setQuery("");
                setMode("home");
              }}
            >
              受付トップへ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
