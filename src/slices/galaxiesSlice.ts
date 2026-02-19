// src/slices/galaxiesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Galaxy } from "../api/Api";
import type { RootState, AppDispatch } from "../store";

interface GalaxiesState {
  galaxies: Galaxy[];
  filteredGalaxies: Galaxy[];
  loading: boolean;
  error: string | null;
  cartCount: number;
}

const initialState: GalaxiesState = {
  galaxies: [],
  filteredGalaxies: [],
  loading: false,
  error: null,
  cartCount: 0,
};

/**
 * Thunk для загрузки списка галактик
 */
export const fetchGalaxies = createAsyncThunk(
  "galaxies/fetchGalaxies",
  async (_, _thunkAPI) => {
    try {
      const response = await api.galaxies.galaxiesList();
      return response.data;
    } catch (error: any) {
      return _thunkAPI.rejectWithValue(
        error.response?.data?.error || "Ошибка загрузки галактик"
      );
    }
  }
);

/**
 * Thunk для получения количества услуг в черновике (корзина)
 */
export const fetchCartCount = createAsyncThunk(
  "galaxies/fetchCartCount",
  async (_, _thunkAPI) => {
    try {
      const response = await api.galaxyRequests.getCartIcon();
      return response.data.count || 0;
    } catch (_error) {
      return 0;
    }
  }
);

/**
 * Thunk для добавления галактики в черновик
 */
export const addToCart = createAsyncThunk(
  "galaxies/addToCart",
  async (galaxyId: number, thunkAPI) => {
    try {
      // 👇 ПРАВИЛЬНОЕ ИМЯ МЕТОДА из Api.ts
      await api.galaxies.addGalaxyToRequest(String(galaxyId));
      // Обновляем счётчик корзины
      thunkAPI.dispatch(fetchCartCount());
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
    setSearchQuery(state, action: { payload: string }) {
      const query = action.payload.toLowerCase();
      state.filteredGalaxies = state.galaxies.filter((galaxy) =>
        galaxy.name?.toLowerCase().includes(query)
      );
    },
    clearError(state) {
      state.error = null;
    },
    setCartCount(state, action: { payload: number }) {
      state.cartCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGalaxies
      .addCase(fetchGalaxies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalaxies.fulfilled, (state, action) => {
        state.loading = false;
        state.galaxies = action.payload;
        state.filteredGalaxies = action.payload;
      })
      .addCase(fetchGalaxies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchCartCount
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.cartCount = action.payload;
      })
      // addToCart
      .addCase(addToCart.fulfilled, (state) => {
        // Счётчик обновляется через fetchCartCount внутри thunk
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearError, setCartCount } = galaxiesSlice.actions;
export default galaxiesSlice.reducer;