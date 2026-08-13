"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapshot } from "@/hooks/useSnapshot";
import { formatDateTimeJa, formatTime, statusLabel, todayISO } from "@/lib/format";
import { playChime, playRingTick } from "@/lib/sound";
import type { Appointment, CallRecord } from "@/lib/types";
import { AppointmentForm, emptyForm } from "./AppointmentForm";

export function AdminDashboard() {
  const router = useRouter();
  const { data, refresh } = useSnapshot(1400);
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const today = todayISO();
  const todays = useMemo(
    () =>
      (data?.appointments ?? [])
        .filter((a) => a.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data, today],
  );

  const unread = (data?.notifications ?? []).filter((n) => !n.read);
  const ringing = (data?.calls ?? []).filter((c) => c.status === "ringing");
  const live = (data?.calls ?? []).find((c) => c.status === "active");

  useEffect(() => {
    if (!data) return;
    const ids = data.notifications.filter((n) => !n.read).map((n) => n.id);
    if (!primed.current) {
      ids.forEach((id) => seen.current.add(id));
      primed.current = true;
      return;
    }
    const fresh = ids.filter((id) => !seen.current.has(id));
    if (fresh.length) {
      playChime();
      if ("Notification" in window && Notification.permission === "granted") {
        const note = data.notifications.find((n) => n.id === fresh[0]);
        if (note) new Notification("おうち受付", { body: note.message });
      }
    }
    ids.forEach((id) => seen.current.add(id));
  }, [data]);

  useEffect(() => {
    if (!ringing.length) return;
    playRingTick();
    const id = window.setInterval(playRingTick, 1800);
    return () => window.clearInterval(id);
  }, [ringing.length]);

  async function ack(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    await refresh();
  }

  async function setStatus(apt: Appointment, status: Appointment["status"]) {
    setBusyId(apt.id);
    await fetch(`/api/appointments/${apt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    await refresh();
  }

  async function talk(apt: Appointment) {
    setBusyId(apt.id);
    const res = await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: apt.id,
        visitorName: apt.visitorName,
        reason: "arrival",
        startedBy: "admin",
      }),
    });
    const json = (await res.json()) as CallRecord;
    setBusyId(null);
    router.push(`/call/${json.id}?role=admin`);
  }

  async function answer(call: CallRecord) {
    router.push(`/call/${call.id}?role=admin`);
  }

  function requestNotify() {
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {ringing[0] && (
        <div className="ringing rounded-3xl bg-[var(--alert)] p-6 text-white">
          <p className="text-xs tracking-[0.2em]">INCOMING</p>
          <h2 className="mt-2 font-serif text-3xl">{ringing[0].visitorName} 様から着信</h2>
          <p className="mt-2 text-sm text-white/80">
            {ringing[0].reason === "inquiry" ? "お問い合わせ" : "到着後のご案内"}です。応答するとビデオとチャットが始まります。
          </p>
          <button
            type="button"
            onClick={() => void answer(ringing[0])}
            className="mt-5 rounded-full bg-white px-6 py-3 font-semibold text-[var(--alert)]"
          >
            応答する
          </button>
        </div>
      )}

      {live && (
        <div className="rounded-3xl bg-navy p-5 text-ivory">
          <p className="text-sm">
            現在 {live.visitorName} 様と通話中です。
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => router.push(`/call/${live.id}?role=admin`)}
            >
              通話画面へ戻る
            </button>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-navy">本日の受付</h2>
          <p className="mt-1 text-sm text-navy/60">自宅から来客の到着を確認し、必要ならその場でお話しください。</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={requestNotify}
            className="rounded-full border border-[var(--line)] bg-paper px-4 py-2 text-sm"
          >
            ブラウザ通知を許可
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-full bg-navy px-4 py-2 text-sm text-ivory"
          >
            来客を追加
          </button>
        </div>
      </div>

      {unread.length > 0 && (
        <section className="space-y-3">
          {unread.map((n) => (
            <article
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-paper p-4"
            >
              <div>
                <p className="text-xs text-gold">{n.type === "arrival" ? "到着" : "通話"}</p>
                <p className="mt-1 font-medium text-navy">{n.message}</p>
                <p className="text-xs text-navy/50">{formatDateTimeJa(n.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                {n.callId && (
                  <button
                    type="button"
                    className="rounded-full bg-navy px-4 py-2 text-sm text-ivory"
                    onClick={() => router.push(`/call/${n.callId}?role=admin`)}
                  >
                    通話する
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
                  onClick={() => void ack(n.id)}
                >
                  確認済み
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-[var(--line)] bg-paper">
        {todays.length === 0 && (
          <p className="p-8 text-sm text-navy/60">本日の来客予定はありません。</p>
        )}
        <ul>
          {todays.map((apt) => (
            <li
              key={apt.id}
              className="flex flex-wrap items-center gap-4 border-b border-[var(--line)] px-5 py-4 last:border-b-0"
            >
              <div className="w-24 shrink-0 font-serif text-xl text-navy">
                {formatTime(apt.startTime)}
                {apt.endTime ? (
                  <span className="block text-xs text-navy/45">{apt.endTime}迄</span>
                ) : null}
              </div>
              <div className="min-w-[12rem] flex-1">
                <p className="font-semibold text-navy">
                  {apt.visitorName} 様
                  {apt.visitorOrg ? (
                    <span className="ml-2 text-sm font-normal text-navy/55">{apt.visitorOrg}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-navy/65">
                  {apt.purpose}
                  {apt.hostName ? ` ／ 担当 ${apt.hostName}` : ""}
                </p>
                <p className="mt-1 text-xs text-navy/45">受付番号 {apt.visitCode}</p>
              </div>
              <StatusPill status={apt.status} />
              <div className="flex flex-wrap gap-2">
                {(apt.status === "arrived" || apt.status === "scheduled" || apt.status === "in-call") && (
                  <button
                    type="button"
                    disabled={busyId === apt.id}
                    onClick={() => void talk(apt)}
                    className="rounded-full bg-navy px-3 py-1.5 text-xs text-ivory"
                  >
                    お客様と話す
                  </button>
                )}
                {apt.status !== "completed" && apt.status !== "cancelled" && (
                  <button
                    type="button"
                    disabled={busyId === apt.id}
                    onClick={() => void setStatus(apt, "completed")}
                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs"
                  >
                    対応済
                  </button>
                )}
                {apt.status === "scheduled" && (
                  <button
                    type="button"
                    disabled={busyId === apt.id}
                    onClick={() => void setStatus(apt, "no-show")}
                    className="rounded-full px-3 py-1.5 text-xs text-navy/50"
                  >
                    不来館
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {formOpen && (
        <AppointmentForm
          initial={emptyForm(today)}
          onClose={() => setFormOpen(false)}
          onSaved={async () => {
            setFormOpen(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    scheduled: "bg-ivory text-navy",
    arrived: "bg-[var(--arrive)] text-white",
    "in-call": "bg-gold text-navy-deep",
    completed: "bg-navy/10 text-navy/60",
    cancelled: "bg-navy/10 text-navy/45",
    "no-show": "bg-navy/10 text-navy/45",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[status] ?? "bg-ivory"}`}>
      {statusLabel(status)}
    </span>
  );
}
