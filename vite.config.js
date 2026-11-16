import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const radice = import.meta.dirname;

// Tre pagine: / (pagina iniziale), /crea/ (titolare), /app/ (dipendente, installabile).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // La registra solo l'app del dipendente (src/main.jsx), con scope /app/
      injectRegister: false,
      scope: "/app/",
      // Il manifest lo crea l'app al volo (src/lib/manifest.js): start_url = link del modulo
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        // Senza rete, ogni indirizzo dell'app apre l'app; le altre pagine non c'entrano
        navigateFallback: "/app/index.html",
        navigateFallbackAllowlist: [/^\/app\//],
        // SheetJS rende il pacchetto JS grande: alziamo il limite perché finisca comunque nella cache offline
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        home: resolve(radice, "index.html"),
        crea: resolve(radice, "crea/index.html"),
        app: resolve(radice, "app/index.html"),
      },
    },
  },
});
