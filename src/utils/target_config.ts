// src/utils/target_config.ts

// 👇 Флаг: true для Tauri build, false для веба/GitHub Pages
export const target_tauri = false;  // ← Меняйте здесь!

// 👇 IP вашего компьютера в сети (узнайте через: ipconfig / npm run dev -- --host)
export const api_proxy_addr = "http://10.43.164.209:8000";  // Django API
export const img_proxy_addr = "http://10.43.164.209:8000";  // Django Media

// 👇 Условные пути для API и картинок
export const dest_api = target_tauri ? api_proxy_addr : "/api";
export const dest_img = target_tauri ? img_proxy_addr : "/img-proxy";

// 👇 Базовый путь для роутинга (пустой для Tauri, с префиксом для GitHub Pages)
export const dest_root = target_tauri ? "" : "/galaxy_distance_frontend";