import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import { chiediPersistenza } from "./lib/storage.js";
import "./styles.css";

registerSW({ immediate: true });
chiediPersistenza();

// Un link nuovo nella stessa scheda cambia solo la parte dopo il #, e il browser non ricarica:
// ricarichiamo noi, così il modulo del link viene controllato e scelto come all'apertura.
window.addEventListener("hashchange", () => window.location.reload());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
