"use client";
import { useEffect, useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import JobForm from "@/components/JobForm";
import JobCard from "@/components/JobCard";
import JobModal from "@/components/JobModal";
import {
  loadJobs,
  recalcAllTotals,
  calculateOverallTotal,
  deleteJob,
  Job as JobType,
} from "@/lib/partTime"; // make sure paths are correct
import styles from "./page.module.css";
import HistoryTable from "@/components/HistoryTable";

export default function IncomePage() {
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobs, setJobs] = useState<JobType[]>(
    () => {
      // initialize lazily on the client to avoid setting state inside useEffect
      try {
        return loadJobs();
      } catch {
        return [];
      }
    }
  );
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { formatFromJPY } = useCurrency();

  // Recalculate totals after mount
  useEffect(() => {
    recalcAllTotals();
  }, []);

  const refresh = () => setJobs(loadJobs());

  const onJobSaved = () => refresh();
  const openJob = (jobId: string) => setActiveJobId(jobId);
  const closeJob = () => setActiveJobId(null);
  const handleSavedSession = () => refresh();

  const handleDeleteJob = (jobId: string) => {
    const ok = deleteJob(jobId);
    if (ok) {
      if (activeJobId === jobId) setActiveJobId(null);
      refresh();
    }
  };

  return (
    <>
      <button
        className={styles.addButton}
        onClick={() => setJobFormOpen(true)}
      >
        ＋
      </button>

      <main style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
        {/* Part Time Section */}
        <section>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h2>Part Time</h2>
            <p>
              Overall: <strong>{formatFromJPY(calculateOverallTotal())}</strong>
            </p>
          </div>

          {jobFormOpen && (
            <div
              className={styles.modalOverlay}
              onClick={() => setJobFormOpen(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <JobForm
                  onSaved={() => {
                    onJobSaved();
                    setJobFormOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          <div className={styles.jobgrid}>
            {jobs.map((j) => (
              <JobCard
                key={j.id}
                name={j.name}
                total={j.total}
                onClick={() => openJob(j.id)}
                onDelete={() => handleDeleteJob(j.id)}
              />
            ))}
          </div>
        </section>

        {/* History Section */}
        <section style={{ marginTop: 18 }}>
          <h2>History</h2>
          <HistoryTable jobs={jobs} />
        </section>

        {/* Job Modal */}
        {activeJobId && (
          <JobModal
            job={jobs.find((j) => j.id === activeJobId)!}
            open={Boolean(activeJobId)}
            onClose={closeJob}
            onSaved={handleSavedSession}
          />
        )}
      </main>
    </>
  );
}
