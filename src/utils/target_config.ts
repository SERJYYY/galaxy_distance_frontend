// src/utils/target_config.ts

// 👇 Флаг: true для Tauri build, false для веба/GitHub Pages/Docker
export const target_tauri = false;

// 👇 Для Docker используем имя сервиса 'web' из docker-compose.yml
// localhost:8000 НЕ работает внутри контейнера!
export const api_proxy_addr = "http://web:8000";  // ✅ Django API в Docker
export const img_proxy_addr = "http://web:8000";   // ✅ Django Media в Docker

// 👇 Условные пути для API и картинок
export const dest_api = target_tauri ? api_proxy_addr : "/api";
export const dest_img = target_tauri ? img_proxy_addr : "/img-proxy";

// 👇 Базовый путь для роутинга (пустой для Tauri, с префиксом для GitHub Pages)
export const dest_root = target_tauri ? "" : "/galaxy_distance_frontend";