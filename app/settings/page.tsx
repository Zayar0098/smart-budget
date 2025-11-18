"use client";

import { useState } from "react";
import NumberPad from "@/components/NumberPad";
// 既存のuseSharedAppStateを新しいものに置き換える
import useSharedAppState from "../../hooks/useSharedAppState"; 

export default function Page() {
    // データの読み込みと更新をカスタムフックに一元化
    const { 
        income, 
        setIncome, 
        limit, 
        setLimit, 
        balanceOverride, 
        setBalanceOverride, 
        categories 
    } = useSharedAppState(); 
    
    // ... (既存の totalSpent, computedBalance, balance の計算ロジックはそのまま) ...

    type Category = { spent?: number };
    const typedCategories: Category[] = categories as Category[];
    const totalSpent = typedCategories.reduce(
        (s: number, c: Category) => s + (c.spent || 0),
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
        // setIncome, setLimit, setBalanceOverride はフック内の同期関数に置き換え
        if (npTarget === "income") {
            setIncome(value);
        } else if (npTarget === "limit") {
            setLimit(value);
        } else if (npTarget === "balance") {
            setBalanceOverride(value);
        }
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
        <div style={{ padding: "16px", maxWidth: "960px", margin: "0 auto" }}>
            <h1>Settings</h1>

            <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
                {/* Income Card */}
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
                        <button onClick={() => openNp("income")}>Edit</button>
                    </div>
                </div>

                {/* Limit Card */}
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
                            {limit > 0 ? formatYen(limit) : "Not set"}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openNp("limit")}>Edit</button>
                    </div>
                </div>

                {/* Balance Card */}
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
                            Balance 
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>
                            {formatYen(balance)}
                        </div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
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