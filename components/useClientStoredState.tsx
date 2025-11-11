"use client";

import { useEffect, useState, useCallback } from "react";

export default function useClientStoredState<T>(
  key: string,
  fallback: T | undefined = undefined
) {
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
      else setState(fallback as T);
    } catch {
      setState(fallback as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (state === undefined) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent("sb_lsstorage", {
          detail: { key, value: JSON.stringify(state) },
        })
      );
    } catch {}
  }, [key, state]);

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const prevSafe = (prev === undefined ? (fallback as T) : prev) as T;
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prevSafe) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
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

  return [state, setAndPersist] as const;
}
