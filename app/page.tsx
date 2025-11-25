"use client";

import { useState, useEffect } from "react";
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

// Key for storing the last time the budget was reset (YYYY-MM format)
const LAST_RESET_KEY = "sb_last_reset_month";

export default function HomePage() {
  // --- 1. HOOKS (MUST BE CALLED UNCONDITIONALLY AT THE TOP) ---

  const [categories, setCategories] = useClientStoredState<Category[]>(
    "sb_categories",
    [
      { id: "rent-house", name: "Rent-house", spent: 0, limit: 0, history: [] },
      { id: "gas-bill", name: "Gas", spent: 0, limit: 0, history: [] },
      { id: "electric", name: "Electric", spent: 0, limit: 0, history: [] },
      { id: "water", name: "Water", spent: 0, limit: 0, history: [] },
    ]
  );

  const [income, setIncome] = useClientStoredState<number>("sb_income", 0);
  const [balanceOverride, setBalanceOverride] = useClientStoredState<
    number | null
  >("sb_balance_override", null);
  const [limit, setLimit] = useClientStoredState<number>("sb_limit", 0);

  // State for tracking the last reset date
  const [lastResetMonth, setLastResetMonth] = useClientStoredState<string>(
    LAST_RESET_KEY,
    "" // Initialize empty, will be set in useEffect
  );

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
  
  // NEW: 検索キーワードのステート
  const [searchTerm, setSearchTerm] = useState("");


  // --- 2. RESET FUNCTION ---

  const resetMonthlyBudget = () => {
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Reset spent only (history preserved)
    setCategories((prev) =>
      prev!.map((c) => ({
        ...c,
        spent: 0,
      }))
    );

    // NOTE: income, limit, balanceOverride もリセットされます。
    // 恒久的な値として残したい場合は、この行をコメントアウトしてください。
    setIncome(0);
    setLimit(0);
    setBalanceOverride(null);

    // mark reset month
    setLastResetMonth(currentMonthYear);
  };

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  
  // --- 3. AUTOMATIC MONTHLY CHECK (This is the correct one to keep) ---

  useEffect(() => {
    // データがロード中であれば処理を中断
    if (lastResetMonth === undefined) return; 

    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1; // 1..12
    const currentMonthYear = `${cy}-${cm}`;

    // 1. lastResetMonthが空の場合 (初回実行時)、現在の月で初期化し、リセットはしない
    if (!lastResetMonth) {
      setLastResetMonth(currentMonthYear);
      return;
    }

    // 2.  stored YYYY-M or YYYY-MM を解析
    const parts = lastResetMonth.split("-").map((s) => Number(s));
    const ly = parts[0] || 0;
    const lm = parts[1] || 0;

    // 3. 過去の年月と比較し、月が古ければリセットを実行
    const isOlder = ly < cy || (ly === cy && lm < cm);
    if (isOlder) {
      resetMonthlyBudget();
    }
    // otherwise (same month or future) do nothing
  }, [
    lastResetMonth,
    setLastResetMonth,
    setCategories,
    setIncome,
    setLimit,
    setBalanceOverride,
  ]);
  

  // --- 4. CONDITIONAL EARLY RETURN (AFTER ALL HOOKS) ---

  if (
    categories === undefined ||
    income === undefined ||
    balanceOverride === undefined ||
    lastResetMonth === undefined 
  ) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  // --- 5. CALCULATIONS ---

  const totalSpent = categories.reduce((s, c) => s + (c.spent || 0), 0);
  const computedBalance = (income || 0) - totalSpent;
  const balance =
    balanceOverride === null || balanceOverride === undefined
      ? computedBalance
      : balanceOverride;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalSpentThisMonth = categories.reduce((sum, cat) => {
    const monthly = (cat.history || []).filter((h) => {
      const d = new Date(h.timestamp);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const catTotal = monthly.reduce((s, h) => s + h.amount, 0);
    return sum + catTotal;
  }, 0);
  
  // NEW: 検索フィルタリングロジック
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // --- 6. HANDLERS ---

  const addHistoryEntry = (catId: string, amount: number) => {
    const entry: HistoryEntry = {
      id: generateId(),
      amount: Math.round(amount),
      timestamp: new Date().toISOString(),
    };

    setCategories((prev) =>
      prev!.map((c) => {
        if (c.id !== catId) return c;
        // 新しい履歴配列を作成して重複を排除
        const nextHistory = [...(c.history || []), entry];
        const uniqHistory = Array.from(
          new Map(nextHistory.map((h) => [h.id, h])).values()
        );
        // spent は履歴の合計から再計算（重複カウントを防ぐ）
        const spent = uniqHistory.reduce((s, h) => s + h.amount, 0);
        return { ...c, history: uniqHistory, spent };
      })
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

  // --- 7. RENDER ---

  const current = popupFor
    ? categories.find((c) => c.id === popupFor) ?? null
    : null;
  const monthlyRemaining = (limit ?? 0) - totalSpentThisMonth;
  const monthlyRemainingSafe = Math.max(0, monthlyRemaining);
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
          <div className={styles.infoTitle}>Balance</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {formatFromJPY(balance || 0)}
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
      
      {/* NEW: Search Bar */}
      <div style={{ padding: '0', marginBottom: 16 }}>
          <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  outline: 'none',
              }}
          />
      </div>

      {/* Category grid */}
      <div className={styles.categoryGrid}>
        {/* フィルタリングされたカテゴリを使用 */}
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={styles.categoryItem}
            onClick={() => openCategoryPopup(cat.id)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.categoryHeader}>
              <strong style={{ fontSize: 16 }}>{cat.name}</strong>
            </div>

            <div className={styles.spentAmount}>{formatFromJPY(cat.spent)}</div>

            <div style={{ fontSize: 12, color: "#666", textAlign: "left" }}>
              <div
                style={{
                  fontSize: 11,
                  textAlign: "center",
                  color: "#999",
                }}
              >
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
                    return console.error("名前を入力してください"); // 🚨 alert() をコンソールログに置き換え
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