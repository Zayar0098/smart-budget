"use client";

import { useState, useEffect, useCallback } from "react";

export default function useClientStoredState<T>(key: string, fallback: T) {
  // 初期は undefined にして、読み込み完了を判定できるようにする
  const [state, setState] = useState<T | undefined>(undefined);

  // --- Load from localStorage once on mount ---
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
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // --- Persist state to localStorage ---
  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const prevSafe = prev === undefined ? (fallback as T) : (prev as T);
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(prevSafe)
            : next;

        try {
          localStorage.setItem(key, JSON.stringify(resolved));

          // Dispatch cross-tab event
          window.dispatchEvent(
            new CustomEvent("sb_lsstorage", {
              detail: { key, value: JSON.stringify(resolved) },
            })
          );
        } catch {}
        return resolved;
      });
    },
    [key, fallback]
  );

  // --- Listen to cross-tab updates ---
  useEffect(() => {
    const handler = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (customEvt.detail.key === key) {
        try {
          const parsed = JSON.parse(customEvt.detail.value) as T;

          setState((prev) => {
            // Only update if value actually changed
            const prevStr = JSON.stringify(prev);
            const parsedStr = JSON.stringify(parsed);
            return prevStr === parsedStr ? prev : parsed;
          });
        } catch {}
      }
    };

    window.addEventListener("sb_lsstorage", handler);
    return () => window.removeEventListener("sb_lsstorage", handler);
  }, [key]);

  return [state, setAndPersist] as const;
}
