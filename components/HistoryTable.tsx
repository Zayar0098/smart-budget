"use client";

import { Job, HistoryEntry } from "../lib/partTime";
import styles from "../app/pincome/page.module.css";
import { useCurrency } from "../components/CurrencyProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

type Row = HistoryEntry & { jobId: string; jobName: string };

type Props = {
  jobs: Job[];
  onDelete?: (jobId: string, historyId: string) => void; // <-- add
};

export default function HistoryTable({ jobs, onDelete }: Props) {
  const { formatFromJPY } = useCurrency();

  // Build flat rows
  const rows: Row[] = [];
  for (const job of jobs) {
    for (const h of job.history) {
      rows.push({ ...h, jobId: job.id, jobName: job.name });
    }
  }

  // Sort newest first
  rows.sort((a, b) => b.createdAt - a.createdAt);

  // Group by YYYY-MM
  const grouped: Record<string, Row[]> = {};
  for (const r of rows) {
    const month = r.date.slice(0, 7); // "2025-01"
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(r);
  }

  // Monthly totals
  const monthlyTotals: Record<string, number> = {};
  for (const month of Object.keys(grouped)) {
    monthlyTotals[month] = grouped[month].reduce((sum, r) => sum + r.total, 0);
  }

  return (
    <div className={styles.historyContainer}>
      {Object.keys(grouped)
        .sort((a, b) => (a < b ? 1 : -1))
        .map((month) => (
          <div key={month} className={styles.monthSection}>
            {/* MONTH HEADER */}
            <div className={styles.monthHeader}>
              <div className={styles.monthTitle}>{month}</div>
              <div className={styles.monthTotal}>
                 Total : {formatFromJPY(monthlyTotals[month])}
              </div>
            </div>

            <div className={styles.cardList}>
              {grouped[month].map((r) => (
                <div key={r.id} className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.jobName}>{r.jobName}</span>
                    <span className={styles.amount}>
                      {formatFromJPY(r.total)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div>
                    {r.date}<br />
                      {r.startTime} → {r.endTime} <br />
                      Break:{" "}
                      {r.restStart ? `${r.restStart} → ${r.restEnd}` : "-"}
                    </div>
                    <div>
                      <button
                    className={styles.deleteButton}
                    onClick={() => onDelete?.(r.jobId, r.id)}
                  >
            <FontAwesomeIcon icon={faTrash}/>
                    
                  </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
