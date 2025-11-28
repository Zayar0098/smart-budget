"use client";

import { useState } from "react";
import NumberPad from "@/components/NumberPad";
import useSharedAppState from "../../hooks/useSharedAppState";
import styles from "./page.module.css";

export default function Page() {
  const {
    income,
    setIncome,
    limit,
    setLimit,
    balanceOverride,
    setBalanceOverride,
    categories,
  } = useSharedAppState();

  type HistoryEntry = { id: string; amount: number; timestamp: string };

  // --- Move date helpers here (before using isInCurrentMonth) ---
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth(); // 0-based

  const isInCurrentMonth = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === cy && d.getMonth() === cm;
  };

  // loading guard
  if (
    categories === undefined ||
    income === undefined ||
    limit === undefined ||
    balanceOverride === undefined
  ) {
    return <div>読み込み中…</div>;
  }

  const totalSpent = (categories || []).reduce((sum, c: any) => {
    const hist: HistoryEntry[] = Array.isArray(c.history) ? c.history : [];
    const thisMonth = hist
      .filter((h) => isInCurrentMonth(h.timestamp))
      .reduce((s, h) => s + (Number(h.amount) || 0), 0);
    return sum + thisMonth;
  }, 0);

  const computedBalance = (income || 0) - totalSpent;
  const balance = balanceOverride !== null ? balanceOverride : computedBalance;

  const [npVisible, setNpVisible] = useState(false);
  const [npTarget, setNpTarget] = useState<
    "income" | "limit" | "balance" | null
  >(null);

  const openNp = (target: "income" | "limit" | "balance") => {
    setNpTarget(target);
    setNpVisible(true);
  };

  const onConfirmNp = (value: number) => {
    if (npTarget === "income") setIncome(value);
    else if (npTarget === "limit") setLimit(value);
    else if (npTarget === "balance") setBalanceOverride(value);

    setNpVisible(false);
    setNpTarget(null);
  };

  const formatYen = (n: number) =>
    n.toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      <div className={styles.cardGrid}>
        {/* Income */}
        <div className={styles.card}>
          <div>
            <div className={styles.cardLabel}>Income</div>
            <div className={styles.cardValue}>{formatYen(income)}</div>
          </div>
          <button
            className={styles.editButton}
            onClick={() => openNp("income")}
          >
            Edit
          </button>
        </div>

        {/* Limit */}
        <div className={styles.card}>
          <div>
            <div className={styles.cardLabel}>Monthly Limit</div>
            <div className={styles.cardValue}>
              {limit > 0 ? formatYen(limit) : "Not set"}
            </div>
          </div>
          <button className={styles.editButton} onClick={() => openNp("limit")}>
            Edit
          </button>
        </div>

        {/* Balance */}
        <div className={styles.card}>
          <div>
            <div className={styles.cardLabel}>Balance</div>
            <div className={styles.cardValue}>{formatYen(balance)}</div>

            <div className={styles.spentText}>
              Total Spent: {formatYen(totalSpent)}
            </div>
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
