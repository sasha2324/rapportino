// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

const memoria = vi.hoisted(() => new Map());
vi.mock("../lib/storage.js", () => ({
  caricaMese: vi.fn(async (anno, mese) => memoria.get(`${anno}-${mese}`) ?? {}),
  salvaMese: vi.fn(async (anno, mese, entries) => {
    memoria.set(`${anno}-${mese}`, entries);
  }),
}));

import { salvaMese } from "../lib/storage.js";
import { useMese } from "./useMese.js";

function monta(anno = 2026, mese = 10) {
  return renderHook((p) => useMese(p.anno, p.mese), { initialProps: { anno, mese } });
}

const pronto = (result) => waitFor(() => expect(result.current.caricamento).toBe(false));

beforeEach(() => {
  memoria.clear();
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("useMese", () => {
  it("carica i dati del mese", async () => {
    memoria.set("2026-10", { 1: { oreLav: "8" } });
    const { result } = monta();
    expect(result.current.caricamento).toBe(true);
    await pronto(result);
    expect(result.current.entries).toEqual({ 1: { oreLav: "8" } });
  });

  it("aggiorna subito e salva poco dopo", async () => {
    const { result } = monta();
    await pronto(result);
    act(() => result.current.aggiornaGiorno(2, "oreLav", "8"));
    expect(result.current.entries[2].oreLav).toBe("8");
    expect(result.current.entries[2].cantiere).toBe("");
    expect(result.current.statoSalvataggio).toBe("salvataggio");
    await waitFor(() => expect(result.current.statoSalvataggio).toBe("salvato"));
    expect(memoria.get("2026-10")[2].oreLav).toBe("8");
  });

  it("cambiando mese salva subito la modifica in attesa", async () => {
    const { result, rerender } = monta();
    await pronto(result);
    act(() => result.current.aggiornaGiorno(2, "oreLav", "8"));
    rerender({ anno: 2026, mese: 11 });
    await pronto(result);
    expect(salvaMese).toHaveBeenCalledWith(2026, 10, expect.objectContaining({ 2: expect.objectContaining({ oreLav: "8" }) }));
    expect(memoria.get("2026-10")[2].oreLav).toBe("8");
    expect(result.current.entries).toEqual({});
  });

  it("durante il caricamento non mostra i dati del mese prima", async () => {
    memoria.set("2026-10", { 1: { oreLav: "8" } });
    const { result, rerender } = monta();
    await pronto(result);
    rerender({ anno: 2026, mese: 11 });
    expect(result.current.caricamento).toBe(true);
    expect(result.current.entries).toEqual({});
    await pronto(result);
  });

  it("mostra «errore» se il salvataggio fallisce", async () => {
    salvaMese.mockRejectedValueOnce(new Error("memoria piena"));
    const { result } = monta();
    await pronto(result);
    act(() => result.current.aggiornaGiorno(2, "note", "x"));
    await waitFor(() => expect(result.current.statoSalvataggio).toBe("errore"));
  });
});
