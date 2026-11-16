import { describe, it, expect } from "vitest";
import { partitaIvaValida, testoAzienda } from "./azienda.js";

describe("testoAzienda", () => {
  it("una riga per dato presente, sotto il titolo", () => {
    const righe = [
      { chiave: "nome", etichetta: "Ragione sociale", valore: "Azienda di esempio S.r.l." },
      { chiave: "piva", etichetta: "Partita IVA", valore: "12345678903" },
    ];
    expect(testoAzienda(righe)).toBe(
      "Dati per la fattura\nRagione sociale: Azienda di esempio S.r.l.\nPartita IVA: 12345678903"
    );
  });
});

describe("partitaIvaValida", () => {
  // 12345678903: numero inventato per le prove, con la cifra di controllo giusta
  it("accetta una partita IVA con la cifra di controllo giusta", () => {
    expect(partitaIvaValida("12345678903")).toBe(true);
    expect(partitaIvaValida("00000000000")).toBe(true);
  });
  it("riconosce una cifra sbagliata", () => expect(partitaIvaValida("12345678904")).toBe(false));
  it("riconosce due cifre scambiate", () => expect(partitaIvaValida("12354678903")).toBe(false));
  it("vuole 11 cifre", () => {
    expect(partitaIvaValida("1234567890")).toBe(false);
    expect(partitaIvaValida("1234567890A")).toBe(false);
  });
});
