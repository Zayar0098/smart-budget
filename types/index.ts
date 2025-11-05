// types/index.ts
export type Currency = "USD" | "JPY";

export type Category = {
  id: string;
  name: string;
  spent: number;
  limit?: number;
};

export type AppState = {
  categories: Category[];
  income: number;
  limit: number;
  currency: Currency;
  savingMode: boolean;
};

export type AppAction =
  | { type: "SET_DATA"; payload: Partial<AppState> }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "SET_INCOME"; payload: number }
  | { type: "SET_LIMIT"; payload: number };
// add more later if needed (SET_CURRENCY, TOGGLE_SAVING, etc.)
