"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import useClientStoredState from "./useClientStoredState";

type Ctx = {
  selected: string;
  setSelected: (c: string) => void;
  formatFromJPY: (jpy: number) => string;
  convertFromJPY: (jpy: number) => number;
  loading: boolean;
  error?: string;
  rates: Record<string, number>;
};

const CurrencyContext = createContext<Ctx | undefined>(undefined);
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

const DEFAULT_CURRENCIES = ["JPY", "USD", "MMK", "NPR", "TWD", "VND", "RUB" ,"CNY", "KRW" , "EUR"];

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useClientStoredState<string>("sb_currency", "JPY");
  const [rates, setRates] = useState<Record<string, number>>({ JPY: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || "";

  useEffect(() => {
    if (selected === undefined) return;
    let mounted = true;
    const fetchRates = async () => {
      setLoading(true);
      setError(undefined);
      try {
        if (API_KEY) {
          const r = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/JPY`);
          const d = await r.json();
          if (!mounted) return;
          setRates(d?.conversion_rates ?? { JPY: 1 });
        } else {
          const res = await fetch(
            `https://api.exchangerate.host/latest?base=JPY&symbols=${encodeURIComponent(
              DEFAULT_CURRENCIES.join(",")
            )}`
          );
          const d = await res.json();
          if (!mounted) return;
          setRates(d?.rates ?? { JPY: 1 });
        }
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setError("レート取得に失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRates();
    const id = setInterval(fetchRates, 1000 * 60 * 30);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selected, API_KEY]);

  const convertFromJPY = (jpy: number) => {
    const code = selected ?? "JPY";
    const rate = rates[code] ?? 1;
    return (jpy || 0) * rate;
  };

  const formatFromJPY = (jpy: number) => {
    const code = selected ?? "JPY";
    const value = convertFromJPY(jpy);
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        maximumFractionDigits: code === "JPY" ? 0 : 2,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${code}`;
    }
  };

  const value = useMemo(
    () => ({
      selected: selected ?? "JPY",
      setSelected: (c: string) => setSelected(c),
      formatFromJPY,
      convertFromJPY,
      loading,
      error,
      rates,
    }),
    [selected, loading, error, rates]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {/* ヘッダー：ドロップダウンのみ */}
      <div style={{ borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
          <div style={{ fontWeight: 700 }}>Smart Budget</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{loading ? "レート取得中…" : error ? "レートエラー" : "表示通貨"}</div>
            <select
              value={selected ?? "JPY"}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="通貨選択"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff" }}
            >
              {DEFAULT_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>{children}</div>
    </CurrencyContext.Provider>
  );
}
