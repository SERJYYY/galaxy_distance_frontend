// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { api_proxy_addr, img_proxy_addr, dest_root } from "./src/utils/target_config";

export default defineConfig({
  plugins: [react()],
  base: dest_root,
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: api_proxy_addr,  // 👈 Теперь: http://web:8000
        changeOrigin: true,
        // 👇 УДАЛИТЕ rewrite — Django ожидает /api/galaxies/, а не /galaxies/
        // rewrite: (path) => path.replace(/^\/api/, ""),  ← Закомментируйте или удалите!
      },
      "/img-proxy": {
        target: img_proxy_addr,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/img-proxy/, ""),
      },
    },
  },
});