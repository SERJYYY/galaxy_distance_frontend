// src/types/tauri.d.ts

// Расширяем глобальный интерфейс Window для поддержки Tauri
export {};

declare global {
  interface Window {
    __TAURI__?: {
      // 👇 Базовая структура Tauri API (можно расширять по мере необходимости)
      invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      convertFileSrc?: (filePath: string, protocol?: string) => string;
      // 👇 Добавьте другие методы Tauri API по мере необходимости
    };
  }
}