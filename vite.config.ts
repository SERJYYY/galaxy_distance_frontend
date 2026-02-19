import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true, // для hot-reload в Docker на Windows
    },
    proxy: {
      "/api": {
        target: "http://web:8000", // имя сервиса в docker-compose
        changeOrigin: true,
        secure: false, // важно для HTTP в dev-режиме
        // 👇 Критично для cookie-сессий:
        cookieDomainRewrite: "localhost", // переписывает домен cookie на localhost
        cookiePathRewrite: "/", // переписывает путь cookie
        // 👇 Опционально: логирование для отладки
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("→ Proxy:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("← Proxy:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});