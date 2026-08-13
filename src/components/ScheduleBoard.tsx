"use client";

import { useMemo, useState } from "react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { addDaysISO, formatDateJa, statusLabel, staySummary, todayISO } from "@/lib/format";
import { AppointmentForm, emptyForm, fromAppointment } from "./AppointmentForm";
import type { Appointment } from "@/lib/types";

export function ScheduleBoard() {
  const { data, refresh } = useSnapshot(4000);
  const [date, setDate] = useState(todayISO());
  const [editing, setEditing] = useState<ReturnType<typeof emptyForm> | null>(null);

  const facilityType = data?.settings.facilityType;

  const list = useMemo(
    () =>
      (data?.appointments ?? [])
        .filter((a) => a.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data, date],
  );

  async function remove(apt: Appointment) {
    if (!confirm(`${apt.visitorName} 様の予定を削除しますか？`)) return;
    await fetch(`/api/appointments/${apt.id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-navy">スケジュール</h2>
          <p className="mt-1 text-sm text-navy/60">{formatDateJa(date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-[var(--line)] bg-paper px-3 py-2 text-sm"
            onClick={() => setDate(addDaysISO(date, -1))}
          >
            前の日
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-full border border-[var(--line)] bg-paper px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-full border border-[var(--line)] bg-paper px-3 py-2 text-sm"
            onClick={() => setDate(addDaysISO(date, 1))}
          >
            次の日
          </button>
          <button
            type="button"
            className="rounded-full bg-navy px-4 py-2 text-sm text-ivory"
            onClick={() => setEditing(emptyForm(date))}
          >
            追加
          </button>
        </div>
      </div>

      <ul className="mt-6 overflow-hidden rounded-3xl border border-[var(--line)] bg-paper">
        {list.length === 0 && <li className="p-8 text-sm text-navy/60">この日の予定はありません。</li>}
        {list.map((apt) => (
          <li key={apt.id} className="flex flex-wrap items-center gap-4 border-b border-[var(--line)] px-5 py-4 last:border-b-0">
            <div className="w-24 font-serif text-lg text-navy">{apt.startTime}</div>
            <div className="min-w-[12rem] flex-1">
              <p className="font-semibold text-navy">{apt.visitorName} 様</p>
              <p className="text-sm text-navy/65">
                {apt.purpose}
                {apt.hostName ? ` ／ ${apt.hostName}` : ""}
              </p>
              <p className="text-xs text-navy/45">番号 {apt.visitCode}</p>
              {staySummary(apt, facilityType) ? (
                <p className="text-xs text-navy/55">{staySummary(apt, facilityType)}</p>
              ) : null}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                apt.status === "arrived"
                  ? "bg-[var(--arrive)] text-white"
                  : apt.status === "departed"
                    ? "bg-navy text-ivory"
                    : apt.status === "in-call"
                      ? "bg-gold text-navy-deep"
                      : "text-navy/55"
              }`}
            >
              {statusLabel(apt.status, facilityType)}
            </span>
            <button type="button" className="text-sm text-navy" onClick={() => setEditing(fromAppointment(apt))}>
              編集
            </button>
            <button type="button" className="text-sm text-[var(--alert)]" onClick={() => void remove(apt)}>
              削除
            </button>
          </li>
        ))}
      </ul>

      {editing && (
        <AppointmentForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
