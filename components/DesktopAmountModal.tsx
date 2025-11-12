"use client";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";

type Mode = "category" | "income" | "limit";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, opts?: { categoryId?: string }) => void;
  mode?: Mode;
  categoryId?: string;
  title?: string;
};

export default function DesktopAmountModal({
  open,
  onClose,
  onSubmit,
  mode = "category",
  categoryId,
  title,
}: Props) {
  const { state } = useApp();
  const [selected, setSelected] = useState<string | undefined>(
    categoryId ?? state.categories[0]?.id
  );
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setSelected(categoryId ?? state.categories[0]?.id);
      setValue("");
    }, 0);
    return () => clearTimeout(id);
  }, [open, categoryId, state.categories]);

  if (!open) return null;

  const effectiveTitle =
    title ??
    (mode === "income"
      ? "Add to income"
      : mode === "limit"
      ? "Set limit"
      : selected
      ? `Add to ${
          state.categories.find((c) => c.id === selected)?.name ?? "category"
        }`
      : "Add amount");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{effectiveTitle}</h3>

        {mode === "category" && (
          <label style={{ display: "block", marginBottom: 8 }}>
            Category
            <select
              className="select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label style={{ display: "block", marginBottom: 8 }}>
          Amount
          <input
            className="amount-input"
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        </label>

        <div className="row">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const n = parseFloat(value);
              if (!isFinite(n) || n <= 0) return;
              onSubmit(n, { categoryId: selected });
              onClose();
            }}
            disabled={!value}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
