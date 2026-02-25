// src/slices/filtersSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  search: string;
}

// Загрузка начального состояния из localStorage
const loadInitialState = (): FiltersState => {
  try {
    const saved = localStorage.getItem("galaxy_filters");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Не удалось загрузить фильтры из localStorage:", err);
  }
  return { search: "" };
};

const initialState: FiltersState = loadInitialState();

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      try {
        localStorage.setItem("galaxy_filters", JSON.stringify(state));
      } catch (err) {
        console.warn("Не удалось сохранить фильтры:", err);
      }
    },
    clearSearchFilter: (state) => {
      state.search = "";
      try {
        localStorage.setItem("galaxy_filters", JSON.stringify(state));
      } catch (err) {
        console.warn("Не удалось сохранить фильтры:", err);
      }
    },
  },
});

export const { setSearchFilter, clearSearchFilter } = filtersSlice.actions;
export default filtersSlice.reducer;
export const selectSearchFilter = (state: { filters: FiltersState }) => state.filters.search;