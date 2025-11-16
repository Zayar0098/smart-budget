"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import useClientStoredState from "./useClientStoredState";
import 'flag-icons/css/flag-icons.min.css';

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

const DEFAULT_CURRENCIES = ["JPY", "USD", "MMK", "NPR", "TWD", "VND", "RUB", "CNY", "KRW", "EUR"];

const currencyFlags: Record<string, string> = {
  JPY: 'jp',
  USD: 'us',
  MMK: 'mm',
  NPR: 'np',
  TWD: 'tw',
  VND: 'vn',
  RUB: 'ru',
  CNY: 'cn',
  KRW: 'kr',
  EUR: 'eu', 
};

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useClientStoredState<string>("sb_currency", "JPY");
  const [rates, setRates] = useState<Record<string, number>>({ JPY: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // NOTE: For security, the API key is expected to be loaded from the environment.
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || ""; 

  // --- Fetching Logic ---
  useEffect(() => {
    if (selected === undefined) return;
    let mounted = true;
    const fetchRates = async () => {
      setLoading(true);
      setError(undefined);
      try {
        // Use either the primary API (if key is set) or the fallback API
        let ratesData;

        // Use the primary API (ExchangeRate-API)
        if (API_KEY) {
          const r = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/JPY`);
          const d = await r.json();
          ratesData = d?.conversion_rates;
        } else {
          // Fallback to a free API (exchangerate.host) if API_KEY is missing
          const res = await fetch(
            `https://api.exchangerate.host/latest?base=JPY&symbols=${encodeURIComponent(
              DEFAULT_CURRENCIES.join(",")
            )}`
          );
          const d = await res.json();
          ratesData = d?.rates;
        }

        if (!mounted) return;
        setRates(ratesData ?? { JPY: 1 });

      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setError("レート取得に失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    // Fetch immediately and set interval for updates (30 minutes)
    fetchRates();
    const id = setInterval(fetchRates, 1000 * 60 * 30);
    
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selected, API_KEY]);

  // --- Conversion and Formatting Logic ---
    const convertFromJPY = useCallback((jpy: number) => {
      const code = selected ?? "JPY";
      const rate = rates[code] ?? 1;
      return (jpy || 0) * rate;
    }, [selected, rates]);
  
    const formatFromJPY = useCallback((jpy: number) => {
      const code = selected ?? "JPY";
      const value = convertFromJPY(jpy);
      
      // Ensure formatting works even if the browser doesn't recognize the currency
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: code,
          maximumFractionDigits: code === "JPY" ? 0 : 2,
        }).format(value);
      } catch {
        // Fallback format if Intl.NumberFormat fails for the currency code
        const flag = currencyFlags[code] || '';
        return `${flag} ${value.toFixed(2)} ${code}`;
      }
    }, [selected, convertFromJPY]);
  
    // --- Context Value ---
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
      [selected, loading, error, rates, formatFromJPY, convertFromJPY, setSelected] // Dependencies for useMemo
    );
  
  // Get the display string for the currently selected currency in the header
  // const selectedCurrencyDisplay = `${currencyFlags[selected ?? 'JPY'] || ''} ${selected ?? 'JPY'}`;

  const [open, setOpen] = useState(false);

  return (
    <CurrencyContext.Provider value={value}>
      <div style={{ borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
          <div style={{ fontWeight: 700 }}>Smart Budget</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <div style={{ fontSize: 12, color: "#666" }}>
    {loading ? "Loading" : error ? "レートエラー" : "Currency"}
  </div>
<div style={{ position: "relative" }}>
  <button
    onClick={() => setOpen(!open)}
    style={{ display: "flex", alignItems: "center", gap: 6 }}
  >
    <span className={`fi fi-${currencyFlags[selected ?? "JPY"]}`} />
    {selected}
  </button>

  {open && (
    <ul
      style={{
        position: "absolute",
        right: 0,
        top: "100%",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 6,
        marginTop: 4,
        listStyle: "none",
        padding: 0,
      }}
    >
      {DEFAULT_CURRENCIES.map((c) => (
        <li
          key={c}
          onClick={() => {
            setSelected(c);
            setOpen(false);
          }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: 6, cursor: "pointer" }}
        >
          <span className={`fi fi-${currencyFlags[c]}`} />
          {c}
        </li>
      ))}
    </ul>
  )}
</div>
</div>
        </div>
      </div>

      <div>{children}</div>
    </CurrencyContext.Provider>
  );
}