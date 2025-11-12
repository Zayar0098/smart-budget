// context/appReducer.ts
import { AppState, AppAction } from "@/types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };

    case "ADD_CATEGORY": {
      const name = action.payload.name.trim().toLowerCase();
      // prevent duplicate by name (case-insensitive)
      if (state.categories.some((c) => c.name.trim().toLowerCase() === name)) {
        return state;
      }
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    }

    case "ADD_SPENT": {
      const { id, amount } = action.payload;
      if (!amount || amount <= 0) return state;
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, spent: (c.spent || 0) + amount } : c
        ),
      };
    }

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.name === action.payload.name ? action.payload : cat
        ),
      };

    case "SET_INCOME":
      return { ...state, income: action.payload };

    case "SET_LIMIT":
      return { ...state, limit: action.payload };

    case "DELETE_CATEGORY": {
      const cat = state.categories.find((c) => c.id === action.payload.id);
      if (!cat || cat.locked) return state; // ignore if not found or locked
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== cat.id),
      };
    }

    default:
      return state;
  }
}
