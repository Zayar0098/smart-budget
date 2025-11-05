"use client";
import { useApp } from "@/context/AppProvider";

export default function Header() {
  const { state, dispatch } = useApp();
  return (
    <header className="header">
      <div className="logo">LOGO</div>
      <div className="header-right">
        <select
          className="select"
          value={state.currency}
          onChange={(e) =>
            dispatch({
              type: "SET_DATA",
              payload: { currency: e.target.value as typeof state.currency },
            })
          }
        >
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
        </select>
        <div className="toggle">
          <span>Saving</span>
          <input
            type="checkbox"
            checked={state.savingMode}
            onChange={(e) =>
              dispatch({
                type: "SET_DATA",
                payload: { savingMode: e.target.checked },
              })
            }
          />
        </div>
      </div>
    </header>
  );
}
