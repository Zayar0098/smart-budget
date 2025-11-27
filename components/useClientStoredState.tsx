"use client";

import { useState, useEffect, useCallback } from "react";

export default function useClientStoredState<T>(key: string, fallback: T) {
  // 初期は undefined にして、読み込み完了を判定できるようにする
  const [state, setState] = useState<T | undefined>(undefined);

  // --- Load from localStorage once on mount ---
  useEffect(() => {
    try {
      // 🚨 Safety Check for window 🚨
      if (typeof window === 'undefined') {
        setState(fallback);
        return;
      }
      
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

  // --- Persist state to localStorage and prepare for dispatch ---
  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const prevSafe = prev === undefined ? (fallback as T) : (prev as T);
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(prevSafe)
            : next;

        try {
          // Synchronous update of localStorage remains for persistence
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {}
        
        // Removed: window.dispatchEvent(...) from here!
        
        return resolved;
      });
    },
    [key, fallback]
  );
  
  // --- NEW: Asynchronously Dispatch Cross-tab Event on state change ---
  useEffect(() => {
    // Only dispatch if state is loaded (not undefined)
    if (state !== undefined) {
        try {
            // Ensure localStorage is set to the current state before dispatching
            const resolvedValue = JSON.stringify(state);

            // Dispatch event outside of the synchronous state update
            window.dispatchEvent(
              new CustomEvent("sb_lsstorage", {
                detail: { key, value: resolvedValue },
              })
            );
        } catch {}
    }
  }, [key, state]); // Dispatch whenever state or key changes

  // --- Listen to cross-tab updates ---
  useEffect(() => {
    const handler = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (customEvt.detail.key === key) {
        try {
          const parsed = JSON.parse(customEvt.detail.value) as T;

          setState((prev) => {
            // Deep equality check for objects/arrays to prevent infinite loop
            const prevStr = JSON.stringify(prev);
            const parsedStr = JSON.stringify(parsed);
            
            // Only update if value actually changed
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