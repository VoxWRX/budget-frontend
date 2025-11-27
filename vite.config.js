import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // On garde juste l'augmentation de la limite pour ne pas avoir le warning jaune
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
