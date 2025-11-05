"use client";

import { useEffect, useState } from "react";
import NumberPad from "@/components/NumberPad";

export default function IncomePage() {
  const [income, setIncome] = useState<number>(() => {
    const raw = localStorage.getItem("sb_income");
    return raw ? Number(raw) : 0;
  });
  const [limit, setLimit] = useState<number>(() => {
    const raw = localStorage.getItem("sb_limit");
    return raw ? Number(raw) : 0;
  });
  // If user wants to override balance manually, store as override; null = computed
  const [balanceOverride, setBalanceOverride] = useState<number | null>(() => {
    const raw = localStorage.getItem("sb_balance_override");
    return raw ? Number(raw) : null;
  });

  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem("sb_categories");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // sync categories when localStorage changes (other pages)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sb_categories") {
        try {
          setCategories(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totalSpent = categories.reduce(
    (s: number, c: any) => s + (c.spent || 0),
    0
  );
  const computedBalance = income - totalSpent;
  const balance = balanceOverride !== null ? balanceOverride : computedBalance;

  // NumberPad control
  const [npVisible, setNpVisible] = useState(false);
  const [npTarget, setNpTarget] = useState<
    "income" | "limit" | "balance" | null
  >(null);

  const openNp = (target: "income" | "limit" | "balance") => {
    setNpTarget(target);
    setNpVisible(true);
  };

  const onConfirmNp = (value: number) => {
    if (npTarget === "income") {
      setIncome(value);
      localStorage.setItem("sb_income", String(value));
    } else if (npTarget === "limit") {
      setLimit(value);
      localStorage.setItem("sb_limit", String(value));
    } else if (npTarget === "balance") {
      setBalanceOverride(value);
      localStorage.setItem("sb_balance_override", String(value));
    }
    setNpVisible(false);
    setNpTarget(null);
  };

  const clearBalanceOverride = () => {
    if (!confirm("手動バランス上書きを解除して自動計算に戻しますか？")) return;
    setBalanceOverride(null);
    localStorage.removeItem("sb_balance_override");
  };

  const formatYen = (n: number) =>
    n.toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    });

  return (
    <div style={{ padding: 20 }}>
      <h1>Income</h1>

      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <div
          style={{
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#666" }}>Income</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {formatYen(income)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openNp("income")}>編集</button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#666" }}>Limit</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {limit > 0 ? formatYen(limit) : "未設定"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openNp("limit")}>編集</button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#666" }}>
              Balance ({balanceOverride !== null ? "手動" : "自動"})
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {formatYen(balance)}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              Total Spent: {formatYen(totalSpent)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openNp("balance")}>編集</button>
            {balanceOverride !== null && (
              <button onClick={clearBalanceOverride}>自動に戻す</button>
            )}
          </div>
        </div>
      </div>

      <NumberPad
        visible={npVisible}
        initial={String(
          npTarget === "income"
            ? income
            : npTarget === "limit"
            ? limit
            : balance
        )}
        onClose={() => setNpVisible(false)}
        onConfirm={onConfirmNp}
      />
    </div>
  );
}
