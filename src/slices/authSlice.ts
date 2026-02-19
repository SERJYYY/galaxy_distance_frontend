// src/slices/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

// 👇 Тип пользователя
export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  is_moderator: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 👇 Логин
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: { payload: AuthUser }) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure(state, action: { payload: string }) {
      state.loading = false;
      state.error = action.payload;
    },

    // 👇 Регистрация
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action: { payload: AuthUser }) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    registerFailure(state, action: { payload: string }) {
      state.loading = false;
      state.error = action.payload;
    },

    // 👇 Загрузка профиля
    fetchProfileStart(state) {
      state.loading = true;
    },
    fetchProfileSuccess(state, action: { payload: AuthUser }) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    fetchProfileFailure(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },

    // 👇 Обновление профиля
    updateProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess(state, action: { payload: AuthUser }) {
      state.loading = false;
      state.user = action.payload;
    },
    updateProfileFailure(state, action: { payload: string }) {
      state.loading = false;
      state.error = action.payload;
    },

    // 👇 Смена пароля
    changePasswordStart(state) {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess(state) {
      state.loading = false;
    },
    changePasswordFailure(state, action: { payload: string }) {
      state.loading = false;
      state.error = action.payload;
    },

    // 👇 Выход
    logoutSuccess(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },

    // 👇 Утилиты
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: { payload: Partial<AuthUser> }) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  logoutSuccess,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;