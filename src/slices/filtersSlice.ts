// src/slices/filtersSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";  // 👇 type-only импорт

// 👇 Тип состояния фильтров
export interface FiltersState {
  search: string;  // Поисковый запрос
  recentlyViewed: boolean;  // Фильтр "только просмотренные"
}

// 👇 Начальное состояние: пытаемся загрузить из localStorage
const loadInitialState = (): FiltersState => {
  try {
    const saved = localStorage.getItem("galaxy_filters");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Не удалось загрузить фильтры из localStorage:", err);
  }
  return {
    search: "",
    recentlyViewed: false,
  };
};

const initialState: FiltersState = loadInitialState();

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // 👇 Установить поисковый запрос
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      // 👇 Сохраняем в localStorage при каждом изменении
      try {
        localStorage.setItem("galaxy_filters", JSON.stringify(state));
      } catch (err) {
        console.warn("Не удалось сохранить фильтры:", err);
      }
    },
    
    // 👇 Установить фильтр "только просмотренные"
    setRecentlyViewedFilter: (state, action: PayloadAction<boolean>) => {
      state.recentlyViewed = action.payload;
      try {
        localStorage.setItem("galaxy_filters", JSON.stringify(state));
      } catch (err) {
        console.warn("Не удалось сохранить фильтры:", err);
      }
    },
    
    // 👇 Очистить все фильтры
    clearFilters: (state) => {
      state.search = "";
      state.recentlyViewed = false;
      try {
        localStorage.setItem("galaxy_filters", JSON.stringify(state));
      } catch (err) {
        console.warn("Не удалось сохранить фильтры:", err);
      }
    },
    
    // 👇 Загрузить фильтры из localStorage (для синхронизации между вкладками)
    loadFiltersFromStorage: (state) => {
      try {
        const saved = localStorage.getItem("galaxy_filters");
        if (saved) {
          const parsed = JSON.parse(saved);
          state.search = parsed.search ?? "";
          state.recentlyViewed = parsed.recentlyViewed ?? false;
        }
      } catch (err) {
        console.warn("Не удалось загрузить фильтры:", err);
      }
    },
  },
});

// 👇 Экспортируем экшены
export const {
  setSearchFilter,
  setRecentlyViewedFilter,
  clearFilters,
  loadFiltersFromStorage,
} = filtersSlice.actions;

// 👇 Экспортируем редьюсер
export default filtersSlice.reducer;

// 👇 Селекторы для удобного доступа
export const selectSearchFilter = (state: { filters: FiltersState }) => state.filters.search;
export const selectRecentlyViewedFilter = (state: { filters: FiltersState }) => state.filters.recentlyViewed;
export const selectAllFilters = (state: { filters: FiltersState }) => state.filters;