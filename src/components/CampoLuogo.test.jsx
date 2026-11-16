// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CampoLuogo from "./CampoLuogo.jsx";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function monta(valore = "Via Roma 12") {
  const luoghi = { elenco: [], usa: vi.fn(), rimuovi: vi.fn() };
  const onCambia = vi.fn();
  render(
    <>
      <CampoLuogo etichetta="Cantiere" valore={valore} luogoIeri="" onCambia={onCambia} luoghi={luoghi} />
      <button type="button">Pranzo</button>
    </>
  );
  return { luoghi, onCambia, campo: screen.getByLabelText("Cantiere"), pulsante: screen.getByRole("button", { name: "Pranzo" }) };
}

describe("CampoLuogo", () => {
  it("uscendo dal campo con Invio o toccando lo sfondo, il luogo si salva subito", () => {
    const { luoghi, campo } = monta();
    fireEvent.blur(campo, { relatedTarget: null });
    expect(luoghi.usa).toHaveBeenCalledWith("Via Roma 12");
  });

  it("premendo un pulsante, il luogo si salva solo dopo il rilascio (i suggerimenti non spostano il pulsante sotto il dito)", () => {
    vi.useFakeTimers();
    const { luoghi, campo, pulsante } = monta();
    fireEvent.blur(campo, { relatedTarget: pulsante });
    vi.advanceTimersByTime(100);
    expect(luoghi.usa).not.toHaveBeenCalled();
    fireEvent.pointerUp(document);
    vi.advanceTimersByTime(0);
    expect(luoghi.usa).toHaveBeenCalledWith("Via Roma 12");
  });

  it("se il rilascio non arriva (es. tastiera), si salva comunque poco dopo", () => {
    vi.useFakeTimers();
    const { luoghi, campo, pulsante } = monta();
    fireEvent.blur(campo, { relatedTarget: pulsante });
    vi.advanceTimersByTime(1000);
    expect(luoghi.usa).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(document);
    vi.advanceTimersByTime(10);
    expect(luoghi.usa).toHaveBeenCalledTimes(1);
  });
});
