// src/utils/galaxyApi.ts
import axios from "axios";
import type { Galaxy } from "../api/Api";

// 👇 Утилита для получения CSRF-токена
function getCsrfToken(): string | null {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue || null;
}

// 👇 Заголовки для запросов
const getHeaders = () => ({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
  },
});

/**
 * Получить список галактик
 */
export const getGalaxies = async (search?: string): Promise<Galaxy[]> => {
  const response = await axios.get<Galaxy[]>(
    "/api/galaxies/",  // 👈 ОТНОСИТЕЛЬНЫЙ URL (вместо http://localhost:8000/api/galaxies/)
    {
      ...getHeaders(),
      params: search ? { search } : {},
    }
  );
  return response.data;
};

/**
 * Получить деталь галактики по ID
 */
export const getGalaxyDetail = async (id: number): Promise<Galaxy> => {
  const response = await axios.get<Galaxy>(
    `/api/galaxies/${id}/`,  // 👈 ОТНОСИТЕЛЬНЫЙ URL
    getHeaders()
  );
  return response.data;
};

/**
 * Получить количество услуг в черновике
 */
export const getCartCount = async (): Promise<number> => {
  const response = await axios.get<{ count: number }>(
    "/api/galaxy_requests/cart-icon/",  // 👈 ОТНОСИТЕЛЬНЫЙ URL
    getHeaders()
  );
  return response.data.count || 0;
};

/**
 * Отследить просмотр галактики
 */
export const trackGalaxyView = async (galaxyId: number): Promise<void> => {
  await axios.post(
    "/api/galaxies/track-view/",  // 👈 ОТНОСИТЕЛЬНЫЙ URL
    { galaxy_id: galaxyId },
    getHeaders()
  );
};

/**
 * Получить недавно просмотренные галактики
 */
export const getRecentlyViewed = async (): Promise<Galaxy[]> => {
  const response = await axios.get<Galaxy[]>(
    "/api/galaxies/recently-viewed/",  // 👈 ОТНОСИТЕЛЬНЫЙ URL
    getHeaders()
  );
  return response.data;
};