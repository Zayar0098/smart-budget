"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppProvider";
import { Category } from "@/types";

export default function AddCategoryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState("");
  const reserved = useMemo(
    () => new Set(state.categories.map((c) => c.name.trim().toLowerCase())),
    [state.categories]
  );

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    if (reserved.has(n.toLowerCase())) return;
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: n,
      spent: 0,
      locked: false,
    };
    dispatch({ type: "ADD_CATEGORY", payload: newCat });
    setName("");
    onClose();
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add category</h3>
        <input
          autoFocus
          placeholder="e.g. Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <div className="row">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={submit}
            disabled={!name.trim() || reserved.has(name.trim().toLowerCase())}
          >
            Add
          </button>
        </div>
        {name && reserved.has(name.trim().toLowerCase()) && (
          <p className="hint">This category already exists.</p>
        )}
      </div>
    </div>
  );
}
