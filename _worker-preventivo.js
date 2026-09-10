/* =========================================================
   Christian PADOVANO — Web Design · Salerno
   _worker-preventivo.js

   Questo file NON fa parte del sito: e' il codice da incollare dentro un
   Worker separato su Cloudflare (istruzioni in fondo). Il file comincia con
   l'underscore apposta: Cloudflare non lo pubblica insieme alle pagine.

   A cosa serve: togliere la chiave EmailJS dal browser. Prima stava dentro
   preventivo.js, cioe' la leggeva chiunque aprisse il sorgente della pagina,
   e poteva usarla dal proprio sito per bruciare i 200 messaggi al mese del
   piano gratuito. Il blocco per dominio di EmailJS e' a pagamento: la chiave
   si sposta qui, dove nessuno la vede.

   In piu' ferma i robot: campo trappola, tempo minimo di compilazione,
   e un tetto di invii per indirizzo IP.
   ========================================================= */

const SITO = 'https://padovanowebsite.chripav09.workers.dev';
const LIMITE_AL_MINUTO = 3;
const SECONDI_MINIMI = 4;

const ultimiInvii = new Map();

function troppiInvii(ip) {
  const adesso = Date.now();
  const precedenti = (ultimiInvii.get(ip) || []).filter(t => adesso - t < 60000);
  precedenti.push(adesso);
  ultimiInvii.set(ip, precedenti);
  if (ultimiInvii.size > 5000) ultimiInvii.clear();
  return precedenti.length > LIMITE_AL_MINUTO;
}

function intestazioni(origine) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': origine === SITO ? SITO : 'null',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}

function risposta(dati, stato, origine) {
  return new Response(JSON.stringify(dati), { status: stato, headers: intestazioni(origine) });
}

function pulisci(testo, massimo) {
  return String(testo == null ? '' : testo).slice(0, massimo).trim();
}

export default {
  async fetch(request, env) {
    const origine = request.headers.get('origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: intestazioni(origine) });
    }
    if (request.method !== 'POST') {
      return risposta({ errore: 'Metodo non ammesso' }, 405, origine);
    }
    if (origine !== SITO) {
      return risposta({ errore: 'Origine non ammessa' }, 403, origine);
    }

    const ip = request.headers.get('cf-connecting-ip') || 'sconosciuto';
    if (troppiInvii(ip)) {
      return risposta({ errore: 'Hai gia inviato piu richieste di fila. Riprova fra un minuto.' }, 429, origine);
    }

    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return risposta({ errore: 'Richiesta illeggibile' }, 400, origine);
    }

    // campo trappola: e' nascosto nella pagina, un umano non lo compila mai
    if (pulisci(corpo.sitoWeb, 100)) return risposta({ ok: true }, 200, origine);

    // i robot riempiono e mandano in un lampo
    const impiegato = Number(corpo.tempo || 0);
    if (impiegato && impiegato < SECONDI_MINIMI * 1000) return risposta({ ok: true }, 200, origine);

    const nome = pulisci(corpo.nome, 80);
    const contatto = pulisci(corpo.contatto, 120);
    const attivita = pulisci(corpo.attivita, 120);
    const messaggio = pulisci(corpo.messaggio, 4000);

    if (!nome || !contatto || !messaggio) {
      return risposta({ errore: 'Mancano nome, contatto o messaggio' }, 400, origine);
    }
    if (!env.EMAILJS_PRIVATE_KEY || !env.EMAILJS_PUBLIC_KEY) {
      return risposta({ errore: 'Invio non configurato' }, 503, origine);
    }

    const invio = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        service_id: env.EMAILJS_SERVICE_ID || 'service_9ek1f8a',
        template_id: env.EMAILJS_TEMPLATE_ID || 'template_oqple5r',
        user_id: env.EMAILJS_PUBLIC_KEY,
        accessToken: env.EMAILJS_PRIVATE_KEY,
        template_params: { nome, attivita, contatto, messaggio }
      })
    });

    if (!invio.ok) {
      console.error('EmailJS ha rifiutato:', invio.status, await invio.text());
      return risposta({ errore: 'Invio non riuscito' }, 502, origine);
    }

    return risposta({ ok: true }, 200, origine);
  }
};

/* =========================================================
   COME SI METTE IN PIEDI (5 minuti, tutto dal pannello Cloudflare)

   1. Cloudflare Dashboard -> Workers & Pages -> Create -> Worker
      Nome: modulo-preventivo   (l'indirizzo diventa
      https://modulo-preventivo.chripav09.workers.dev)

   2. Deploy, poi "Edit code": cancella l'esempio e incolla tutto questo file
      (dalla prima riga fino a sopra questo commento). Salva e distribuisci.

   3. Settings -> Variables and Secrets -> Add:
      EMAILJS_PUBLIC_KEY   = Lt4q3_hmPmMtvR7Ls      (tipo: Text)
      EMAILJS_PRIVATE_KEY  = la chiave privata      (tipo: Secret)
      La chiave privata sta su EmailJS: Account -> General -> Private Key.
      Se non c'e', si genera li'.

   4. Dimmi che e' fatto: cambio preventivo.js perche' mandi qui invece che
      direttamente a EmailJS, e tolgo le chiavi dal sorgente della pagina.
      Serve anche una riga in piu' nel Content-Security-Policy del sito
      (connect-src), che aggiungo io.
   ========================================================= */
