export const MAX_SUGGERIMENTI = 5;

/** Due nomi sono lo stesso luogo se coincidono a meno di maiuscole e spazi ai lati. */
export function chiaveLuogo(nome) {
  return String(nome ?? "").trim().toLocaleLowerCase("it");
}

/** Il nome salvato (con la sua grafia) che corrisponde a quello scritto, oppure null. */
export function nomeConosciuto(elenco, nome) {
  const chiave = chiaveLuogo(nome);
  if (!chiave) return null;
  return elenco.find((c) => chiaveLuogo(c.nome) === chiave)?.nome ?? null;
}

/** Segna il luogo come usato adesso; se è nuovo lo aggiunge. */
export function usaLuogo(elenco, nome, adesso = Date.now()) {
  const pulito = String(nome ?? "").trim();
  if (!pulito) return elenco;
  const chiave = chiaveLuogo(pulito);
  const esistente = elenco.find((c) => chiaveLuogo(c.nome) === chiave);
  if (esistente) {
    return elenco.map((c) => (c === esistente ? { ...c, ultimoUso: adesso } : c));
  }
  return [...elenco, { nome: pulito, ultimoUso: adesso }];
}

export function rimuoviLuogo(elenco, nome) {
  const chiave = chiaveLuogo(nome);
  return elenco.filter((c) => chiaveLuogo(c.nome) !== chiave);
}

/**
 * Nomi da mostrare come pulsanti sotto il campo.
 * - testo vuoto: il luogo del giorno prima (se in elenco) per primo, poi gli altri dall'ultimo usato;
 * - testo scritto: i luoghi il cui nome contiene il testo, dall'ultimo usato.
 */
export function suggerimenti(elenco, { testo = "", luogoIeri = "", max = MAX_SUGGERIMENTI } = {}) {
  const perUso = [...elenco].sort((a, b) => b.ultimoUso - a.ultimoUso);
  const filtro = chiaveLuogo(testo);
  if (filtro) {
    return perUso
      .filter((c) => chiaveLuogo(c.nome).includes(filtro))
      .slice(0, max)
      .map((c) => c.nome);
  }
  const nomi = perUso.map((c) => c.nome);
  const ieri = nomeConosciuto(elenco, luogoIeri);
  const ordinati = ieri ? [ieri, ...nomi.filter((n) => n !== ieri)] : nomi;
  return ordinati.slice(0, max);
}
