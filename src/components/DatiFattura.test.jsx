// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import DatiFattura from "./DatiFattura.jsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete navigator.share;
});

function conAppunti() {
  const writeText = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

describe("DatiFattura", () => {
  it("mostra ragione sociale, partita IVA e codice SDI", () => {
    render(<DatiFattura onChiudi={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Dati per la fattura" })).toBeTruthy();
    expect(screen.getByText("Azienda di esempio S.r.l.")).toBeTruthy();
    expect(screen.getByText("00000000000")).toBeTruthy();
    expect(screen.getByText("0000000")).toBeTruthy();
  });

  it("«Copia» mette negli appunti solo quella voce", async () => {
    const writeText = conAppunti();
    render(<DatiFattura onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copia Partita IVA" })));
    expect(writeText).toHaveBeenCalledWith("00000000000");
    expect(screen.getByText("Copiato")).toBeTruthy();
  });

  it("«Invia tutti i dati» apre la condivisione con tutte le voci", async () => {
    navigator.share = vi.fn().mockResolvedValue();
    render(<DatiFattura onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Invia tutti i dati/ })));
    const { text } = navigator.share.mock.calls[0][0];
    expect(text).toContain("Partita IVA: 00000000000");
    expect(text).toContain("Codice SDI: 0000000");
  });

  it("senza condivisione copia tutti i dati", async () => {
    const writeText = conAppunti();
    render(<DatiFattura onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Invia tutti i dati/ })));
    expect(writeText.mock.calls[0][0]).toContain("Ragione sociale: Azienda di esempio S.r.l.");
    expect(screen.getByText("Dati copiati")).toBeTruthy();
  });

  it("si chiude con la X, con Esc e toccando fuori", () => {
    const onChiudi = vi.fn();
    const { container } = render(<DatiFattura onChiudi={onChiudi} />);
    fireEvent.click(screen.getByRole("button", { name: "Chiudi" }));
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(container.querySelector(".foglio-sfondo"));
    fireEvent.click(screen.getByText("00000000000"));
    expect(onChiudi).toHaveBeenCalledTimes(3);
  });
});
