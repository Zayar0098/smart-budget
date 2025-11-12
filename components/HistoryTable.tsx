"use client";
import React from "react";
import { Job, HistoryEntry } from "@/lib/partTime";

type Row = HistoryEntry & { jobId: string; jobName: string };

type Props = {
  jobs: Job[];
  onDelete?: (jobId: string, sessionId: string) => void;
};

export default function HistoryTable({ jobs, onDelete }: Props) {
  const rows: Row[] = [];
  for (const job of jobs) {
    for (const h of job.history) {
      rows.push({ ...h, jobId: job.id, jobName: job.name });
    }
  }
  // newest first
  rows.sort((a, b) => b.createdAt - a.createdAt);

  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Job</th>
          <th>Date</th>
          <th>Work</th>
          <th>Rest</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.jobName}</td>
            <td>{r.date}</td>
            <td>
              {r.startTime} → {r.endTime}
            </td>
            <td>{r.restStart ? `${r.restStart} → ${r.restEnd}` : "-"}</td>
            <td>
              {new Intl.NumberFormat("ja-JP", {
                style: "currency",
                currency: "JPY",
                maximumFractionDigits: 0,
              }).format(r.total)}
            </td>
            <td>
              {onDelete && (
                <button onClick={() => onDelete(r.jobId, r.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
