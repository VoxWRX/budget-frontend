import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // On augmente la limite d'alerte à 1000 ko (1 mo) pour être tranquille
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // C'est ici qu'on configure le découpage manuel
        manualChunks(id) {
          // Si le fichier vient de node_modules (les librairies)
          if (id.includes("node_modules")) {
            // On isole Recharts car c'est très lourd
            if (id.includes("recharts")) {
              return "recharts";
            }

            // On isole React et React-DOM
            if (id.includes("react")) {
              return "react-vendor";
            }

            // Le reste des librairies va dans un fichier 'vendor' générique
            return "vendor";
          }
        },
      },
    },
  },
});
