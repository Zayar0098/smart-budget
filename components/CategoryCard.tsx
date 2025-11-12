"use client";
import React from "react";

type Props = {
  id: string;
  title: string;
  amount: number;
  locked?: boolean;
  onDelete?: () => void;
  onAddAmount?: () => void;
};

export default function CategoryCard({
  id,
  title,
  amount,
  locked,
  onDelete,
  onAddAmount,
}: Props) {
  return (
    <div className="cat-card">
      {!locked && onDelete && (
        <button
          className="icon-btn"
          aria-label={`Delete ${title}`}
          onClick={onDelete}
        >
          ×
        </button>
      )}
      <div className="cat-title">{title}</div>
      <div className="cat-amount">{amount.toLocaleString()}</div>
      <div className="cat-actions">
        <button className="btn small" onClick={onAddAmount}>
          Add amount
        </button>
      </div>
    </div>
  );
}
