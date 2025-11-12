"use client";
import React, { useMemo, useState } from "react";
import { useApp } from "@/context\\AppProvider";
import SummaryCards from "@/components/SummaryCards";
import CategoryCard from "@/components/CategoryCard";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import AddAmountDialog from "@/components/AddAmountDialog";
import BottomNav from "@/components/BottomNav";
import NumberPad from "@/components/NumberPad";
import DesktopAmountModal from "@/components/DesktopAmountModal";
import useIsMobile from "@/hooks/useIsMobile";

export default function HomePage() {
  const { state, dispatch } = useApp();
  const isMobile = useIsMobile();

  const [openAddCat, setOpenAddCat] = useState(false);
  const [openAddAmt, setOpenAddAmt] = useState(false);
  const [catForModal, setCatForModal] = useState<string | undefined>(undefined);

  const [showIncomePad, setShowIncomePad] = useState(false);
  const [showLimitPad, setShowLimitPad] = useState(false);
  const [showIncomeDesktop, setShowIncomeDesktop] = useState(false);
  const [showLimitDesktop, setShowLimitDesktop] = useState(false);

  const totalSpent = useMemo(
    () => state.categories.reduce((s, c) => s + (c.spent || 0), 0),
    [state.categories]
  );
  const income = state.income;
  const limit = state.limit;
  const balance = Math.max(0, income - totalSpent);

  const openAmountForCategory = (catId?: string) => {
    setCatForModal(catId);
    setOpenAddAmt(true);
  };
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      dispatch({ type: "DELETE_CATEGORY", payload: { id } });
    }
  };

  const onAddIncome = () => {
    if (isMobile) setShowIncomePad(true);
    else setShowIncomeDesktop(true);
  };
  const onSetLimit = () => {
    if (isMobile) setShowLimitPad(true);
    else setShowLimitDesktop(true);
  };

  const handleIncomeSubmit = (amount: number) => {
    dispatch({ type: "SET_INCOME", payload: state.income + amount });
    setShowIncomePad(false);
    setShowIncomeDesktop(false);
  };
  const handleLimitSubmit = (amount: number) => {
    dispatch({ type: "SET_LIMIT", payload: amount });
    setShowLimitPad(false);
    setShowLimitDesktop(false);
  };

  return (
    <>
      <SummaryCards
        income={income}
        limit={limit}
        balance={balance}
        onAddIncome={onAddIncome}
        onSetLimit={onSetLimit}
        onAddFromBalance={() => openAmountForCategory(undefined)}
      />

      <section className="grid">
        {state.categories.map((c) => (
          <CategoryCard
            key={c.id}
            id={c.id}
            title={c.name}
            amount={c.spent}
            locked={c.locked}
            onDelete={!c.locked ? () => handleDelete(c.id, c.name) : undefined}
            onAddAmount={() => openAmountForCategory(c.id)}
          />
        ))}
      </section>

      <button
        className="fab"
        aria-label="Add category"
        onClick={() => setOpenAddCat(true)}
      >
        +
      </button>

      <AddCategoryDialog
        open={openAddCat}
        onClose={() => setOpenAddCat(false)}
      />
      <AddAmountDialog
        open={openAddAmt}
        onClose={() => setOpenAddAmt(false)}
        catId={catForModal}
      />

      {/* Income / Limit: mobile -> NumberPad, desktop -> DesktopAmountModal */}
      <NumberPad
        open={showIncomePad}
        onClose={() => setShowIncomePad(false)}
        onSubmit={handleIncomeSubmit}
        title="Add to income"
      />
      <NumberPad
        open={showLimitPad}
        onClose={() => setShowLimitPad(false)}
        onSubmit={handleLimitSubmit}
        title="Set monthly limit"
      />

      <DesktopAmountModal
        open={showIncomeDesktop}
        onClose={() => setShowIncomeDesktop(false)}
        mode="income"
        onSubmit={(amt) => handleIncomeSubmit(amt)}
        title="Add to income"
      />
      <DesktopAmountModal
        open={showLimitDesktop}
        onClose={() => setShowLimitDesktop(false)}
        mode="limit"
        onSubmit={(amt) => handleLimitSubmit(amt)}
        title="Set monthly limit"
      />

      <BottomNav />
    </>
  );
}
