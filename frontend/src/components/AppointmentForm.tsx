"use client";

import { useState, type FormEvent } from "react";
import type { Appointment } from "@/lib/types";

export type AppointmentDraft = {
  id?: string;
  visitorName: string;
  visitorOrg: string;
  hostName: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  visitCode: string;
  notes: string;
};

export function emptyForm(date: string): AppointmentDraft {
  return {
    visitorName: "",
    visitorOrg: "",
    hostName: "",
    purpose: "",
    date,
    startTime: "10:00",
    endTime: "10:30",
    visitCode: "",
    notes: "",
  };
}

export function fromAppointment(a: Appointment): AppointmentDraft {
  return {
    id: a.id,
    visitorName: a.visitorName,
    visitorOrg: a.visitorOrg,
    hostName: a.hostName,
    purpose: a.purpose,
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    visitCode: a.visitCode,
    notes: a.notes,
  };
}

export function AppointmentForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: AppointmentDraft;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof AppointmentDraft>(key: K, value: AppointmentDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const url = form.id ? `/api/appointments/${form.id}` : "/api/appointments";
      const res = await fetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "保存できませんでした");
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-xl border border-[var(--line)] bg-ivory px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/45 p-4">
      <form
        onSubmit={(e) => void submit(e)}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl"
      >
        <h2 className="font-serif text-2xl text-navy">{form.id ? "来客予定を編集" : "来客予定を追加"}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-xs text-navy/60">
            お客様名
            <input className={`${field} mt-1`} required value={form.visitorName} onChange={(e) => set("visitorName", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            会社・団体
            <input className={`${field} mt-1`} value={form.visitorOrg} onChange={(e) => set("visitorOrg", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            担当者
            <input className={`${field} mt-1`} value={form.hostName} onChange={(e) => set("hostName", e.target.value)} />
          </label>
          <label className="sm:col-span-2 text-xs text-navy/60">
            用件
            <input className={`${field} mt-1`} value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            日付
            <input type="date" className={`${field} mt-1`} required value={form.date} onChange={(e) => set("date", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            受付番号（空欄で自動）
            <input className={`${field} mt-1`} maxLength={4} value={form.visitCode} onChange={(e) => set("visitCode", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            開始
            <input type="time" className={`${field} mt-1`} required value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </label>
          <label className="text-xs text-navy/60">
            終了
            <input type="time" className={`${field} mt-1`} value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </label>
          <label className="sm:col-span-2 text-xs text-navy/60">
            メモ
            <textarea className={`${field} mt-1 min-h-20`} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-[var(--alert)]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-navy/60">
            キャンセル
          </button>
          <button type="submit" disabled={busy} className="rounded-full bg-navy px-5 py-2 text-sm text-ivory">
            {busy ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
