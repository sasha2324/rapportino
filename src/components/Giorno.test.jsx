// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Giorno from "./Giorno.jsx";

afterEach(cleanup);

const HTML = '<img src=x onerror="window.colpito=1">';
const VOCI = [
  { id: "ore", tipo: "ore", nome: "Ore lavorate" },
  { id: "cliente", tipo: "luogo", nome: "Cliente" },
  { id: "km", tipo: "numero", nome: "Km", unita: "km" },
  { id: "pranzo", tipo: "si_no", nome: HTML },
  { id: "note", tipo: "note", nome: "Note" },
];
const luoghi = { elenco: [], usa: vi.fn(), rimuovi: vi.fn() };

function monta(props = {}) {
  const onAggiorna = vi.fn();
  const utils = render(
    <Giorno
      anno={2026}
      mese={10}
      numero={16}
      giorno={{}}
      voci={VOCI}
      oggi={false}
      luogoIeri=""
      aperto
      onApri={() => {}}
      onAggiorna={onAggiorna}
      luoghi={luoghi}
      {...props}
    />
  );
  return { ...utils, onAggiorna };
}

describe("Giorno", () => {
  it("mostra le voci del modulo, con le etichette scelte dal titolare", () => {
    monta();
    expect(screen.getByText("Ore lavorate")).toBeTruthy();
    expect(screen.getByText("Cliente")).toBeTruthy();
    expect(screen.getByText("km")).toBeTruthy();
    expect(screen.getByText("Note")).toBeTruthy();
  });

  it("un nome con HTML compare come testo e non crea elementi", () => {
    const { container } = monta({ giorno: { pranzo: true } });
    expect(screen.getAllByText(HTML).length).toBeGreaterThan(0);
    expect(container.querySelector("img")).toBeNull();
    expect(window.colpito).toBeUndefined();
  });

  it("ogni voce salva con il suo id", () => {
    const { onAggiorna } = monta();
    fireEvent.change(screen.getByLabelText(/Ore lavorate/), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText(/Km/), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("button", { name: new RegExp("onerror") }));
    expect(onAggiorna).toHaveBeenCalledWith("ore", "8");
    expect(onAggiorna).toHaveBeenCalledWith("km", "42");
    expect(onAggiorna).toHaveBeenCalledWith("pranzo", true);
  });

  it("riga chiusa: luogo, ore principali, numeri con l'unità", () => {
    monta({ aperto: false, giorno: { ore: "8", cliente: "Bianchi", km: "42" } });
    expect(screen.getByText("Bianchi")).toBeTruthy();
    expect(screen.getByText("42 km")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
  });

  it("ore senza luogo: lo segnala con il nome della voce", () => {
    monta({ aperto: false, giorno: { ore: "8" } });
    expect(screen.getByText("Cliente: non indicato")).toBeTruthy();
  });

  it("il pulsante dei dati per la fattura c'è solo se ci sono dati", () => {
    monta();
    expect(screen.queryByText(/Dati dell'azienda per la fattura/)).toBeNull();
    cleanup();
    monta({ onDatiFattura: () => {} });
    expect(screen.getByText(/Dati dell'azienda per la fattura/)).toBeTruthy();
  });
});
