"use client";
import { useState } from "react";
import { addJob } from "../lib/partTime";
import styles from "../app/pincome/page.module.css";

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
    <div className={styles.jobformContainer}>
      <h3>Register job</h3>

      <div className={styles.formRow}>
        <label className={styles.formField}>
          <span>Job name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className={styles.formField}>
          <span>Hourly wage (¥)</span>
          <input
            type="number"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            placeholder="1000"
          />
        </label>

        <div className={styles.buttonGroup}>
          <button onClick={save}>Save</button>
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
