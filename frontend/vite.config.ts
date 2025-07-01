import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

const manualChunks = (id: string) => {
  if (id.includes("node_modules")) {
    // Разделяем зависимости из node_modules на отдельные чанки
    if (id.includes("vue") || id.includes("@vue")) return "vendor-vue";
    if (id.includes("axios")) return "vendor-axios";
    if (id.includes("socket.io-client")) return "vendor-socket";
    return "vendor"; // Остальные зависимости в общий чанк
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  build: {
    rollupOptions: {
      output: {
        manualChunks, // Применяем ручное управление чанками
      },
    },
    chunkSizeWarningLimit: 1000, // Увеличиваем лимит до 1000 КБ
  },
});
