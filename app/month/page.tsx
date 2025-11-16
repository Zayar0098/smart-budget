"use client";
import { useEffect, useState } from "react";
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
  const loadDailyTotals = () => {
    try {
      const raw = localStorage.getItem("sb_categories");
      if (!raw) {
        setDailyTotals({});
        return;
      }
      let categories: string;
      try {
        categories = JSON.parse(raw);
      } catch (err) {
        console.error("sb_categories JSON.parse failed:", err, "raw:", raw);
        setDailyTotals({});
        return;
      }

      if (!Array.isArray(categories)) {
        console.error("sb_categories is not an array:", categories);
        setDailyTotals({});
        return;
      }

      const totals: Record<string, number> = {};

      categories.forEach((cat: any, catIndex: number) => {
        const history = Array.isArray(cat?.history) ? cat.history : [];
        history.forEach((h: any, histIndex: number) => {
          // Basic validation
          if (!h) {
            console.warn(`Skipping empty history item (cat ${catIndex} hist ${histIndex})`);
            return;
          }

          // Parse timestamp -> date
          const date = new Date(h.timestamp);
          if (Number.isNaN(date.getTime())) {
            console.warn(
              `Skipping invalid timestamp (cat ${catIndex} hist ${histIndex}):`,
              h.timestamp
            );
            return;
          }

          if (date.getFullYear() !== year || date.getMonth() !== month) {
            // not in current month/year
            return;
          }

          const key = date.toISOString().slice(0, 10);

          // Ensure amount is a number
          let amountNum = h.amount;
          if (typeof amountNum === "string") {
            // Remove commas and whitespace then try parse
            const cleaned = amountNum.replace(/[,\s]/g, "");
            amountNum = cleaned === "" ? 0 : Number(cleaned);
          }

          if (typeof amountNum !== "number" || Number.isNaN(amountNum)) {
            console.warn(
              `Skipping invalid amount (cat ${catIndex} hist ${histIndex}):`,
              h.amount
            );
            return;
          }

          totals[key] = (totals[key] || 0) + amountNum;
        });
      });

      setDailyTotals(totals);
    } catch (err) {
      console.error("Unexpected error while loading daily totals:", err);
      setDailyTotals({});
    }
  };

  loadDailyTotals();
}, [year, month]);

const prevMonth = () =>
  setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

const nextMonth = () =>
  setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));


  return (
    <div className={styles.container}>
      <div className={styles.monthHeader}>
        <button onClick={prevMonth} className={styles.arrowBtn}>
          &lt;
        </button>
        <h2 className={styles.monthTitle}>
          {year}/{month + 1}
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
        ※ Currency: {selected}
      </div>
    </div>
  );
}
