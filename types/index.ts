// types/index.ts
export type Currency = "USD" | "JPY";

export type Category = {
  id: string;
  name: string;
  spent: number;
  limit?: number;
  locked?: boolean; // true = cannot rename/remove
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
  | { type: "ADD_SPENT"; payload: { id: string; amount: number } }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: { id: string } } // added
  | { type: "SET_INCOME"; payload: number }
  | { type: "SET_LIMIT"; payload: number };
// add more later if needed (SET_CURRENCY, TOGGLE_SAVING, etc.)
