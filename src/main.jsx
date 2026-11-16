import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import { chiediPersistenza } from "./lib/storage.js";
import "./styles.css";

registerSW({ immediate: true });
chiediPersistenza();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
