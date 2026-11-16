import { BedDouble, Coffee, FileText, Moon, Receipt, Utensils } from "lucide-react";

/** Icona di ogni casella del giorno (le chiavi sono quelle di CASELLE in lib/giorno.js). */
export const ICONE_CASELLE = {
  scontrini: Receipt,
  fatture: FileText,
  colazioni: Coffee,
  bb: BedDouble,
  pranzo: Utensils,
  cena: Moon,
};
