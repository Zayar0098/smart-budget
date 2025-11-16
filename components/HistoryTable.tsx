"use client";
import { Job, HistoryEntry } from "../lib/partTime";
import styles from "../app/pincome/page.module.css";
import { useCurrency } from "../components/CurrencyProvider";

type Row = HistoryEntry & { jobId: string; jobName: string };

type Props = {
  jobs: Job[];
  onDelete?: (jobId: string, sessionId: string) => void;
};

export default function HistoryTable({ jobs }: Props) {
  const rows: Row[] = [];
  const { formatFromJPY } = useCurrency();
  for (const job of jobs) {
    for (const h of job.history) {
      rows.push({ ...h, jobId: job.id, jobName: job.name });
    }
  }
  // newest first
  rows.sort((a, b) => b.createdAt - a.createdAt);

  return (
    <table className={styles.historytable}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
          <th>Time</th>
          <th>Break</th>
          <th>Total</th>
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
              <td>{formatFromJPY(r.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}