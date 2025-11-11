"use client";

import { useEffect, useState } from "react";
// CSSモジュールをインポート
import styles from "./NumberPad.module.css"; 

type Props = {
  visible: boolean;
  initial?: string;
  onClose: () => void;
  onConfirm: (value: number) => void;
  maxDigits?: number;
};

export default function NumberPad({
  visible,
  initial = "",
  onClose,
  onConfirm,
  maxDigits = 9,
}: Props) {
  // 初期値の先頭のゼロを削除するロジックは保持
  const [value, setValue] = useState<string>(initial.replace(/^0+/, ""));

  useEffect(() => {
    setValue(initial.replace(/^0+/, ""));
  }, [initial, visible]);

  if (!visible) return null;

  const push = (d: string) => {
    if (value.length >= maxDigits) return;
    setValue((v) => (v === "" ? d : v + d)); // v === "0" の代わりに v === "" で処理を単純化
  };
  const back = () => setValue((v) => (v.length <= 1 ? "" : v.slice(0, -1)));
  const clear = () => setValue("");
  const confirm = () => {
    const n = Number(value || 0);
    if (isNaN(n) || n < 0) return;
    onConfirm(Math.round(n));
    onClose();
  };
  const format = (v: string) =>
    v === "" ? "0" : Number(v).toLocaleString("ja-JP");

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className={styles.overlay} // スタイル適用
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modalContent} // スタイル適用
      >
        {/* ディスプレイ部分 */}
        <div className={styles.displayRow}>
          <div className={styles.displayLabel}>入力</div>
          <div className={styles.displayValue}>{format(value)}</div>
        </div>

        {/* キーパッド部分 */}
        <div className={styles.keypadGrid}>
          <div className={styles.keypadGridInner}>
            {/* 数字キー 1-9 */}
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => push(d)}
                className={styles.keypadButton}
              >
                {d}
              </button>
            ))}
            
            {/* C (クリア) キー */}
            <button onClick={clear} className={styles.keypadButton}>
              C
            </button>
            
            {/* 0 (ゼロ) キー */}
            <button onClick={() => push("0")} className={styles.keypadButton}>
              0
            </button>
            
            {/* ⌫ (戻る) キー */}
            <button onClick={back} className={styles.keypadButton}>
              ⌫
            </button>
          </div>

          {/* アクションボタン (キャンセル/確定) */}
          <div className={styles.actionRow}>
            <button 
              onClick={onClose} 
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              onClick={confirm}
              className={styles.confirmButton}
            >
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}