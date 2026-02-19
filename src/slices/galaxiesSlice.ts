// src/slices/galaxiesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Galaxy } from "../api/Api";

interface GalaxiesState {
  galaxies: Galaxy[];
  filteredGalaxies: Galaxy[];
  detail: Galaxy | null;
  detailLoading: boolean;
  detailError: string | null;
  loading: boolean;
  error: string | null;
  cartCount: number;
}

const initialState: GalaxiesState = {
  galaxies: [],
  filteredGalaxies: [],
  detail: null,
  detailLoading: false,
  detailError: null,
  loading: false,
  error: null,
  cartCount: 0,
};

/**
 * 👇 ТОЛЬКО ЭТОТ THUNK ОСТАЁТСЯ (добавление в черновик)
 * Использует кодогенерацию из api/Api
 */
export const addToCart = createAsyncThunk(
  "galaxies/addToCart",
  async (galaxyId: number, thunkAPI) => {
    try {
      await api.galaxies.addGalaxyToRequest(String(galaxyId));
      return true;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Ошибка добавления в черновик"
      );
    }
  }
);

const galaxiesSlice = createSlice({
  name: "galaxies",
  initialState,
  reducers: {
    // 👇 Загрузка списка галактик (синхронные редюсеры)
    fetchGalaxiesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchGalaxiesSuccess(state, action: { payload: Galaxy[] }) {
      state.loading = false;
      state.galaxies = action.payload;
      state.filteredGalaxies = action.payload;
    },
    fetchGalaxiesFailure(state, action: { payload: string }) {
      state.loading = false;
      state.error = action.payload;
    },

    // 👇 Загрузка детали галактики (синхронные редюсеры)
    fetchGalaxyDetailStart(state) {
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchGalaxyDetailSuccess(state, action: { payload: Galaxy }) {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchGalaxyDetailFailure(state, action: { payload: string }) {
      state.detailLoading = false;
      state.detailError = action.payload;
    },

    // 👇 Поиск
    setSearchQuery(state, action: { payload: string }) {
      const query = action.payload.toLowerCase();
      state.filteredGalaxies = state.galaxies.filter((galaxy) =>
        galaxy.name.toLowerCase().includes(query)
      );
    },

    // 👇 Ошибки
    clearError(state) {
      state.error = null;
      state.detailError = null;
    },
    clearDetail(state) {
      state.detail = null;
      state.detailLoading = false;
      state.detailError = null;
    },

    // 👇 Корзина
    setCartCount(state, action: { payload: number }) {
      state.cartCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 👇 addToCart (единственный thunk)
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        // Счётчик обновляется отдельно через getCartCount
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 👇 Экспортируем все синхронные экшены (БЕЗ addToCart)
export const {
  fetchGalaxiesStart,
  fetchGalaxiesSuccess,
  fetchGalaxiesFailure,
  fetchGalaxyDetailStart,
  fetchGalaxyDetailSuccess,
  fetchGalaxyDetailFailure,
  setSearchQuery,
  clearError,
  clearDetail,
  setCartCount,
} = galaxiesSlice.actions;

// 👇 addToCart экспортируется отдельно выше (это thunk, не reducer action)

export default galaxiesSlice.reducer;