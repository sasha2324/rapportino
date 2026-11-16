import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Crea from "./Crea.jsx";
import "../styles.css"; // gli stili dell'app servono all'anteprima
import "./crea.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Crea />
  </StrictMode>
);
