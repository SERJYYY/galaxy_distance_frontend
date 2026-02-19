// Для Tauri build используем реальные IP и порты сервиса
const target_tauri = true;

export const api_proxy_addr = "http://host.docker.internal:8000"; // бэкенд Django
export const img_proxy_addr = "http://host.docker.internal:9000"; // MinIO
export const dest_api = target_tauri ? api_proxy_addr : "/api";
export const dest_img = target_tauri ? img_proxy_addr : "/img-proxy";
export const dest_root = target_tauri ? "" : "/";
