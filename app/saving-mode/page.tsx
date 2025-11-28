"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useClientStoredState from "@/components/useClientStoredState";

type HistoryEntry = { id: string; amount: number; timestamp: string };
type Category = {
  id: string;
  name: string;
  limit?: number;
  history?: HistoryEntry[];
};

export default function SavingModePage() {
  const [categories, setCategories] = useClientStoredState<Category[]>(
    "sb_categories",
    []
  );
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // loading guard
  const loading = categories === undefined;

  // Date helpers for current month
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth(); // 0-based

  const isInCurrentMonth = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === cy && d.getMonth() === cm;
  };

  // compute this-month spent per category and normalize missing fields
  const normalized = (categories || []).map((c) => {
    const history = Array.isArray(c.history) ? c.history : [];
    const spentThisMonth = history
      .filter((h) => isInCurrentMonth(h.timestamp))
      .reduce((s, h) => s + (Number(h.amount) || 0), 0);
    return {
      ...c,
      limit: Number(c.limit || 0) || 0,
      spentThisMonth,
    };
  });

  useEffect(() => {
    // initialize edits map for limits
    setEdits((prev) => {
      const next = { ...prev };
      normalized.forEach((c) => {
        if (!(c.id in next)) next[c.id] = String(c.limit ?? "");
      });
      // remove keys for deleted categories
      Object.keys(next).forEach((k) => {
        if (!normalized.some((c) => c.id === k)) delete next[k];
      });
      return next;
    });
    // persist normalization to localStorage only for shape safety (optional)
    // setCategories(normalized.map(({ spentThisMonth, ...rest }) => rest));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const formatYen = (n: number) =>
    (Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0).toLocaleString(
      "ja-JP",
      {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0,
      }
    );

  const startEdit = (id: string) => {
    setEditingId(id);
    setEdits((prev) => ({
      ...prev,
      [id]: String(normalized.find((c) => c.id === id)?.limit ?? ""),
    }));
  };

  const updateEditValue = (id: string, v: string) =>
    setEdits((prev) => ({ ...prev, [id]: v }));

  const saveLimit = (id: string) => {
    const raw = edits[id] ?? "";
    const num = Math.round(Number(raw || 0));
    if (isNaN(num) || num < 0) return alert("正しい数値を入力してください");
    setCategories((prev) =>
      (prev || []).map((c) => (c.id === id ? { ...c, limit: num } : c))
    );
    setEditingId(null);
  };

  const resetLimit = (id: string) => {
    if (!confirm("このカテゴリのリミットをリセットしますか？")) return;
    setCategories((prev) =>
      (prev || []).map((c) => (c.id === id ? { ...c, limit: 0 } : c))
    );
    setEdits((prev) => ({ ...prev, [id]: "0" }));
  };

  const setAllToZero = () => {
    if (!confirm("すべてのカテゴリのリミットを0にしますか？")) return;
    setCategories((prev) => (prev || []).map((c) => ({ ...c, limit: 0 })));
    setEdits(() =>
      Object.fromEntries((categories || []).map((c) => [c.id, "0"]))
    );
    setEditingId(null);
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div>読み込み中…</div>
      ) : (
        <>
          <h2>Saving Mode — Limit Management (This month)</h2>
          <p style={{ margin: "10px 0" }}>
            Here you can set and edit the limit for each category.
          </p>

          {normalized.length === 0 ? (
            <p>No category added.</p>
          ) : (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                {normalized.map((c) => {
                  const spent = Number(c.spentThisMonth || 0);
                  const lim = Number(c.limit || 0);
                  const percent =
                    lim > 0 ? Math.min(100, Math.round((spent / lim) * 100)) : 0;
                  const editVal = edits[c.id] ?? String(c.limit ?? "");
                  return (
                    <div key={c.id} className={styles.card}>
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: 13, color: "#666" }}>
                            {formatYen(spent)} spent
                          </div>
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <div
                            style={{
                              background: "#e6e6e6",
                              borderRadius: 6,
                              height: 10,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: "100%",
                                background: percent >= 100 ? "#dc2626" : "#4f46e5",
                              }}
                            />
                          </div>
                          <div style={{ marginTop: 6, fontSize: 13 }}>
                            Limit : {lim > 0 ? formatYen(lim) : "Not set"} ・ Usage
                            : {percent}%
                          </div>
                        </div>
                      </div>

                      <div className={styles.rightButtons}>
                        {editingId === c.id ? (
                          <>
                            <input
                              type="number"
                              value={editVal}
                              onChange={(e) =>
                                updateEditValue(c.id, e.target.value)
                              }
                              style={{ width: 100 }}
                            />
                            <button onClick={() => saveLimit(c.id)}>Save</button>
                            <button onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                            <button onClick={() => resetLimit(c.id)}>Reset</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(c.id)}>Edit</button>
                            <button onClick={() => resetLimit(c.id)}>Reset</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button onClick={setAllToZero}>Reset All</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
