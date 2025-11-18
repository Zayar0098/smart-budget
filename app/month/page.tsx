"use client";
import { useEffect, useState } from "react";
import { useCurrency } from "../../components/CurrencyProvider";
import styles from "./page.module.css";

type HistoryItem = {
  id: string;
  amount: number;
  timestamp: string;
};

type Category = {
  id: string;
  name: string;
  spent: number;
  history: HistoryItem[];
};

type MonthHistoryItem = HistoryItem & {
  categoryId: string;
  categoryName: string;
};

export default function CalendarPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const { convertFromJPY, formatFromJPY, selected } = useCurrency();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0

  // Load categories and daily totals
  useEffect(() => {
    const raw = localStorage.getItem("sb_categories");
    if (!raw) {
      setCategories([]);
      setDailyTotals({});
      return;
    }

    try {
      const parsed: Category[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Not an array");

      setCategories(parsed);

      const totals: Record<string, number> = {};
      parsed.forEach((cat) => {
        cat.history.forEach((h) => {
          const date = new Date(h.timestamp);
          if (
            date.getFullYear() === year &&
            date.getMonth() === month &&
            !isNaN(date.getTime())
          ) {
            const key = date.toISOString().slice(0, 10);
            totals[key] = (totals[key] || 0) + Number(h.amount);
          }
        });
      });

      setDailyTotals(totals);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
      setDailyTotals({});
    }
  }, [year, month]);

  // Month navigation
  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Prepare month history
  const monthHistory: MonthHistoryItem[] = [];
  categories.forEach((cat) => {
    cat.history.forEach((h) => {
      const date = new Date(h.timestamp);
      if (date.getFullYear() === year && date.getMonth() === month) {
        monthHistory.push({ ...h, categoryId: cat.id, categoryName: cat.name });
      }
    });
  });

  // Group history by date
  const groupedHistory: Record<string, MonthHistoryItem[]> = {};
  monthHistory.forEach((h) => {
    const dayKey = new Date(h.timestamp).toISOString().slice(0, 10);
    if (!groupedHistory[dayKey]) groupedHistory[dayKey] = [];
    groupedHistory[dayKey].push(h);
  });

  return (
    <div className={styles.container}>
      {/* Month Header */}
      <div className={styles.monthHeader}>
        <button onClick={prevMonth} className={styles.arrowBtn}>&lt;</button>
        <h2 className={styles.monthTitle}>{year}/{month + 1}</h2>
        <button onClick={nextMonth} className={styles.arrowBtn}>&gt;</button>
      </div>

      {/* Week Header */}
      <div className={styles.weekHeader}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className={styles.weekHeaderCell}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={styles.grid}>
        {[...Array(startWeekday)].map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyCell}></div>
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const spentJPY = dailyTotals[date] || 0;
          const spent = convertFromJPY(spentJPY);

          return (
            <div key={date} className={styles.dayBox}>
              <div className={styles.dayNumber}>{day}</div>
              <div className={styles.spentAmount}>{spent > 0 ? Math.round(spent).toLocaleString() : " "}</div>
            </div>
          );
        })}
      </div>

      {/* History Section */}
      <div className={styles.historyContainer}>
        {Object.keys(groupedHistory).length === 0 ? (
          <div className={styles.noHistory}>No History</div>
        ) : (
          Object.keys(groupedHistory)
            .sort((a, b) => b.localeCompare(a))
            .map((dateKey) => (
              <div key={dateKey} className={styles.historyDateGroup}>
                <div className={styles.historyDateTitle}>{new Date(dateKey).toLocaleDateString()}</div>
                <ul className={styles.historyList}>
                  {groupedHistory[dateKey]
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                    .map((h) => (
                      <li key={h.id} className={styles.historyItem}>
                        <div className={styles.historyCategory}>{h.categoryName}</div>
                        <div className={styles.historyAmount}>{formatFromJPY(h.amount)}</div>
                        <div className={styles.historyDate}>{new Date(h.timestamp).toLocaleTimeString()}</div>
                      </li>
                    ))}
                </ul>
              </div>
            ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.footerNote}>※ Currency: {selected}</div>
    </div>
  );
}
