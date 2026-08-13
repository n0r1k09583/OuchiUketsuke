"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "ouchi-uketsuke-admin";

export function useAdminSession() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSignedIn(sessionStorage.getItem(KEY) === "1");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const login = useCallback(async (pin: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      throw new Error(json.error ?? "ログインできませんでした");
    }
    sessionStorage.setItem(KEY, "1");
    setSignedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setSignedIn(false);
  }, []);

  return { ready: signedIn !== null, signedIn: signedIn === true, login, logout };
}
