"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * localStorage ベースの state フック。
 * - SSR 側は undefined を返し、クライアントマウント後に値を読み込む（Hydration 安全）。
 * - 他タブからの storage イベントおよび同一タブ内のカスタムイベントで同期される。
 */
export default function useClientStoredState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T | undefined>(undefined);

  // load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setState(JSON.parse(raw) as T);
      } else {
        setState(fallback);
      }
    } catch {
      setState(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // listen storage events (other tabs) and custom event (same tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setState(e.newValue ? (JSON.parse(e.newValue) as T) : fallback);
      } catch {
        setState(fallback);
      }
    };
    const onCustom = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (!detail || detail.key !== key) return;
        setState(detail.value ? (JSON.parse(detail.value) as T) : fallback);
      } catch {
        setState(fallback);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sb_lsstorage", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sb_lsstorage", onCustom as EventListener);
    };
  }, [key, fallback]);

  // setter that persists and broadcasts to same-tab listeners
  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prevState) => {
        // when prevState is undefined (not loaded yet), try to use fallback as previous
        const prevSafe = (prevState === undefined ? fallback : prevState) as T;
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prevSafe) : next;
        try {
          const raw = JSON.stringify(resolved);
          localStorage.setItem(key, raw);
          // broadcast same-tab
          window.dispatchEvent(
            new CustomEvent("sb_lsstorage", { detail: { key, value: raw } })
          );
        } catch {}
        return resolved;
      });
    },
    [key, fallback]
  );

  return [state, setAndPersist] as const;
}
