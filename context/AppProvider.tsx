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
    { id: "rent", name: "Rent house", spent: 0, locked: true },
    { id: "gas", name: "Gas bill", spent: 0, locked: true },
    { id: "electric", name: "Electric bill", spent: 0, locked: true },
    { id: "water", name: "Water bill", spent: 0, locked: true },
  ],
};

type Ctx = { state: AppState; dispatch: React.Dispatch<any> };
const AppContext = createContext<Ctx>({
  state: initialState,
  dispatch: () => {},
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
