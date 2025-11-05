"use client";
// import EditableAmount from "./EditableAmount";
import { useApp } from "@/context/AppProvider";
type Props = { income: number; limit: number; balance: number };

export default function SummaryCards({ income, limit, balance }: Props) {
  useApp();

  return (
    <section className="summary">
      <div className="income-pill">
        <div>INCOME</div>
        <strong>{income.toLocaleString()}</strong>
      </div>
      <div className="summary-row">
        <div className="card">
          <div className="muted">LIMIT BUDGET</div>
          <strong>{limit.toLocaleString()}</strong>
        </div>
        <div className="card">
          <div className="muted">BALANCE</div>
          <strong>{balance.toLocaleString()}</strong>
        </div>
      </div>
    </section>
  );
}
