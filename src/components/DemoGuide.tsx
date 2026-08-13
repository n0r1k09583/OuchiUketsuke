"use client";

import { addDaysISO, todayISO } from "@/lib/format";
import { DEMO_ADMIN_PIN, DEMO_SAMPLES } from "@/lib/demoSamples";
import { useSnapshot } from "@/hooks/useSnapshot";

export function DemoGuide() {
  const { data } = useSnapshot(8000);
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);

  const live = (data?.appointments ?? [])
    .filter((a) => a.date === today || a.date === tomorrow)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const rows =
    live.length > 0
      ? live.map((a) => {
          const sample = DEMO_SAMPLES.find((s) => s.visitCode === a.visitCode);
          return {
            visitCode: a.visitCode,
            visitorName: a.visitorName,
            visitorOrg: a.visitorOrg,
            purpose: a.purpose,
            startTime: a.startTime,
            dayLabel: a.date === today ? "本日" : "翌日",
            hint: sample?.hint ?? (a.date === today ? "到着 → チェックアウト／帰宅" : "スケジュールで確認"),
          };
        })
      : DEMO_SAMPLES.map((s) => ({
          visitCode: s.visitCode,
          visitorName: s.visitorName,
          visitorOrg: s.visitorOrg,
          purpose: s.purpose,
          startTime: s.startTime,
          dayLabel: s.day === "today" ? "本日" : "翌日",
          hint: s.hint,
        }));

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-paper p-6 md:p-8">
      <p className="text-xs tracking-[0.2em] text-gold">DEMO</p>
      <h2 className="mt-2 font-serif text-2xl text-navy">試す番号</h2>
      <p className="mt-2 text-sm leading-7 text-navy/70">
        ブラウザを2つ開き、一方を受付画面、他方を管理者画面にすると流れがわかります。
        管理者の暗証番号は{" "}
        <span className="font-mono text-base font-semibold text-navy">{DEMO_ADMIN_PIN}</span> です。
      </p>

      <ol className="mt-5 grid gap-2 text-sm leading-7 text-navy/75 md:grid-cols-2">
        <li>1. 受付 →「ご予約の方」→ 下の番号を入れる →「到着を知らせる」</li>
        <li>2. 管理者に到着通知が届く。必要なら「お客様と話す」</li>
        <li>3. 受付 →「チェックアウト／お帰り」→ 同じ番号を入れる</li>
        <li>4. 管理者に帰宅通知が届き、スケジュールの状態も変わる</li>
      </ol>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-xs tracking-wide text-navy/50">
              <th className="py-2 pr-3 font-medium">番号</th>
              <th className="py-2 pr-3 font-medium">お名前</th>
              <th className="py-2 pr-3 font-medium">用件</th>
              <th className="py-2 pr-3 font-medium">時刻</th>
              <th className="py-2 font-medium">試し方</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.dayLabel}-${row.visitCode}`} className="border-b border-[var(--line)] last:border-b-0">
                <td className="py-3 pr-3 font-mono text-lg font-semibold text-navy">{row.visitCode}</td>
                <td className="py-3 pr-3 text-navy">
                  {row.visitorName}
                  {row.visitorOrg ? (
                    <span className="mt-0.5 block text-xs text-navy/50">{row.visitorOrg}</span>
                  ) : null}
                </td>
                <td className="py-3 pr-3 text-navy/75">{row.purpose}</td>
                <td className="py-3 pr-3 whitespace-nowrap text-navy/70">
                  <span className="mr-2 rounded-full bg-ivory px-2 py-0.5 text-[11px]">{row.dayLabel}</span>
                  {row.startTime}
                </td>
                <td className="py-3 text-navy/60">{row.hint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
