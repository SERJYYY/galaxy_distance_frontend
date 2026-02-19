// src/store.ts
import { configureStore } from "@reduxjs/toolkit";
import galaxiesReducer from "./slices/galaxiesSlice";
import authReducer from "./slices/authSlice"; // 👈 Добавляем auth

export const store = configureStore({
  reducer: {
    galaxies: galaxiesReducer,
    auth: authReducer, // 👈 Регистрируем слайс
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;