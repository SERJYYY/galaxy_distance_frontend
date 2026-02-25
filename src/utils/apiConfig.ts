// src/utils/apiConfig.ts

export const isTauri = (): boolean => {
  return !!(window as Window & { __TAURI__?: unknown }).__TAURI__;
};

// 👇 Безопасный доступ к Vite env через type assertion
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const ZEROTIER_IP = env.VITE_ZEROTIER_IP || "10.43.164.209";

export const API_BASE_URL = isTauri()
  ? `http://${ZEROTIER_IP}:8000/api`
  : "/api";

export const getApiHeaders = () => ({
  "Content-Type": "application/json",
});

export const getCsrfToken = (): string | null => {
  if (isTauri()) return null;
  const name = "csrftoken";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || null;
};

export const getApiHeadersWithCsrf = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!isTauri()) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }
  return headers;
};

export const getMinioUrl = (path: string): string => {
  if (path.startsWith('http')) {
    if (!isTauri() && path.includes('localhost:9000')) {
      return path.replace('localhost:9000', `${ZEROTIER_IP}:9000`);
    }
    return path;
  }
  const MINIO_URL = env.VITE_MINIO_URL || `http://${ZEROTIER_IP}:9000`;
  return `${MINIO_URL}/${path}`;
};