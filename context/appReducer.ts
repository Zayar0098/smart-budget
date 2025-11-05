// context/appReducer.ts
import { AppState, AppAction } from "@/types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

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

    default:
      return state;
  }
}
