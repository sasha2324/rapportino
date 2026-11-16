// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import Crea from "./Crea.jsx";
import { codifica, decodifica } from "../lib/link.js";
import { configDaModello } from "../lib/modelli.js";

afterEach(cleanup);

const ORIGINE = "https://rapportino.example";
const ADESSO = 1794816000; // secondi

function monta() {
  return render(<Crea origine={ORIGINE} adesso={() => ADESSO * 1000} />);
}

/** La configurazione dentro il link mostrato nella pagina. */
function configDelLink() {
  const link = screen.getByLabelText("Link per i dipendenti").value;
  expect(link.startsWith(`${ORIGINE}/app/#`)).toBe(true);
  const r = decodifica(link.split("#")[1]);
  expect(r.ok).toBe(true);
  return r.config;
}

describe("Crea il modulo", () => {
  it("parte dal modello Cantieri e dà subito un link valido, con il QR", () => {
    monta();
    const config = configDelLink();
    expect(config.voci.map((v) => v.nome)).toEqual(configDaModello("cantieri", 0).voci.map((v) => v.nome));
    expect(config.ts).toBe(ADESSO);
    expect(config).not.toHaveProperty("azienda");
    expect(screen.getByRole("img", { name: "QR code del link del modulo" })).toBeTruthy();
  });

  it("cambiando modello cambiano le voci", () => {
    monta();
    fireEvent.click(screen.getByRole("button", { name: /Generico/ }));
    expect(configDelLink().voci.map((v) => v.id)).toEqual(["ore", "sede", "note"]);
  });

  it("rinominare una voce cambia il nome ma non il codice", () => {
    monta();
    fireEvent.change(screen.getByLabelText("Nome della voce 3 (Luogo)"), { target: { value: "Cliente" } });
    const voce = configDelLink().voci[2];
    expect(voce).toEqual({ id: "cantiere", tipo: "luogo", nome: "Cliente" });
  });

  it("aggiungere una voce numero con l'unità", () => {
    monta();
    fireEvent.click(screen.getByRole("button", { name: /Numero/ }));
    const n = configDelLink().voci.length;
    fireEvent.change(screen.getByLabelText(`Nome della voce ${n} (Numero)`), { target: { value: "Km" } });
    fireEvent.change(screen.getByLabelText(`Unità della voce ${n}`), { target: { value: "km" } });
    expect(configDelLink().voci.at(-1)).toEqual({ id: "numero", tipo: "numero", nome: "Km", unita: "km" });
  });

  it("l'ultima voce ore non si può togliere", () => {
    monta();
    fireEvent.click(screen.getByRole("button", { name: /Generico/ }));
    expect(screen.getByRole("button", { name: "Togli: Ore lavorate" }).disabled).toBe(true);
  });

  it("i dati dell'azienda entrano nel link e nell'anteprima", () => {
    monta();
    fireEvent.change(screen.getByLabelText("Ragione sociale"), { target: { value: " Azienda di esempio S.r.l. " } });
    expect(configDelLink().azienda).toEqual({ nome: "Azienda di esempio S.r.l." });
    const telefono = screen.getByLabelText("Anteprima del modulo sul telefono del dipendente");
    expect(within(telefono).getByText("Azienda di esempio S.r.l.")).toBeTruthy();
  });

  it("partita IVA sbagliata: errore sul campo e niente link", () => {
    monta();
    fireEvent.change(screen.getByLabelText("Partita IVA"), { target: { value: "12345678904" } });
    expect(screen.getByText("la cifra di controllo non torna")).toBeTruthy();
    expect(screen.queryByLabelText("Link per i dipendenti")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Partita IVA");
  });

  it("nome di una voce vuoto: segnalato e niente link", () => {
    monta();
    fireEvent.change(screen.getByLabelText("Nome della voce 1 (Ore)"), { target: { value: "  " } });
    expect(screen.getByText("Scrivi un nome")).toBeTruthy();
    expect(screen.queryByLabelText("Link per i dipendenti")).toBeNull();
  });

  it("carica un modulo esistente: stesse voci e codici, data più recente", () => {
    const esistente = { ...configDaModello("impianti", ADESSO + 500), azienda: { nome: "Esempio", email: "a@example.com" } };
    monta();
    fireEvent.click(screen.getByRole("button", { name: /Hai già un modulo/ }));
    fireEvent.change(screen.getByLabelText("Link del modulo da modificare"), { target: { value: `${ORIGINE}/app/#${codifica(esistente)}` } });
    fireEvent.click(screen.getByRole("button", { name: "Carica il modulo" }));
    const config = configDelLink();
    expect(config.voci).toEqual(esistente.voci);
    expect(config.azienda).toEqual(esistente.azienda);
    expect(config.ts).toBe(ADESSO + 501);
    expect(screen.getByLabelText("Email").value).toBe("a@example.com");
  });

  it("carica un link non valido: messaggio, niente cambia", () => {
    monta();
    fireEvent.click(screen.getByRole("button", { name: /Hai già un modulo/ }));
    fireEvent.change(screen.getByLabelText("Link del modulo da modificare"), { target: { value: "https://x/app/#<b>" } });
    fireEvent.click(screen.getByRole("button", { name: "Carica il modulo" }));
    expect(screen.getByRole("alert").textContent).toBe("Il link contiene caratteri non validi");
    expect(configDelLink().voci[0].id).toBe("ore");
  });
});
