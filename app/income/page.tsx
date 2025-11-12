"use client";
import React, { useEffect, useState } from "react";
import JobForm from "@/components/JobForm";
import JobCard from "@/components/JobCard";
import JobModal from "@/components/JobModal";
import HistoryTable from "@/components/HistoryTable";
import {
  loadJobs,
  deleteSession,
  recalcAllTotals,
  calculateOverallTotal,
  Job as JobType,
} from "@/lib/partTime";
import BottomNav from "@/components/BottomNav";
import "@/styles/components.css";

export default function IncomePage() {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    recalcAllTotals(); // ensure totals are consistent
    const t = window.setTimeout(() => {
      setJobs(loadJobs());
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const refresh = () => setJobs(loadJobs());

  const onJobSaved = () => refresh();

  const openJob = (jobId: string) => setActiveJobId(jobId);
  const closeJob = () => setActiveJobId(null);

  const handleSavedSession = () => refresh();

  const handleDeleteSession = (jobId: string, sessionId: string) => {
    if (!confirm("Delete this record?")) return;
    deleteSession(jobId, sessionId);
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
              name={`${j.name}`}
              total={j.total}
              onClick={() => openJob(j.id)}
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
