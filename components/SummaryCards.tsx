"use client";
import React from "react";

type Props = {
  income: number;
  limit: number;
  balance: number;
  onAddIncome?: () => void;
  onSetLimit?: () => void;
  onAddFromBalance?: () => void;
};

export default function SummaryCards({
  income,
  limit,
  balance,
  onAddIncome,
  onSetLimit,
  onAddFromBalance,
}: Props) {
  return (
    <section className="summary">
      <div className="income-pill">
        <div>INCOME</div>
        <strong>{income.toLocaleString()}</strong>
        <div className="card-actions">
          <button className="btn xsmall" onClick={onAddIncome}>
            Add income
          </button>
        </div>
      </div>

      <div className="summary-row">
        <div className="card">
          <div className="muted">LIMIT BUDGET</div>
          <strong>{limit.toLocaleString()}</strong>
          <div className="card-actions">
            <button className="btn xsmall" onClick={onSetLimit}>
              Set limit
            </button>
          </div>
        </div>
        <div className="card">
          <div className="muted">BALANCE</div>
          <strong>{balance.toLocaleString()}</strong>
          <div className="card-actions">
            <button className="btn xsmall" onClick={onAddFromBalance}>
              Add amount
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
