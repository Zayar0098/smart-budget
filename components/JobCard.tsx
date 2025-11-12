"use client";
import React from "react";

type Props = {
  name: string;
  total: number;
  onClick?: () => void;
};

export default function JobCard({ name, total, onClick }: Props) {
  return (
    <button
      className="job-card"
      onClick={onClick}
      type="button"
      aria-label={`Open ${name}`}
    >
      <div className="job-card-title">{name}</div>
      <div className="job-card-total">
        {new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: "JPY",
          maximumFractionDigits: 0,
        }).format(total)}
      </div>
    </button>
  );
}
