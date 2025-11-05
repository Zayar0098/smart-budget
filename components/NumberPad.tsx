"use client";

import { useEffect, useState } from "react";

type Props = {
  initial?: string; // 初期表示（数字文字列）
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  maxDigits?: number;
};

export default function NumberPad({
  initial = "",
  visible,
  onClose,
  onConfirm,
  maxDigits = 9,
}: Props) {
  const [value, setValue] = useState<string>(initial.replace(/^0+/, ""));

  useEffect(() => {
    setValue(initial.replace(/^0+/, ""));
  }, [initial, visible]);

  if (!visible) return null;

  const push = (d: string) => {
    if (value.length >= maxDigits) return;
    setValue((v) => (v === "0" ? d : v + d));
  };

  const back = () => {
    setValue((v) => (v.length <= 1 ? "" : v.slice(0, -1)));
  };

  const clear = () => setValue("");

  const confirm = () => {
    const n = Number(value || 0);
    if (isNaN(n) || n < 0) return;
    onConfirm(Math.round(n));
    onClose();
  };

  const format = (v: string) =>
    v === ""
      ? "0"
      : Number(v).toLocaleString("ja-JP", { maximumFractionDigits: 0 });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 14, color: "#555" }}>入力</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{format(value)}</div>
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => push(d)}
                style={{ padding: 14, fontSize: 18 }}
              >
                {d}
              </button>
            ))}
            <button onClick={clear} style={{ padding: 14, fontSize: 16 }}>
              C
            </button>
            <button
              onClick={() => push("0")}
              style={{ padding: 14, fontSize: 18 }}
            >
              0
            </button>
            <button onClick={back} style={{ padding: 14, fontSize: 16 }}>
              ⌫
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 12 }}>
              キャンセル
            </button>
            <button
              onClick={confirm}
              style={{
                flex: 1,
                padding: 12,
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            >
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
