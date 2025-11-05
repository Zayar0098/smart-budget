"use client";
import { useMemo } from "react";
import { useApp } from "@/context/AppProvider";
import SummaryCards from "@/components/SummaryCards";
import CategoryCard from "@/components/CategoryCard";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  const { state } = useApp();
  const totalSpent = useMemo(
    () => state.categories.reduce((sum, c) => sum + (c.spent || 0), 0),
    [state.categories]
  );
  const income = state.income;
  const limit = state.limit;
  const balance = Math.max(0, income - totalSpent);

  return (
    <>
      <SummaryCards income={income} limit={limit} balance={balance} />
      <section className="grid">
        {state.categories.map((c) => (
          <CategoryCard key={c.id} title={c.name} amount={c.spent} />
        ))}
      </section>
      <button className="fab" aria-label="Add">
        +
      </button>
      <BottomNav />
    </>
  );
}
