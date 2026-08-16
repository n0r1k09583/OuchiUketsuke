"use client";

import { useState, type FormEvent } from "react";
import { useSnapshot } from "@/hooks/useSnapshot";
import type { FacilityType, Settings } from "@/lib/types";

export function SettingsPanel() {
  const { data, refresh } = useSnapshot(8000);
  if (!data) {
    return <p className="text-sm text-navy/50">読み込み中…</p>;
  }
  return <SettingsForm key={data.settings.facilityName} initial={data.settings} onSaved={refresh} />;
}

function SettingsForm({
  initial,
  onSaved,
}: {
  initial: Settings;
  onSaved: () => Promise<void> | void;
}) {
  const [facilityName, setFacilityName] = useState(initial.facilityName);
  const [facilityType, setFacilityType] = useState<FacilityType>(initial.facilityType);
  const [greeting, setGreeting] = useState(initial.greeting);
  const [adminPin, setAdminPin] = useState(initial.adminPin);
  const [saved, setSaved] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityName, facilityType, greeting, adminPin }),
    });
    setSaved(true);
    await onSaved();
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={(e) => void save(e)} className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-paper p-6">
      <h2 className="font-serif text-3xl text-navy">施設の設定</h2>
      <p className="mt-2 text-sm text-navy/60">ホテルでも会社でも使えます。受付キオスクの表示名とご案内文を変えられます。</p>
      <label className="mt-6 block text-xs text-navy/60">
        施設名
        <input
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-ivory px-3 py-2.5 outline-none focus:border-gold"
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
        />
      </label>
      <label className="mt-4 block text-xs text-navy/60">
        種別
        <select
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-ivory px-3 py-2.5 outline-none"
          value={facilityType}
          onChange={(e) => setFacilityType(e.target.value as FacilityType)}
        >
          <option value="hotel">ホテル</option>
          <option value="office">会社・オフィス</option>
        </select>
      </label>
      <label className="mt-4 block text-xs text-navy/60">
        受付のあいさつ
        <textarea
          className="mt-1 min-h-24 w-full rounded-xl border border-[var(--line)] bg-ivory px-3 py-2.5 outline-none focus:border-gold"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
        />
      </label>
      <label className="mt-4 block text-xs text-navy/60">
        管理者暗証番号（4桁）
        <input
          inputMode="numeric"
          maxLength={4}
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-ivory px-3 py-2.5 outline-none focus:border-gold"
          value={adminPin}
          onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      <button type="submit" className="mt-6 rounded-full bg-navy px-6 py-3 text-sm text-ivory">
        {saved ? "保存しました" : "保存する"}
      </button>
    </form>
  );
}
