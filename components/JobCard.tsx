"use client";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
type Props = {
  name: string;
  total: number;
  onClick?: () => void;
  onDelete?: () => void;
};

export default function JobCard({ name, total, onClick, onDelete }: Props) {
  return (
    // use a div so we can include a real button inside (avoid nested <button>)
    <div
      className="job-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`Open ${name}`}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div className="job-card-title">{name}</div>
          <div className="job-card-total" style={{ marginTop: 6 }}>
            {new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
              maximumFractionDigits: 0,
            }).format(total)}
          </div>
        </div>

        <div style={{ marginLeft: 12 }}>
          <button
            type="button"
            aria-label={`Delete ${name}`}
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            title="Delete job"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}
