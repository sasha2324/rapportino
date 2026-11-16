import { useEffect, useState } from "react";
import { Download, Ellipsis, EllipsisVertical, Menu, Share, SquarePlus } from "lucide-react";
import { guidaInstallazione, isInstallata } from "../lib/installazione.js";

/** Un'icona disegnata come il tasto che si vede sullo schermo del telefono. */
function Tasto({ icona: Icona, nome }) {
  return (
    <span className="tasto" role="img" aria-label={nome}>
      <Icona size={16} strokeWidth={2.2} aria-hidden="true" />
    </span>
  );
}

const DOVE_CONDIVIDI = {
  "ios-safari": (
    <>
      Se non lo vedi, tocca prima <Tasto icona={Menu} nome="Menu" /> o <Tasto icona={Ellipsis} nome="Altro" /> nella
      barra dell'indirizzo.
    </>
  ),
  "ios-chrome": (
    <>
      È in alto, accanto all'indirizzo. Se non lo vedi, apri prima il menu <Tasto icona={Ellipsis} nome="Menu" />.
    </>
  ),
  "ios-altro": (
    <>
      Se non lo vedi, apri prima il menu <Tasto icona={Ellipsis} nome="Menu" />.
    </>
  ),
};

function PassiIPhone({ guida }) {
  return (
    <ol className="passi">
      <li>
        <span>
          Tocca <Tasto icona={Share} nome="Condividi" /> <b>Condividi</b>.
          <span className="passi__nota">{DOVE_CONDIVIDI[guida]}</span>
        </span>
      </li>
      <li>
        <span>
          Tocca <Tasto icona={SquarePlus} nome="Aggiungi" /> <b>Aggiungi alla schermata Home</b>.
          <span className="passi__nota">Se non c'è, scorri in giù o tocca «Altro».</span>
        </span>
      </li>
      <li>
        <span>
          Tocca <b>Aggiungi</b>.
        </span>
      </li>
    </ol>
  );
}

function PassiAndroid() {
  return (
    <ol className="passi">
      <li>
        <span>
          Tocca il menu <Tasto icona={EllipsisVertical} nome="Menu" /> in alto a destra.
        </span>
      </li>
      <li>
        <span>
          Scegli <b>Installa app</b> oppure <b>Aggiungi a schermata Home</b>.
        </span>
      </li>
      <li>
        <span>
          Conferma con <b>Installa</b> (o <b>Aggiungi</b>).
        </span>
      </li>
    </ol>
  );
}

const RISERVA = (
  <div className="avviso__riserva">
    Non trovi la voce? Cerca <b>«Aggiungi alla schermata Home»</b> o <b>«Installa app»</b> nel menu del browser.
  </div>
);

/**
 * Invita a installare l'app con i passi giusti per il telefono e il browser in uso.
 * Su Android (Chrome, Samsung, Edge) basta il pulsante «Installa Rapportino».
 * «Più tardi» lo nasconde fino alla prossima apertura.
 */
export default function AvvisoInstalla() {
  const [nascosto, setNascosto] = useState(() => isInstallata());
  const [richiesta, setRichiesta] = useState(null);
  const [guida] = useState(() => guidaInstallazione());

  useEffect(() => {
    const suRichiesta = (e) => {
      e.preventDefault();
      setRichiesta(e);
    };
    const suInstallata = () => setNascosto(true);
    window.addEventListener("beforeinstallprompt", suRichiesta);
    window.addEventListener("appinstalled", suInstallata);
    return () => {
      window.removeEventListener("beforeinstallprompt", suRichiesta);
      window.removeEventListener("appinstalled", suInstallata);
    };
  }, []);

  if (nascosto) return null;

  const installa = async () => {
    richiesta.prompt();
    const { outcome } = await richiesta.userChoice;
    if (outcome === "accepted") setNascosto(true);
    setRichiesta(null);
  };

  let contenuto;
  if (richiesta) {
    contenuto = (
      <>
        <div>Un tocco e Rapportino è sulla schermata Home, come le altre app. Funziona anche senza rete.</div>
        <button type="button" className="pulsante-primario pulsante-installa" onClick={installa}>
          <Download size={20} aria-hidden="true" /> Installa Rapportino
        </button>
      </>
    );
  } else if (guida === "in-app") {
    contenuto = (
      <div>
        Da dentro questa app non si può installare. Tocca il menu <Tasto icona={Ellipsis} nome="Menu" /> o{" "}
        <Tasto icona={EllipsisVertical} nome="Menu" /> in alto e scegli di <b>aprire il link nel browser</b> (Safari o
        Chrome): lì troverai i passi per installarla.
      </div>
    );
  } else if (guida.startsWith("ios-")) {
    contenuto = (
      <>
        <div>Così si apre come un'app e i tuoi dati restano al sicuro.</div>
        <PassiIPhone guida={guida} />
        {RISERVA}
      </>
    );
  } else if (guida === "android") {
    contenuto = (
      <>
        <div>Così si apre come un'app e funziona anche senza rete.</div>
        <PassiAndroid />
        {RISERVA}
      </>
    );
  } else {
    contenuto = (
      <div>
        Apri il menu del browser e scegli <b>«Installa app»</b> o <b>«Aggiungi alla schermata Home»</b>.
      </div>
    );
  }

  return (
    <div className="avviso" role="note">
      <div className="avviso__titolo">Installa Rapportino sul telefono</div>
      {contenuto}
      <div className="avviso__azioni">
        <button type="button" className="pulsante-secondario" onClick={() => setNascosto(true)}>
          Più tardi
        </button>
      </div>
    </div>
  );
}
