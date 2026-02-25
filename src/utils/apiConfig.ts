// src/utils/apiConfig.ts

// 👇 Определяем, запущено ли приложение в Tauri
export const isTauri = !!(window as Window & { __TAURI__?: unknown }).__TAURI__;

// 👇 ВАШ ZeroTier IP (зафиксируйте!)
export const ZERO_TIER_IP = "10.43.164.209";  // ← Ваш IP из zerotier-cli!
export const API_PORT = 8000;

// 👇 Получаем базовый URL API в зависимости от платформы
export const getApiBaseUrl = () => {
  if (isTauri) {
    // Tauri: подключаемся к бэкенду по ZeroTier IP
    return `http://${ZERO_TIER_IP}:${API_PORT}/api`;
  }
  // Веб/локалхост: используем прокси Vite
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();