// context/AppProvider.tsx
"use client";
import React, { createContext, useContext, useReducer } from "react";
import { appReducer } from "./appReducer";
import type { AppState } from "@/types";

const initialState: AppState = {
  income: 0,
  limit: 0,
  currency: "USD",
  savingMode: false,
  categories: [
    { id: "rent", name: "Rent house", spent: 0 },
    { id: "gas", name: "Gas bill", spent: 0 },
    { id: "electric", name: "Electric bill", spent: 0 },
    { id: "water", name: "Water bill", spent: 0 },
    { id: "coffee", name: "Coffee", spent: 0 },
    { id: "snack", name: "Snack", spent: 0 },
    { id: "juice", name: "Juice", spent: 0 },
    { id: "water2", name: "water", spent: 0 },
  ],
};
 
type DispatchType = React.Dispatch<Parameters<typeof appReducer>[1]>;
type Ctx = { state: AppState; dispatch: DispatchType };
const AppContext = createContext<Ctx>({
  state: initialState,
  dispatch: (() => null) as unknown as DispatchType,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
