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
        categories 
    } = useSharedAppState();

    type Category = { spent?: number };
    const typedCategories: Category[] = categories as Category[];
    const totalSpent = typedCategories.reduce(
        (s: number, c: Category) => s + (c.spent || 0),
        0
    );

    const computedBalance = income - totalSpent;
    const balance = balanceOverride !== null ? balanceOverride : computedBalance;

    const [npVisible, setNpVisible] = useState(false);
    const [npTarget, setNpTarget] = useState<"income" | "limit" | "balance" | null>(null);

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
                    <button className={styles.editButton} onClick={() => openNp("income")}>
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
