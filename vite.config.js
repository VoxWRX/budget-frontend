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
          if (id.includes("node_modules")) {
            // On isole SEULEMENT Recharts (c'est lui le plus lourd)
            if (id.includes("recharts")) {
              return "recharts";
            }

            // --- MODIFICATION ICI ---
            // On a supprimé le bloc qui isolait 'react' et 'react-dom'.
            // On met tout le reste (y compris React) dans un fichier "vendor" unique.
            // C'est beaucoup plus sûr pour éviter les bugs de chargement.
            return "vendor";
          }
        },
      },
    },
  },
});
