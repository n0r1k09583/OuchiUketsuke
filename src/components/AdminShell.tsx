"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import { useSnapshot } from "@/hooks/useSnapshot";

export function AdminShell({ children }: { children: ReactNode }) {
  const { ready, signedIn, login, logout } = useAdminSession();
  const { data } = useSnapshot(4000);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  if (!ready) {
    return <div className="grain min-h-full flex-1" />;
  }

  if (!signedIn) {
    return (
      <div className="grain flex min-h-full flex-1 items-center justify-center px-6">
        <form
          className="w-full max-w-sm rounded-3xl bg-paper p-8 shadow-[0_16px_40px_rgba(16,36,60,0.08)]"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            login(pin).catch((err: unknown) =>
              setError(err instanceof Error ? err.message : "ログインできませんでした"),
            );
          }}
        >
          <p className="text-[11px] tracking-[0.24em] text-gold">STAFF</p>
          <h1 className="mt-2 font-serif text-3xl text-navy">管理者ログイン</h1>
          <p className="mt-3 text-sm leading-6 text-navy/65">
            ご自宅から受付を担当します。4桁の暗証番号を入力してください。
          </p>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="mt-6 w-full rounded-2xl border border-[var(--line)] bg-ivory px-5 py-4 text-center text-2xl tracking-[0.4em] outline-none focus:border-gold"
          />
          {error && <p className="mt-3 text-sm text-[var(--alert)]">{error}</p>}
          <button type="submit" className="mt-6 w-full rounded-2xl bg-navy py-4 font-semibold text-ivory">
            入室する
          </button>
          <p className="mt-4 text-center text-xs text-navy/45">初期値は 1234 です</p>
        </form>
      </div>
    );
  }

  const unread = data?.notifications.filter((n) => !n.read).length ?? 0;
  const links = [
    { href: "/admin", label: "本日の受付" },
    { href: "/admin/schedule", label: "スケジュール" },
    { href: "/admin/settings", label: "設定" },
  ];

  return (
    <div className="grain flex min-h-full flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
        <div>
          <p className="text-[11px] tracking-[0.24em] text-gold">AT HOME</p>
          <h1 className="font-serif text-2xl text-navy">
            {data?.settings.facilityName ?? "おうち受付"}
          </h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm ${
                pathname === l.href ? "bg-navy text-ivory" : "text-navy/70 hover:bg-paper"
              }`}
            >
              {l.label}
              {l.href === "/admin" && unread > 0 ? (
                <span className="ml-2 rounded-full bg-[var(--alert)] px-2 py-0.5 text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
          ))}
          <button type="button" onClick={logout} className="ml-2 text-sm text-navy/50">
            ログアウト
          </button>
        </nav>
      </header>
      <div className="gold-rule" />
      <div className="flex-1 px-5 py-6 md:px-8">{children}</div>
    </div>
  );
}
