"use client";
import { useEffect } from "react";

export default function MonthReset() {
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const savedMonth = Number(localStorage.getItem("lastMonth") || 0);

    if (savedMonth !== currentMonth) {
  console.log("NEW MONTH — RESETTING");

  localStorage.setItem("sb_income", "0");
  localStorage.setItem("sb_balance_override", "0");
  localStorage.setItem("sb_limit", "0");
  localStorage.setItem("sb_categories", JSON.stringify([]));

  localStorage.setItem("sb_lastMonth", String(currentMonth));

  // 🔔 Tell ALL hooks to reload from storage
  window.dispatchEvent(new Event("sb_month_reset"));
}

  }, []);

  return null;
}
