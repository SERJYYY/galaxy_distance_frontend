import { Api } from "./Api";

export const api = new Api({
  baseURL: "/api",
  withCredentials: true,
});

// 👇 Интерцептор для автоматической отправки CSRF-токена
api.instance.interceptors.request.use((config) => {
  // Получаем csrftoken из cookie (Django устанавливает его при первом GET-запросе)
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  
  if (csrfToken && config.headers) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

// 👇 Интерцептор для обработки 401/403 (сессия истекла)
api.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Сессия истекла, требуется повторный вход");
      // Опционально: диспатчить logout в Redux
    }
    return Promise.reject(error);
  }
);