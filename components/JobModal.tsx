"use client";
import { useMemo, useState } from "react";
import { Job, calculatePay, addWorkSession } from "../lib/partTime";
import styles from "../app/pincome/page.module.css";

type Props = {
  job: Job;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function JobModal({ job, open, onClose, onSaved }: Props) {
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  ); // YYYY-MM-DD
  const [start, setStart] = useState("16:00");
  const [end, setEnd] = useState("23:00");
  const [restStart, setRestStart] = useState("");
  const [restEnd, setRestEnd] = useState("");

  const preview = useMemo(
    () =>
      calculatePay(
        job.wage,
        start,
        end,
        restStart || undefined,
        restEnd || undefined
      ),
    [job.wage, start, end, restStart, restEnd]
  );

  if (!open) return null;

  return (
    <div className={styles.modaloverlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: 400, width: "90%" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{marginBottom:"20px"}}>Add session — {job.name}</h3>
        <label className={styles.title}>
          Date　
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
         <label className={styles.title}>
            Start　
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className={styles.title}>
            End　
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.restGrid}>
            <label className={styles.title}>Break start
              <input
                type="time"
                value={restStart}
              onChange={(e) => setRestStart(e.target.value)} />
          </label>
            <label className={styles.title}>Break end
              <input
                type="time"
                value={restEnd}
              onChange={(e) => setRestEnd(e.target.value)} />
            </label>
        </div>

        <div style={{ marginTop: 8 }}>
          <div>Worked time : {(preview.workedMinutes / 60).toFixed(2)} h</div>
          <div>Late night : {(preview.nightMinutes / 60).toFixed(2)} h</div>
          {/* <div>
            Total:{" "}
            {new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
              maximumFractionDigits: 0,
            }).format(preview.total)}
          </div> */}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              const entry = addWorkSession(
                job.id,
                date,
                start,
                end,
                restStart || undefined,
                restEnd || undefined
              );
              if (!entry) {
                alert("Failed to save session");
                return;
              }
              onSaved?.();
              onClose();
            }}
            className={styles.primary}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}