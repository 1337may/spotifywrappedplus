import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/login": { target: "http://127.0.0.1:8888", changeOrigin: true },
      "/refresh": { target: "http://127.0.0.1:8888", changeOrigin: true },
    },
  },
});
