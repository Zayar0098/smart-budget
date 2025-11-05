"use client";

import { useEffect, useState } from "react";

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

  // local edits for limits (string to keep user input until saved)
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("sb_categories", JSON.stringify(categories));
    // initialize edits for any new categories
    setEdits((prev) => {
      const next = { ...prev };
      categories.forEach((c) => {
        if (!(c.id in next)) next[c.id] = String(c.limit || "");
      });
      // remove edits for deleted categories
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
      alert("正しいリミットを入力してください（0以上の数値）。");
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
    if (!confirm("このカテゴリのリミットをリセットしますか？")) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, limit: 0 } : c))
    );
    setEdits((prev) => ({ ...prev, [id]: "0" }));
  };

  const setAllToZero = () => {
    if (!confirm("すべてのカテゴリのリミットを0にしますか？")) return;
    setCategories((prev) => prev.map((c) => ({ ...c, limit: 0 })));
    setEdits(() => {
      const next: Record<string, string> = {};
      categories.forEach((c) => (next[c.id] = "0"));
      return next;
    });
    setEditingId(null);
  };

  const saveAll = () => {
    // validate first
    for (const c of categories) {
      const raw = edits[c.id] ?? "";
      const num = Number(raw || 0);
      if (isNaN(num) || num < 0) {
        alert(`カテゴリ "${c.name}" のリミットが不正です。`);
        return;
      }
    }
    setCategories((prev) =>
      prev.map((c) => ({ ...c, limit: Math.round(Number(edits[c.id] || 0)) }))
    );
    setEditingId(null);
    alert("すべてのリミットを保存しました。");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Saving Mode — リミット管理</h1>
      <p>
        ここで各カテゴリのリミットを設定・編集します。Home
        ではリミットは表示されません。
      </p>

      {categories.length === 0 ? (
        <p>
          カテゴリが見つかりません。まず Home でカテゴリを作成してください。
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
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    borderRadius: 8,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
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
                        リミット: {c.limit > 0 ? formatYen(c.limit) : "未設定"}{" "}
                        ・ 使用率: {percent}%
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {editingId === c.id ? (
                      <>
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) =>
                            updateEditValue(c.id, e.target.value)
                          }
                          style={{ width: 140 }}
                        />
                        <button onClick={() => saveLimit(c.id)}>保存</button>
                        <button onClick={() => cancelEdit(c.id)}>
                          キャンセル
                        </button>
                        <button onClick={() => resetLimit(c.id)}>
                          リセット
                        </button>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            minWidth: 140,
                            textAlign: "right",
                            color: "#333",
                          }}
                        >
                          {c.limit > 0 ? formatYen(c.limit) : "未設定"}
                        </div>
                        <button onClick={() => startEdit(c.id)}>編集</button>
                        <button onClick={() => resetLimit(c.id)}>
                          リセット
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={saveAll}>すべて保存</button>
            <button onClick={setAllToZero}>すべて0にリセット</button>
          </div>
        </>
      )}
    </div>
  );
}
