// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

const memoria = vi.hoisted(() => ({ cantieri: [] }));
vi.mock("../lib/storage.js", () => ({
  caricaCantieri: vi.fn(async () => memoria.cantieri),
  salvaCantieri: vi.fn(async (elenco) => {
    memoria.cantieri = elenco;
  }),
}));

import { salvaCantieri } from "../lib/storage.js";
import { useCantieri } from "./useCantieri.js";

beforeEach(() => {
  memoria.cantieri = [];
  vi.clearAllMocks();
});
afterEach(cleanup);

async function montaPronto() {
  const r = renderHook(() => useCantieri());
  await waitFor(() => expect(r.result.current.pronto).toBe(true));
  return r;
}

describe("useCantieri", () => {
  it("carica l'elenco salvato", async () => {
    memoria.cantieri = [{ nome: "Via Roma 12", ultimoUso: 1 }];
    const { result } = await montaPronto();
    expect(result.current.elenco).toEqual([{ nome: "Via Roma 12", ultimoUso: 1 }]);
  });

  it("usa aggiunge e salva", async () => {
    const { result } = await montaPronto();
    await act(() => result.current.usa("Via Roma 12"));
    expect(result.current.elenco.map((c) => c.nome)).toEqual(["Via Roma 12"]);
    expect(memoria.cantieri[0].nome).toBe("Via Roma 12");
  });

  it("rimuovi toglie e salva", async () => {
    memoria.cantieri = [{ nome: "Via Roma 12", ultimoUso: 1 }];
    const { result } = await montaPronto();
    await act(() => result.current.rimuovi("via roma 12"));
    expect(result.current.elenco).toEqual([]);
    expect(memoria.cantieri).toEqual([]);
  });

  it("errore se il salvataggio fallisce", async () => {
    salvaCantieri.mockRejectedValueOnce(new Error("no"));
    const { result } = await montaPronto();
    await act(() => result.current.usa("X"));
    expect(result.current.errore).toBe(true);
  });
});
