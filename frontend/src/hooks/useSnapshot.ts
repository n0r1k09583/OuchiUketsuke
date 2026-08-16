"use client";

import { useCallback, useEffect, useState } from "react";
import type { Snapshot } from "@/lib/types";

export function useSnapshot(intervalMs = 1600) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/snapshot", { cache: "no-store" });
      if (!res.ok) throw new Error("読み込みに失敗しました");
      const json = (await res.json()) as Snapshot;
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => void refresh(), 0);
    const id = window.setInterval(() => void refresh(), intervalMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [refresh, intervalMs]);

  return { data, error, refresh };
}
