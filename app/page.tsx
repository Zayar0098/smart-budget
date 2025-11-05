"use client";

import { useState } from "react";
import useClientStoredState from "@/components/useClientStoredState";
import NumberPad from "@/components/NumberPad";
import styles from "./page.module.css";

type Category = {
  id: string;
  name: string;
  spent: number;
  limit: number;
};

export default function HomePage() {
  const [categories, setCategories] = useClientStoredState<Category[]>("sb_categories");
  const [income, setIncome] = useClientStoredState<number>("sb_income", 0);
  const [balanceOverride, setBalanceOverride] = useClientStoredState<number | null>(
    "sb_balance_override",
    null
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [npVisible, setNpVisible] = useState(false);
  const [npTargetCategory, setNpTargetCategory] = useState<string | null>(null);

  if (categories === undefined || income === undefined || balanceOverride === undefined) {
    return (
      <div className={styles.container}>
        <h2>Categories</h2>
        <p>読み込み中…</p>
      </div>
    );
  }

  const totalSpent = categories.reduce((s, c) => s + (c.spent || 0), 0);
  const computedBalance = (income || 0) - totalSpent;
  const balance = balanceOverride !== null ? balanceOverride : computedBalance;

  const formatYen = (n: number) =>
    n.toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    });

  const addCategory = () => {
    const name = newName.trim();
    if (!name) return alert("カテゴリ名を入力してください。");
    const idBase = name.toLowerCase().replace(/\s+/g, "-");
    let id = idBase;
    let i = 1;
    while (categories.some((c) => c.id === id)) {
      id = `${idBase}-${i++}`;
    }
    setCategories((prev) => [...prev, { id, name, spent: 0, limit: 0 }]);
    setNewName("");
    setShowAddForm(false);
  };

 const removeCategory = (id: string) => {
  setCategories((prev) => prev.filter((c) => c.id !== id));
};


  const addToCategory = (id: string, amount: number) => {
    setCategories((prev) =>
      prev!.map((c) =>
        c.id === id ? { ...c, spent: Math.round(c.spent + amount) } : c
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.label}>Income</div>
          <div className={styles.amount}>{formatYen(income || 0)}</div>
        </div>
        <div>
          <div className={styles.label}>Balance</div>
          <div className={styles.amount}>{formatYen(balance || 0)}</div>
        </div>
      </div>

      <h2>Categories</h2>

      {showAddForm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3>新しいカテゴリを追加</h3>
      <input
        className={styles.input}
        placeholder="カテゴリ名を入力"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addCategory();
        }}
      />
      <div className={styles.modalActions}>
        <button onClick={() => setShowAddForm(false)}>キャンセル</button>
        <button onClick={addCategory}>追加</button>
      </div>
    </div>
  </div>
)}


{categories.map((category) => (
  <div
    key={category.id}
    role="button"
    tabIndex={0}
    onClick={() => {
      setNpTargetCategory(category.id);
      setNpVisible(true);
    }}
    className={styles.categoryButton}
  >
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <strong>{category.name}</strong>
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation(); // prevents triggering parent click
            removeCategory(category.id);
          }}
        >
          削除
        </button>
      </div>
      <div className={styles.spentText}>
        Spent: {formatYen(category.spent)}
      </div>
    </div>
  </div>
))}

          
      <button className={styles.addButton} onClick={() => setShowAddForm(true)}>
        + 
      </button>

      <NumberPad
        visible={npVisible}
        initial=""
        onClose={() => {
          setNpVisible(false);
          setNpTargetCategory(null);
        }}
        onConfirm={(value) => {
          if (isAdding) return;
          setIsAdding(true);

          if (!npTargetCategory) return;
          if (value <= 0) {
            alert("正しい金額を入力してください。");
            setIsAdding(false);
            return;
          }

          addToCategory(npTargetCategory, value);
          setNpVisible(false);
          setNpTargetCategory(null);
          setTimeout(() => setIsAdding(false), 300);
        }}
      />
    </div>
  );
}