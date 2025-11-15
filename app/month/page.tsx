"use client";
import React, { useEffect, useState } from "react";
import { useCurrency } from "../../components/CurrencyProvider";
import styles from "./page.module.css";

export default function CalendarPage() {
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const { convertFromJPY, selected } = useCurrency();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const categories = JSON.parse(localStorage.getItem("sb_categories") || "[]");
    const totals: Record<string, number> = {};

    categories.forEach((cat: any) => {
      (cat.history || []).forEach((h: any) => {
        const date = new Date(h.timestamp);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const key = date.toISOString().slice(0, 10);
          totals[key] = (totals[key] || 0) + h.amount;
        }
      });
    });

    setDailyTotals(totals);
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className={styles.container}>
      <div className={styles.monthHeader}>
        <button onClick={prevMonth} className={styles.arrowBtn}>
          &lt;
        </button>
        <h2 className={styles.monthTitle}>
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className={styles.arrowBtn}>
          &gt;
        </button>
      </div>

      <div className={styles.grid}>
        {[...Array(daysInMonth)].map((_, i) => {
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            i + 1
          ).padStart(2, "0")}`;
          const spentJPY = dailyTotals[date] || 0;
          const spent = convertFromJPY(spentJPY);

          return (
            <div key={date} className={styles.dayBox}>
              <div className={styles.dayNumber}>{i + 1}</div>
              <div className={styles.spentAmount}>
                {spent > 0 ? Math.round(spent).toLocaleString() : "—"}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerNote}>
        ※ 通貨: {selected}
      </div>
    </div>
  );
}
