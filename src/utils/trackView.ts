// src/utils/trackView.ts
import axios from "axios";

/**
 * Отправляет на бэкенд информацию о просмотре галактики
 */
export const trackGalaxyView = async (galaxyId: number) => {
  try {
    await axios.post(
      "http://localhost:8000/api/galaxies/track-view/",
      { galaxy_id: galaxyId },
      {
        withCredentials: true, // 👈 Отправляем куки (guest_session_id)
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Ошибка отслеживания просмотра:", err);
  }
};

/**
 * Получает список недавно просмотренных галактик
 */
export const getRecentlyViewed = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/galaxies/recently-viewed/",
      {
        withCredentials: true, // 👈 Отправляем куки
      }
    );
    return response.data;
  } catch (err) {
    console.error("Ошибка получения просмотренных:", err);
    return [];
  }
};