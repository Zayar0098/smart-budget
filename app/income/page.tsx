"use client";

import { useApp } from "@/context/AppProvider";
import BottomNav from "@/components/BottomNav";

export default function IncomePage() {
  const { state, dispatch } = useApp();

  return (
    <>
      <section className="container">
        <h1>Income</h1>
        <div className="card" style={{ maxWidth: 360 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span className="muted">Monthly income</span>
            <input
              type="number"
              value={state.income}
              onChange={(e) =>
                dispatch({
                  type: "SET_INCOME",
                  payload: Number(e.target.value) || 0,
                })
              }
              style={{
                padding: 8,
                border: "1px solid var(--line)",
                borderRadius: 6,
              }}
            />
          </label>
        </div>
      </section>
      <BottomNav />
    </>
  );
}
