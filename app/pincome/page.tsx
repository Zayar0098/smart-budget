"use client";
import { useEffect, useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import JobForm from "../../components/JobForm";
import JobCard from "../../components/JobCard";
import JobModal from "../../components/JobModal";
import {
  loadJobs,
  recalcAllTotals,
  calculateOverallTotal,
  deleteJob,
  Job as JobType,
} from "../../lib/partTime";
import styles from "./page.module.css";
import HistoryTable from "@/components/HistoryTable";

export default function IncomePage() {
  const [jobs, setJobs] = useState<JobType[]>(() => loadJobs());
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const { formatFromJPY } = useCurrency();

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
    } else {
    //   alert("Failed to delete job.");
    }
  };

  return (
    <main style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Part-time income tracker</h1>

      <JobForm onSaved={onJobSaved} />

      <section style={{ marginTop: 18 }}>
        <h2>Jobs</h2>
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

      <section style={{ marginTop: 18 }}>
        <h2>History</h2>
            <HistoryTable jobs={jobs} />
                <div style={{ marginTop: 8, fontWeight: 600 , marginBottom: "60px"}}>
            Overall: {formatFromJPY(calculateOverallTotal())}
        </div>
      </section>

      {activeJobId && (
        <JobModal
          job={jobs.find((j) => j.id === activeJobId)!}
          open={Boolean(activeJobId)}
          onClose={closeJob}
          onSaved={handleSavedSession}
        />
      )}
    </main>
  );
}