// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

const memoria = vi.hoisted(() => ({ impostazioni: { employeeName: "" } }));
vi.mock("../lib/storage.js", () => ({
  caricaImpostazioni: vi.fn(async () => memoria.impostazioni),
  salvaImpostazioni: vi.fn(async (i) => {
    memoria.impostazioni = i;
  }),
}));

import { salvaImpostazioni } from "../lib/storage.js";
import { useNomeDipendente } from "./useNomeDipendente.js";

beforeEach(() => {
  memoria.impostazioni = { employeeName: "" };
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("useNomeDipendente", () => {
  it("carica il nome salvato", async () => {
    memoria.impostazioni = { employeeName: "Mario Rossi" };
    const { result } = renderHook(() => useNomeDipendente());
    await waitFor(() => expect(result.current.nome).toBe("Mario Rossi"));
  });

  it("cambiaNome aggiorna e salva", async () => {
    const { result } = renderHook(() => useNomeDipendente());
    await act(() => result.current.cambiaNome("Luca"));
    expect(result.current.nome).toBe("Luca");
    expect(memoria.impostazioni).toEqual({ employeeName: "Luca" });
  });

  it("errore se il salvataggio fallisce", async () => {
    salvaImpostazioni.mockRejectedValueOnce(new Error("no"));
    const { result } = renderHook(() => useNomeDipendente());
    await act(() => result.current.cambiaNome("Luca"));
    expect(result.current.errore).toBe(true);
  });
});
