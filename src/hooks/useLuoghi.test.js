// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

const memoria = vi.hoisted(() => ({ luoghi: [] }));
vi.mock("../lib/storage.js", () => ({
  caricaLuoghi: vi.fn(async () => memoria.luoghi),
  salvaLuoghi: vi.fn(async (elenco) => {
    memoria.luoghi = elenco;
  }),
}));

import { salvaLuoghi } from "../lib/storage.js";
import { useLuoghi } from "./useLuoghi.js";

beforeEach(() => {
  memoria.luoghi = [];
  vi.clearAllMocks();
});
afterEach(cleanup);

async function montaPronto() {
  const r = renderHook(() => useLuoghi());
  await waitFor(() => expect(r.result.current.pronto).toBe(true));
  return r;
}

describe("useLuoghi", () => {
  it("carica l'elenco salvato", async () => {
    memoria.luoghi = [{ nome: "Via Roma 12", ultimoUso: 1 }];
    const { result } = await montaPronto();
    expect(result.current.elenco).toEqual([{ nome: "Via Roma 12", ultimoUso: 1 }]);
  });

  it("usa aggiunge e salva", async () => {
    const { result } = await montaPronto();
    await act(() => result.current.usa("Via Roma 12"));
    expect(result.current.elenco.map((c) => c.nome)).toEqual(["Via Roma 12"]);
    expect(memoria.luoghi[0].nome).toBe("Via Roma 12");
  });

  it("rimuovi toglie e salva", async () => {
    memoria.luoghi = [{ nome: "Via Roma 12", ultimoUso: 1 }];
    const { result } = await montaPronto();
    await act(() => result.current.rimuovi("via roma 12"));
    expect(result.current.elenco).toEqual([]);
    expect(memoria.luoghi).toEqual([]);
  });

  it("errore se il salvataggio fallisce", async () => {
    salvaLuoghi.mockRejectedValueOnce(new Error("no"));
    const { result } = await montaPronto();
    await act(() => result.current.usa("X"));
    expect(result.current.errore).toBe(true);
  });
});
