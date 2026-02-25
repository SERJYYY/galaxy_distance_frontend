// src/vite-env.d.ts
/// <reference types="vite/client" />

// 👇 Типы для переменных окружения Vite
interface ImportMetaEnv {
  readonly VITE_ZEROTIER_IP: string;
  readonly VITE_API_TARGET: string;
  readonly VITE_MINIO_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}