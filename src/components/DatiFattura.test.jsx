// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import DatiFattura from "./DatiFattura.jsx";

const azienda = { nome: "Azienda di esempio S.r.l.", piva: "12345678903", sdi: "ABC1234" };

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
    render(<DatiFattura azienda={azienda} onChiudi={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Dati per la fattura" })).toBeTruthy();
    expect(screen.getByText("Azienda di esempio S.r.l.")).toBeTruthy();
    expect(screen.getByText("12345678903")).toBeTruthy();
    expect(screen.getByText("ABC1234")).toBeTruthy();
  });

  it("«Copia» mette negli appunti solo quella voce", async () => {
    const writeText = conAppunti();
    render(<DatiFattura azienda={azienda} onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copia Partita IVA" })));
    expect(writeText).toHaveBeenCalledWith("12345678903");
    expect(screen.getByText("Copiato")).toBeTruthy();
  });

  it("«Invia tutti i dati» apre la condivisione con tutte le voci", async () => {
    navigator.share = vi.fn().mockResolvedValue();
    render(<DatiFattura azienda={azienda} onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Invia tutti i dati/ })));
    const { text } = navigator.share.mock.calls[0][0];
    expect(text).toContain("Partita IVA: 12345678903");
    expect(text).toContain("Codice SDI: ABC1234");
  });

  it("senza condivisione copia tutti i dati", async () => {
    const writeText = conAppunti();
    render(<DatiFattura azienda={azienda} onChiudi={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Invia tutti i dati/ })));
    expect(writeText.mock.calls[0][0]).toContain("Ragione sociale: Azienda di esempio S.r.l.");
    expect(screen.getByText("Dati copiati")).toBeTruthy();
  });

  it("mostra solo i dati presenti", () => {
    render(<DatiFattura azienda={{ email: "ufficio@example.com" }} onChiudi={() => {}} />);
    expect(screen.getByText("ufficio@example.com")).toBeTruthy();
    expect(screen.queryByText("Ragione sociale")).toBeNull();
  });

  it("si chiude con la X, con Esc e toccando fuori", () => {
    const onChiudi = vi.fn();
    const { container } = render(<DatiFattura azienda={azienda} onChiudi={onChiudi} />);
    fireEvent.click(screen.getByRole("button", { name: "Chiudi" }));
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(container.querySelector(".foglio-sfondo"));
    fireEvent.click(screen.getByText("12345678903"));
    expect(onChiudi).toHaveBeenCalledTimes(3);
  });
});
