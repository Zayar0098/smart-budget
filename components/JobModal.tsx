"use client";
import React, { useMemo, useState } from "react";
import { Job, calculatePay, addWorkSession } from "@/lib/partTime";

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
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("22:00");
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add session — {job.name}</h3>

        <label>
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
          <label>
            Start
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            End
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <label>
            Rest start (optional)
            <input
              type="time"
              value={restStart}
              onChange={(e) => setRestStart(e.target.value)}
            />
          </label>
          <label>
            Rest end (optional)
            <input
              type="time"
              value={restEnd}
              onChange={(e) => setRestEnd(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 8 }}>
          <div>Worked: {(preview.workedMinutes / 60).toFixed(2)} h</div>
          <div>Night: {(preview.nightMinutes / 60).toFixed(2)} h</div>
          <div>
            Total:{" "}
            {new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
              maximumFractionDigits: 0,
            }).format(preview.total)}
          </div>
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
            className="primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
