import { describe, it, expect } from "vitest";
import { matriceQR, percorsoQR } from "./qr.js";

describe("percorsoQR", () => {
  it("un rettangolo per ogni tratto nero di una riga", () => {
    const m = [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ];
    expect(percorsoQR(m)).toBe("M0 0h2v1h-2zM1 1h2v1h-2z");
  });

  it("niente nero, niente percorso", () => {
    expect(percorsoQR([[false]])).toBe("");
  });
});

describe("matriceQR", () => {
  it("una matrice quadrata con il bordo di 4 moduli richiesto dallo standard", () => {
    const m = matriceQR("https://rapportino.example/app/#abc");
    expect(m.length).toBeGreaterThan(21);
    expect(m.every((riga) => riga.length === m.length)).toBe(true);
    expect(m.slice(0, 4).flat().some(Boolean)).toBe(false);
    expect(m[4].slice(4, 11).every(Boolean)).toBe(true); // bordo dell'occhio in alto a sinistra
  });

  it("link lungo: correzione più bassa pur di farlo entrare", () => {
    const m = matriceQR(`https://rapportino.example/app/#${"A".repeat(2500)}`);
    expect(m).not.toBeNull();
  });

  it("link che non entra in nessun QR: null, senza errori", () => {
    expect(matriceQR(`https://rapportino.example/app/#${"A".repeat(3000)}`)).toBeNull();
  });
});
