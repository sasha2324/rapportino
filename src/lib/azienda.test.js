import { describe, it, expect } from "vitest";
import { AZIENDA, partitaIvaValida, testoAzienda } from "./azienda.js";

const valore = (chiave) => AZIENDA.find((r) => r.chiave === chiave).valore;

describe("dati dell'azienda", () => {
  it("la partita IVA di esempio ha la cifra di controllo giusta", () => expect(partitaIvaValida(valore("partitaIva"))).toBe(true));
  it("il codice SDI ha 7 caratteri", () => expect(valore("sdi")).toMatch(/^[A-Z0-9]{7}$/));
  it("il testo da condividere ha una riga per voce", () => {
    const righe = testoAzienda().split("\n");
    expect(righe[0]).toBe("Dati per la fattura");
    expect(righe).toContain("Partita IVA: 00000000000");
    expect(righe).toContain("Codice SDI: 0000000");
    expect(righe).toHaveLength(AZIENDA.length + 1);
  });
});

describe("partitaIvaValida", () => {
  // 12345678903: numero inventato per le prove, con la cifra di controllo giusta
  it("accetta una partita IVA con la cifra di controllo giusta", () => expect(partitaIvaValida("12345678903")).toBe(true));
  it("riconosce una cifra sbagliata", () => expect(partitaIvaValida("12345678904")).toBe(false));
  it("riconosce due cifre scambiate", () => expect(partitaIvaValida("12354678903")).toBe(false));
  it("vuole 11 cifre", () => {
    expect(partitaIvaValida("1234567890")).toBe(false);
    expect(partitaIvaValida("1234567890A")).toBe(false);
  });
});
