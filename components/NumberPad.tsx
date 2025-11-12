"use client";
import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  title?: string;
};

export default function NumberPad({
  open,
  onClose,
  onSubmit,
  title = "Enter amount",
}: Props) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!open) setDisplay("0");
  }, [open]);

  const append = (d: string) =>
    setDisplay((prev) =>
      prev === "0" && d !== "." ? d : (prev + d).slice(0, 16)
    );

  const appendDot = () => {
    if (!display.includes(".")) setDisplay((d) => d + ".");
  };
  const backspace = () =>
    setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
  const clear = () => setDisplay("0");

  const submit = () => {
    const v = parseFloat(display);
    if (Number.isFinite(v) && v > 0) {
      onSubmit(v);
      setDisplay("0");
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        setDisplay("0");
        onClose();
      }}
    >
      <div className="modal numpad-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="numpad-display" aria-live="polite">
          {display}
        </div>

        <div className="numpad-grid" role="grid" aria-label="number pad">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "←"].map(
            (k) => (
              <button
                key={k}
                type="button"
                className={`numpad-btn ${k === "←" ? "action" : ""}`}
                onClick={() => {
                  if (k === "←") backspace();
                  else if (k === ".") appendDot();
                  else append(k);
                }}
              >
                {k}
              </button>
            )
          )}
        </div>

        <div className="numpad-actions">
          <button type="button" className="btn" onClick={clear}>
            Clear
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDisplay("0");
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={submit}
            disabled={!parseFloat(display) || parseFloat(display) <= 0}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
