"use client";

import { useState } from "react";
import useClientStoredState from "@/components/useClientStoredState";
import NumberPad from "@/components/NumberPad";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCurrency } from "@/components/CurrencyProvider";

type HistoryEntry = { id: string; amount: number; timestamp: string };
type Category = {
  id: string;
  name: string;
  limit: number;
  history?: HistoryEntry[];
};

export default function HomePage() {
  const [categories, setCategories] = useClientStoredState<Category[]>(
    "sb_categories",
    [
      { id: "rent-house", name: "Rent-house", limit: 0, history: [] },
      { id: "gas-bill", name: "Gas", limit: 0, history: [] },
      { id: "electric", name: "Electric", limit: 0, history: [] },
      { id: "water", name: "Water", limit: 0, history: [] },
    ]
  );

  const [income, setIncome] = useClientStoredState<number>("sb_income", 0);
  const [balanceOverride, setBalanceOverride] = useClientStoredState<
    number | null
  >("sb_balance_override", null);
  const [limit, setLimit] = useClientStoredState<number>("sb_limit", 0);

  const { formatFromJPY } = useCurrency();

  // UI states
  const [popupFor, setPopupFor] = useState<string | null>(null);
  const [npVisible, setNpVisible] = useState(false);
  const [npTargetCategory, setNpTargetCategory] = useState<string | null>(null);
  const [npTargetHistoryId, setNpTargetHistoryId] = useState<string | null>(
    null
  );
  const [npInitialValue, setNpInitialValue] = useState<string>("");
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // loading guard: wait for stored states to load to avoid showing transient zeros
  if (
    categories === undefined ||
    income === undefined ||
    balanceOverride === undefined ||
    limit === undefined
  ) {
    return <div className={styles.container}>読み込み中…</div>;
  }

  // --- Helper to generate unique IDs ---
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // --- Handlers ---
  const addHistoryEntry = (catId: string, amount: number) => {
    const entry: HistoryEntry = {
      id: generateId(),
      amount: Math.round(amount),
      timestamp: new Date().toISOString(),
    };

    setCategories((prev) =>
      (prev || []).map((c) =>
        c.id === catId ? { ...c, history: [...(c.history || []), entry] } : c
      )
    );
  };

  const updateExistingHistoryEntry = (
    catId: string,
    entryId: string,
    newAmount: number
  ) => {
    setCategories((prev) =>
      (prev || []).map((c) => {
        if (c.id !== catId) return c;
        const updatedHistory = (c.history || []).map((h) =>
          h.id === entryId ? { ...h, amount: newAmount } : h
        );
        return { ...c, history: updatedHistory };
      })
    );
  };

  const openNumberPadForEdit = (
    catId: string,
    entryId: string,
    currentAmount: number
  ) => {
    setNpTargetCategory(catId);
    setNpTargetHistoryId(entryId);
    setNpInitialValue(String(currentAmount));
    setNpVisible(true);
  };

  const openNumberPadForAdd = (catId: string) => {
    setNpTargetCategory(catId);
    setNpTargetHistoryId(null);
    setNpInitialValue("");
    setNpVisible(true);
  };

  const addCategoryConfirmed = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const idBase = trimmed.toLowerCase().replace(/\s+/g, "-");
    let id = idBase;
    let i = 1;
    while ((categories || []).some((c) => c.id === id)) id = `${idBase}-${i++}`;
    setCategories((prev) => [
      ...(prev || []),
      { id, name: trimmed, limit: 0, history: [] },
    ]);
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => (prev || []).filter((c) => c.id !== catId));
    closeCategoryPopup();
  };

  const openCategoryPopup = (catId: string) => setPopupFor(catId);
  const closeCategoryPopup = () => {
    setPopupFor(null);
    setNpVisible(false);
    setNpTargetCategory(null);
    setNpTargetHistoryId(null);
    setNpInitialValue("");
  };

  // --- Date helpers for "this month" filtering ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const isInCurrentMonth = (isoTs: string) => {
    try {
      const d = new Date(isoTs);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    } catch {
      return false;
    }
  };

  // --- Calculations (only this month) ---
  // per-category spent this month map
  const monthlySpentByCategory = new Map<string, number>();
  (categories || []).forEach((cat) => {
    const s = (cat.history || [])
      .filter((h) => isInCurrentMonth(h.timestamp))
      .reduce((acc, h) => acc + h.amount, 0);
    monthlySpentByCategory.set(cat.id, s);
  });

  const totalSpentThisMonth = Array.from(
    monthlySpentByCategory.values()
  ).reduce((s, v) => s + v, 0);

  // Balance is income minus this month's spending
  const computedBalanceThisMonth = (income || 0) - totalSpentThisMonth;
  // keep override if set (override assumed to be absolute value user set)
  const displayedBalance = balanceOverride ?? computedBalanceThisMonth;

  const monthlyRemainingSafe = Math.max(0, (limit || 0) - totalSpentThisMonth);

  // Search filter
  const filteredCategories = (categories || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---
  const current = popupFor
    ? (categories || []).find((c) => c.id === popupFor) ?? null
    : null;

  // Group history by date (show all history but grouped; you can filter to only current month if desired)
  const historyByDate: Record<string, HistoryEntry[]> = {};
  if (current) {
    (current.history || []).forEach((h) => {
      const d = new Date(h.timestamp).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (!historyByDate[d]) historyByDate[d] = [];
      historyByDate[d].push(h);
    });
  }

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.incomeDisplay}>
          <div className={styles.infoTitle}>Income</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {formatFromJPY(income || 0)}
          </div>
        </div>
        <div className={styles.incomeDisplay}>
          <div className={styles.infoTitle}>Balance (This month)</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {formatFromJPY(displayedBalance)}
          </div>
        </div>
      </div>

      {/* Limit / Balance band */}
      <div className={styles.balanceBand}>
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>
            Monthly Limit : {formatFromJPY(limit || 0)}
          </div>
          <div className={styles.infoTitle}>
            Remaining : {formatFromJPY(monthlyRemainingSafe)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: 0, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            outline: "none",
          }}
        />
      </div>

      {/* Category grid */}
      <div className={styles.categoryGrid}>
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={styles.categoryItem}
            onClick={() => openCategoryPopup(cat.id)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.categoryHeader}>
              <strong>{cat.name}</strong>
            </div>
            <div className={styles.spentAmount}>
              {/* show only this month's sum for the category */}
              {formatFromJPY(monthlySpentByCategory.get(cat.id) || 0)}
              <div style={{ fontSize: 9, textAlign: "center", color: "#999" }}>
              Limit : {cat.limit > 0 ? formatFromJPY(cat.limit) : "-"}
            </div>
            </div>
            
          </div>
        ))}

        {/* Add new category button */}
        <div className={styles.newCategoryButtonContainer}>
          <button
            onClick={() => {
              setNewCatName("");
              setNewCatModalOpen(true);
            }}
            className={styles.newCategoryButton}
            aria-label="Add category"
          >
            ＋
          </button>
        </div>
      </div>

      {/* Category popup */}
      {popupFor && current && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeCategoryPopup}
          className={styles.modalOverlay}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.modalContent}
          >
            <div
              style={{
                padding: 12,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>{current.name}</div>
              <button
                aria-label={`Delete ${current.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(current.id);
                }}
                style={{
                  color: "#fff",
                  backgroundColor: "#ff3d3dff",
                }}
              >
                Delete
              </button>
            </div>

            <div style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Amount (This month)
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {formatFromJPY(monthlySpentByCategory.get(current.id) || 0)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => openNumberPadForAdd(current.id)}
                    style={{
                      padding: "8px 12px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    ＋
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}
                >
                  History
                </div>
                {(current.history || []).length === 0 ? (
                  <div style={{ color: "#666" }}>No History</div>
                ) : (
                  <ul className={styles.historyList}>
                    {Object.keys(historyByDate)
                      .sort((a, b) => b.localeCompare(a))
                      .map((date) => (
                        <li key={date} className={styles.historyDateGroup}>
                          <div className={styles.historyDateHeader}>{date}</div>

                          {historyByDate[date]
                            .sort((a, b) =>
                              b.timestamp.localeCompare(a.timestamp)
                            )
                            .map((h) => (
                              <div key={h.id} className={styles.historyRow}>
                                <div className={styles.historyAmount}>
                                  {formatFromJPY(h.amount)}
                                </div>

                                <div className={styles.historyTime}>
                                  {new Date(h.timestamp).toLocaleTimeString(
                                    "ja-JP",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>

                                <div className={styles.historyActions}>
                                  <button
                                    onClick={() =>
                                      openNumberPadForEdit(
                                        current.id,
                                        h.id,
                                        h.amount
                                      )
                                    }
                                    className={styles.historyEditButton}
                                  >
                                    <FontAwesomeIcon icon={faPen} />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCategories((prev) =>
                                        (prev || []).map((c) => {
                                          if (c.id !== current.id) return c;
                                          const nextHistory = (
                                            c.history || []
                                          ).filter((x) => x.id !== h.id);
                                          return { ...c, history: nextHistory };
                                        })
                                      );
                                    }}
                                    className={styles.historyDeleteButton}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {newCatModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setNewCatModalOpen(false)}
          className={styles.modalOverlay}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.modalCategory}
            style={{ padding: 16 }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Create new category
            </div>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setNewCatModalOpen(false)}
                style={{ padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCatName.trim())
                    return console.error("名前を入力してください");
                  addCategoryConfirmed(newCatName);
                  setNewCatModalOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NumberPad */}
      <NumberPad
        visible={npVisible}
        initial={npInitialValue}
        onClose={closeCategoryPopup}
        onConfirm={(value) => {
          if (!npTargetCategory) return;

          if (npTargetHistoryId) {
            updateExistingHistoryEntry(
              npTargetCategory,
              npTargetHistoryId,
              value
            );
          } else {
            addHistoryEntry(npTargetCategory, value);
          }

          closeCategoryPopup();
        }}
      />
      <div style={{ height: "60px" }} aria-hidden="true" />
    </div>
  );
}
