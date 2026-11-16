// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import AggiornaModulo from "./AggiornaModulo.jsx";

afterEach(cleanup);

async function incolla(testo, esito) {
  const onAggiorna = vi.fn().mockResolvedValue(esito);
  render(<AggiornaModulo onAggiorna={onAggiorna} />);
  fireEvent.click(screen.getByRole("button", { name: /Incolla il link/ }));
  fireEvent.change(screen.getByLabelText("Link del modulo"), { target: { value: testo } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Usa questo modulo" })));
  return onAggiorna;
}

describe("AggiornaModulo", () => {
  it("link non valido: mostra il motivo e resta aperto", async () => {
    const onAggiorna = await incolla("ciao", { ok: false, errore: "Il link contiene caratteri non validi" });
    expect(onAggiorna).toHaveBeenCalledWith("ciao");
    expect(screen.getByRole("alert").textContent).toBe("Il link contiene caratteri non validi");
    expect(screen.getByLabelText("Link del modulo")).toBeTruthy();
  });

  it("link valido: si chiude e conferma", async () => {
    await incolla("https://x.example/app/#abc", { ok: true });
    expect(screen.queryByLabelText("Link del modulo")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Modulo aggiornato");
  });

  it("un errore con HTML resta testo", async () => {
    await incolla("x", { ok: false, errore: "<b>no</b>" });
    expect(screen.getByRole("alert").textContent).toBe("<b>no</b>");
    expect(screen.getByRole("alert").querySelector("b")).toBeNull();
  });
});
