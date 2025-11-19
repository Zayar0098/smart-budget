"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css"

type Category = {
  id: string;
  name: string;
  spent: number;
  limit: number;
};

export default function SavingModePage() {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const raw = localStorage.getItem("sb_categories");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });


  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("sb_categories", JSON.stringify(categories));
    
    setEdits((prev) => {
      const next = { ...prev };
      categories.forEach((c) => {
        if (!(c.id in next)) next[c.id] = String(c.limit || "");
      });
      Object.keys(next).forEach((k) => {
        if (!categories.some((c) => c.id === k)) delete next[k];
      });
      return next;
    });
  }, [categories]);

  const formatYen = (n: number) =>
    n.toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    });

  const startEdit = (id: string) => {
    setEditingId(id);
    setEdits((prev) => ({
      ...prev,
      [id]: String(categories.find((c) => c.id === id)?.limit ?? ""),
    }));
  };

  const updateEditValue = (id: string, v: string) => {
    setEdits((prev) => ({ ...prev, [id]: v }));
  };

  const saveLimit = (id: string) => {
    const raw = edits[id] ?? "";
    const num = Number(raw || 0);
    if (isNaN(num) || num < 0) {
      alert("Please enter a valid limit (>=0).");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, limit: Math.round(num) } : c))
    );
    setEditingId(null);
  };

  const cancelEdit = (id: string) => {
    setEdits((prev) => ({
      ...prev,
      [id]: String(categories.find((c) => c.id === id)?.limit ?? ""),
    }));
    setEditingId(null);
  };

  const resetLimit = (id: string) => {
    if (!confirm("Do you want to reset the limit for this category?")) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, limit: 0 } : c))
    );
    setEdits((prev) => ({ ...prev, [id]: "0" }));
  };

  const setAllToZero = () => {
    if (!confirm("Do you want to set all category limits to 0?")) return;
    setCategories((prev) => prev.map((c) => ({ ...c, limit: 0 })));
    setEdits(() => {
      const next: Record<string, string> = {};
      categories.forEach((c) => (next[c.id] = "0"));
      return next;
    });
    setEditingId(null);
  };

  return (
    <div className={styles.container}>
      <h1>Saving Mode — Limit Management</h1>
      <p>
        Here you can set and edit the limit for each category.
      </p>

      {categories.length === 0 ? (
        <p>
          No category added.
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {categories.map((c) => {
              const percent =
                c.limit > 0
                  ? Math.min(100, Math.round((c.spent / c.limit) * 100))
                  : 0;
              const editVal = edits[c.id] ?? String(c.limit ?? "");
              return (
                <div
                  key={c.id}
                  className={styles.card}
                >
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
                        {formatYen(c.spent)} spent
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
                        Limit : {c.limit > 0 ? formatYen(c.limit) : "Not set"}{" "}
                        ・ Usage : {percent}%
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.rightButtons}
                  >
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
                        <button onClick={() => cancelEdit(c.id)}>
                          Cancel
                        </button>
                        <button onClick={() => resetLimit(c.id)}>
                          Reset
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c.id)}>Edit</button>
                        <button onClick={() => resetLimit(c.id)}>
                          Reset
                        </button>
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
    </div>
  );
}