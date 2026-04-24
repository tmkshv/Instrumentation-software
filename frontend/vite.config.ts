import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev` the React app runs on :5173 and proxies /api to the
// FastAPI backend on :8000. In production the backend serves the built dist/
// directly, so the proxy doesn't matter.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
