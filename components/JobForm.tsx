"use client";
import React, { useState } from "react";
import { addJob } from "@/lib/partTime";

type Props = { onSaved?: () => void };

export default function JobForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [wage, setWage] = useState<string>("");

  const save = () => {
    const w = Number(wage);
    if (!name || !isFinite(w) || w < 0) {
      alert("Invalid input");
      return;
    }
    const created = addJob(name.trim(), w);
    if (!created) {
      alert("Job exists or invalid");
      return;
    }
    setName("");
    setWage("");
    onSaved?.();
  };

  return (
    <div className="job-form" style={{ marginBottom: 12 }}>
      <h3>Register job</h3>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <label style={{ display: "grid" }}>
          <span>Job name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label style={{ display: "grid" }}>
          <span>Hourly wage (¥)</span>
          <input
            type="number"
            min="0"
            step="0.25"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save}>Save Job</button>
          <button
            onClick={() => {
              setName("");
              setWage("");
            }}
            className="muted"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
