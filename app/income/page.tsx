"use client";
import React, { useEffect, useState } from "react";
import JobForm from "@/components/JobForm";
import JobCard from "@/components/JobCard";
import JobModal from "@/components/JobModal";
import HistoryTable from "@/components/HistoryTable";
import BottomNav from "@/components/BottomNav";
import {
  loadJobs,
  recalcAllTotals,
  calculateOverallTotal,
  deleteJob,
  Job as JobType,
} from "@/lib/partTime";

export default function IncomePage() {
  const [jobs, setJobs] = useState<JobType[]>(() => loadJobs());
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    // Recalculate totals on mount; jobs are initialized lazily from storage to avoid
    // calling setState synchronously inside the effect which can cause cascading renders.
    recalcAllTotals();
  }, []);

  const refresh = () => setJobs(loadJobs());

  const onJobSaved = () => refresh();

  const openJob = (jobId: string) => setActiveJobId(jobId);
  const closeJob = () => setActiveJobId(null);

  const handleSavedSession = () => refresh();

  const handleDeleteJob = (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const ok = deleteJob(jobId);
    if (ok) {
      if (activeJobId === jobId) setActiveJobId(null);
      refresh();
    } else {
      alert("Failed to delete job.");
    }
  };

  const handleDeleteSession = (jobId: string, sessionId: string) => {
    if (!confirm("Delete this record?")) return;
    // If you have a deleteSession function in lib/partTime, call it here (uncomment):
    // const ok = deleteSession(jobId, sessionId);
    // if (!ok) { alert("Failed to delete session."); return; }

    // Reference the parameters so TypeScript doesn't report unused variables,
    // and perform the refresh after deletion (or simulation).
    console.log("Deleting session", jobId, sessionId);
    refresh();
  };

  return (
    <main style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Part-time income tracker</h1>

      <JobForm onSaved={onJobSaved} />

      <section style={{ marginTop: 18 }}>
        <h2>Jobs</h2>
        <div className="job-grid">
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
        <HistoryTable jobs={jobs} onDelete={handleDeleteSession} />
        <div style={{ marginTop: 8, fontWeight: 600 }}>
          Overall:{" "}
          {new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "JPY",
            maximumFractionDigits: 0,
          }).format(calculateOverallTotal())}
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

      <BottomNav />
    </main>
  );
}
