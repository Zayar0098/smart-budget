"use client";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import NumberPad from "@/components/NumberPad";
import DesktopAmountModal from "@/components/DesktopAmountModal";
import useIsMobile from "@/hooks/useIsMobile";

type Props = { open: boolean; onClose: () => void; catId?: string };

export default function AddAmountDialog({ open, onClose, catId }: Props) {
  const { state, dispatch } = useApp();
  const isMobile = useIsMobile();

  const [selected, setSelected] = useState<string | undefined>(
    catId ?? state.categories[0]?.id
  );
  const [showPad, setShowPad] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(catId ?? state.categories[0]?.id);
      setShowPad(Boolean(isMobile && catId)); // if mobile + specific cat -> open pad immediately
      setShowDesktop(Boolean(!isMobile));
    } else {
      setShowPad(false);
      setShowDesktop(false);
    }
  }, [open, catId, state.categories, isMobile]);

  const submitAmount = (amount: number, opts?: { categoryId?: string }) => {
    const id = opts?.categoryId ?? selected;
    if (!id) return;
    dispatch({ type: "ADD_SPENT", payload: { id, amount } });
  };

  if (!open) return null;

  // Mobile flow: select (if no catId) -> NumberPad
  if (isMobile) {
    return (
      <>
        {!showPad && (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Select category</h3>
              <select
                className="select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="row">
                <button className="btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    if (!selected) return;
                    setShowPad(true);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        <NumberPad
          open={showPad}
          onClose={() => {
            setShowPad(false);
            onClose();
          }}
          title={
            selected
              ? `Add to ${
                  state.categories.find((c) => c.id === selected)?.name ?? ""
                }`
              : "Enter amount"
          }
          onSubmit={(amt) => {
            submitAmount(amt, { categoryId: selected });
            setShowPad(false);
            onClose();
          }}
        />
      </>
    );
  }

  // Desktop flow: keyboard modal
  return (
    <DesktopAmountModal
      open={showDesktop}
      onClose={() => {
        setShowDesktop(false);
        onClose();
      }}
      mode="category"
      categoryId={selected}
      onSubmit={(amt, opts) => {
        submitAmount(amt, opts);
        setShowDesktop(false);
        onClose();
      }}
    />
  );
}
