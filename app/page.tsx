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
  spent: number;
  limit: number;
  history?: HistoryEntry[];
};

export default function HomePage() {
  const [categories, setCategories] = useClientStoredState<Category[]>(
    "sb_categories",
    [
      { id: "rent-house", name: "家賃", spent: 0, limit: 0, history: [] },
      { id: "gas-bill", name: "ガス代", spent: 0, limit: 0, history: [] },
      { id: "electric", name: "電気代", spent: 0, limit: 0, history: [] },
      { id: "water", name: "水道代", spent: 0, limit: 0, history: [] },
    ]
  );
  const [income] = useClientStoredState<number>("sb_income", 0);
  const [balanceOverride] = useClientStoredState<number | null>(
    "sb_balance_override",
    null
  );
  const [limit] = useClientStoredState<number>("sb_limit", 0);
  const { formatFromJPY } = useCurrency();

  const [popupFor, setPopupFor] = useState<string | null>(null);
  const [npVisible, setNpVisible] = useState(false);
  const [npTargetCategory, setNpTargetCategory] = useState<string | null>(null);
  const [npTargetHistoryId, setNpTargetHistoryId] = useState<string | null>(
    null
  );
  const [npInitialValue, setNpInitialValue] = useState<string>("");

  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  if (
    categories === undefined ||
    income === undefined ||
    balanceOverride === undefined
  ) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  const totalSpent = categories.reduce((s, c) => s + (c.spent || 0), 0);
  const computedBalance = (income || 0) - totalSpent;
  const balance = balanceOverride !== null ? balanceOverride : computedBalance;

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0–11

const totalSpentThisMonth = categories.reduce((sum, cat) => {
  const monthly = (cat.history || []).filter((h) => {
    const d = new Date(h.timestamp);
    return (
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth
    );
  });

  const catTotal = monthly.reduce((s, h) => s + h.amount, 0);
  return sum + catTotal;
}, 0);


  const addHistoryEntry = (catId: string, amount: number) => {
    const entry: HistoryEntry = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      amount: Math.round(amount),
      timestamp: new Date().toISOString(),
    };
    setCategories((prev) =>
      prev!.map((c) =>
        c.id === catId
          ? {
              ...c,
              spent: Math.round((c.spent || 0) + entry.amount),
              history: [...(c.history || []), entry],
            }
          : c
      )
    );
  };

  const updateExistingHistoryEntry = (
    catId: string,
    entryId: string,
    newAmount: number
  ) => {
    setCategories((prev) =>
      prev!.map((c) => {
        if (c.id !== catId) return c;

        let newTotalSpent = 0;

        const nextHistory = (c.history || []).map((h) => {
          if (h.id === entryId) {
            
            return { ...h, amount: newAmount };
          }
          return h;
        });

        
        newTotalSpent = nextHistory.reduce((s, x) => s + x.amount, 0);

        return { ...c, history: nextHistory, spent: newTotalSpent };
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
    const n = name.trim();
    if (!n) return;
    const idBase = n.toLowerCase().replace(/\s+/g, "-");
    let id = idBase;
    let i = 1;
    while (categories.some((c) => c.id === id)) id = `${idBase}-${i++}`;
    setCategories((prev) => [
      ...(prev || []),
      { id, name: n, spent: 0, limit: 0, history: [] },
    ]);
  };

  const openCategoryPopup = (catId: string) => {
    setPopupFor(catId);
  };
  const closeCategoryPopup = () => {
    setPopupFor(null);
    setNpVisible(false);
    setNpTargetCategory(null);
    setNpTargetHistoryId(null); 
    setNpInitialValue("");
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => prev!.filter((c) => c.id !== catId));
    closeCategoryPopup(); 
  };

  const current = popupFor
    ? categories.find((c) => c.id === popupFor) ?? null
    : null;
  const monthlyRemaining = (limit) - totalSpentThisMonth;
  const monthlyRemainingSafe = Math.max(0, monthlyRemaining);

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
          <div className={styles.infoTitle}>Balance</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {formatFromJPY(balance || 0)}
          </div>
        </div>
      </div>

      {/* Limit / Balance band */}
      <div className={styles.balanceBand}>
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Monthly Limit : {formatFromJPY(limit || 0)}</div>
          <div className={styles.infoTitle}>Remaining : {formatFromJPY(monthlyRemainingSafe)}
          </div>
        </div>
      </div>
      
      {/* Category grid */}
      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={styles.categoryItem}
            onClick={() => openCategoryPopup(cat.id)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.categoryHeader}>
              <strong style={{ fontSize: 14 }}>{cat.name}</strong>
              {/* Delete Button */}
              <button
                aria-label={`Delete ${cat.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat.id);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "#fff",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "red",
                }}
              >
            <FontAwesomeIcon icon={faTrash}/>
              </button>
            </div>

            <div className={styles.spentAmount}>{formatFromJPY(cat.spent)}</div>

            <div style={{ fontSize: 12, color: "#666", textAlign: "left" }}>
              <div>History : {(cat.history || []).length}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#999" }}>
                Limit : {cat.limit > 0 ? formatFromJPY(cat.limit) : "No limit"}
              </div>
            </div>
          </div>
        ))}

        {/* Center circular + button (opens new-category modal) */}
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

      {/* Category popup (small modal) */}
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
                onClick={closeCategoryPopup}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
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
                  <div style={{ fontSize: 12, color: "#666" }}>Amount</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {formatFromJPY(current.spent)}
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
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  History
                </div>
                {(current.history || []).length === 0 ? (
                  <div style={{ color: "#666" }}>No History</div>
                ) : (
                  <ul className={styles.historyList}>
                    {current
                      .history!.slice()
                      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                      .map((h) => (
                        <li key={h.id} className={styles.historyItem}>
                          {/* Section 1: Amount */}
                          <div className={styles.historyAmount}>
                            {formatFromJPY(h.amount)}
                          </div>

                          {/* Section 2: Timestamp */}
                          <div className={styles.historyDate}>
                            {new Date(h.timestamp).toLocaleString()}
                          </div>

                          {/* Section 3: Action Buttons (Edit and Delete) */}
                          <div className={styles.historyActions}>
                            {/* MODIFIED: Edit Button opens NumberPad for edit */}
                            <button
                              onClick={() =>
                                openNumberPadForEdit(current.id, h.id, h.amount)
                              }
                              className={styles.historyEditButton}
                            >
                              <FontAwesomeIcon
                                icon={faPen}
                                className={styles.icon}
                              />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setCategories((prev) =>
                                  prev!.map((c) => {
                                    if (c.id !== current.id) return c;
                                    const nextHistory = (
                                      c.history || []
                                    ).filter((x) => x.id !== h.id);
                                    const spent = nextHistory.reduce(
                                      (s, x) => s + x.amount,
                                      0
                                    );
                                    return {
                                      ...c,
                                      history: nextHistory,
                                      spent,
                                    };
                                  })
                                );
                              }}
                              className={styles.historyDeleteButton}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
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
            className={styles.modalContent}
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
                width: "95%",
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
                    return alert("名前を入力してください");
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

      {/* NumberPad (MODIFIED LOGIC) */}
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