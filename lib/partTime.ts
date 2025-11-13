// Utility: jobs + history storage and pay calculation

export type HistoryEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  restStart?: string;
  restEnd?: string;
  total: number;
  createdAt: number;
};

export type Job = {
  id: string;
  name: string;
  wage: number;
  history: HistoryEntry[];
  total: number;
};

const JOBS_KEY = "pt_jobs_v2";

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadJobs(): Job[] {
  return safeParse<Job[]>(localStorage.getItem(JOBS_KEY), []);
}
export function saveJobs(jobs: Job[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

/* time helpers */
function parseTimeToMinutes(t: string): number {
  if (!t) return NaN;
  const parts = t.split(":").map((s) => Number(s));
  if (
    parts.length < 2 ||
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1])
  )
    return NaN;
  return parts[0] * 60 + parts[1];
}
function overlap(a1: number, a2: number, b1: number, b2: number) {
  const s = Math.max(a1, b1);
  const e = Math.min(a2, b2);
  return Math.max(0, e - s);
}

/**
 * calculatePay: returns total (yen), workedMinutes, nightMinutes
 * night window: 22:00 - 06:00
 */
export function calculatePay(
  wage: number,
  startTime: string,
  endTime: string,
  restStart?: string,
  restEnd?: string
): { total: number; workedMinutes: number; nightMinutes: number } {
  const ws = parseTimeToMinutes(startTime);
  const weRaw = parseTimeToMinutes(endTime);
  if (!Number.isFinite(ws) || !Number.isFinite(weRaw))
    return { total: 0, workedMinutes: 0, nightMinutes: 0 };

  let we = weRaw;
  if (we <= ws) we += 24 * 60; // crosses midnight
  const totalSpan = we - ws;

  // break overlap
  let breakMinutes = 0;
  if (restStart && restEnd) {
    const rs0 = parseTimeToMinutes(restStart);
    const re0 = parseTimeToMinutes(restEnd);
    if (Number.isFinite(rs0) && Number.isFinite(re0)) {
      const rs = rs0;
      let re = re0;
      if (re <= rs) re += 24 * 60;
      const candidates: Array<[number, number]> = [
        [rs, re],
        [rs + 24 * 60, re + 24 * 60],
      ];
      for (const [r1, r2] of candidates)
        breakMinutes += overlap(ws, we, r1, r2);
      breakMinutes = Math.min(breakMinutes, totalSpan);
    }
  }

  const worked = Math.max(0, totalSpan - breakMinutes);

  const nightStart = 22 * 60;
  const nightEnd = 6 * 60 + 24 * 60;
  let nightMinutes = overlap(ws, we, nightStart, nightEnd);

  if (restStart && restEnd) {
    const rs0 = parseTimeToMinutes(restStart);
    const re0 = parseTimeToMinutes(restEnd);
    if (Number.isFinite(rs0) && Number.isFinite(re0)) {
      const rs = rs0;
      let re = re0;
      if (re <= rs) re += 24 * 60;
      const candidates: Array<[number, number]> = [
        [rs, re],
        [rs + 24 * 60, re + 24 * 60],
      ];
      const nStart = Math.max(ws, nightStart);
      const nEnd = Math.min(we, nightEnd);
      if (nEnd > nStart) {
        for (const [r1, r2] of candidates)
          nightMinutes -= overlap(nStart, nEnd, r1, r2);
      }
      if (nightMinutes < 0) nightMinutes = 0;
    }
  }

  const night = Math.min(nightMinutes, worked);
  const normal = Math.max(0, worked - night);

  const normalHours = normal / 60;
  const nightHours = night / 60;
  const total =
    Math.round((normalHours * wage + nightHours * wage * 1.25) * 100) / 100;

  return { total, workedMinutes: worked, nightMinutes: night };
}

/* higher-level API */

// create a new job (once)
export function addJob(name: string, wage: number): Job | null {
  if (!name || !isFinite(wage) || wage < 0) return null;
  const jobs = loadJobs();
  if (jobs.find((j) => j.name === name)) return null;
  const job: Job = {
    id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
    name,
    wage,
    history: [],
    total: 0,
  };
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

// add a work session under a job id
export function addWorkSession(
  jobId: string,
  date: string,
  startTime: string,
  endTime: string,
  restStart?: string,
  restEnd?: string
): HistoryEntry | null {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;
  const calc = calculatePay(job.wage, startTime, endTime, restStart, restEnd);
  const entry: HistoryEntry = {
    id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
    date,
    startTime,
    endTime,
    restStart,
    restEnd,
    total: calc.total,
    createdAt: Date.now(),
  };
  job.history.push(entry);
  job.total =
    Math.round(
      job.history.reduce((s, h) => s + (isFinite(h.total) ? h.total : 0), 0) *
        100
    ) / 100;
  saveJobs(jobs);
  return entry;
}

// delete a session by id
export function deleteSession(jobId: string, sessionId: string): boolean {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return false;
  job.history = job.history.filter((h) => h.id !== sessionId);
  job.total =
    Math.round(
      job.history.reduce((s, h) => s + (isFinite(h.total) ? h.total : 0), 0) *
        100
    ) / 100;
  saveJobs(jobs);
  return true;
}

// delete a job by id
export function deleteJob(jobId: string): boolean {
  try {
    const jobs = loadJobs();
    const exists = jobs.some((j) => j.id === jobId);
    if (!exists) return false;
    const next = jobs.filter((j) => j.id !== jobId);
    saveJobs(next);
    return true;
  } catch {
    return false;
  }
}

// recalc totals for all jobs (safe)
export function recalcAllTotals() {
  const jobs = loadJobs();
  for (const job of jobs) {
    job.total =
      Math.round(
        job.history.reduce((s, h) => s + (isFinite(h.total) ? h.total : 0), 0) *
          100
      ) / 100;
  }
  saveJobs(jobs);
}

// get overall total
export function calculateOverallTotal(): number {
  const jobs = loadJobs();
  const total = jobs.reduce((s, j) => s + (isFinite(j.total) ? j.total : 0), 0);
  return Math.round(total * 100) / 100;
}
