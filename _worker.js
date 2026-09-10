/* =========================================================
   Christian PADOVANO — Web Design · Salerno
   _worker.js — il pezzo di sito che gira sul server.

   Serve a una cosa sola: togliere la chiave EmailJS dal browser.
   Prima stava dentro preventivo.js, cioe' la leggeva chiunque aprisse il
   sorgente della pagina, e poteva usarla dal proprio sito per bruciare i
   200 messaggi al mese del piano gratuito. Il blocco per dominio di EmailJS
   e' a pagamento, quindi la chiave si sposta qui: questo file non e'
   scaricabile, e le chiavi non stanno nemmeno scritte dentro — arrivano
   dalle variabili d'ambiente di Cloudflare.

   Tutto il resto del sito (pagine, immagini, video) continua a essere
   servito come prima: se l'indirizzo non e' /api/preventivo, si passa la
   mano agli asset statici.
   ========================================================= */

const LIMITE_AL_MINUTO = 3;      // invii dallo stesso indirizzo IP
const SECONDI_MINIMI = 4;        // un modulo compilato in meno e' un robot

// memoria di breve durata: vive quanto l'istanza, non e' un archivio
const ultimiInvii = new Map();

function troppiInvii(ip) {
  const adesso = Date.now();
  const finestra = 60 * 1000;
  const precedenti = (ultimiInvii.get(ip) || []).filter(t => adesso - t < finestra);
  precedenti.push(adesso);
  ultimiInvii.set(ip, precedenti);
  if (ultimiInvii.size > 5000) ultimiInvii.clear();   // niente crescita infinita
  return precedenti.length > LIMITE_AL_MINUTO;
}

function risposta(dati, stato = 200) {
  return new Response(JSON.stringify(dati), {
    status: stato,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function pulisci(testo, massimo) {
  return String(testo == null ? '' : testo).slice(0, massimo).trim();
}

async function mandaPreventivo(request, env) {
  if (request.method !== 'POST') {
    return risposta({ errore: 'Metodo non ammesso' }, 405);
  }

  // la richiesta deve arrivare da questo sito, non da un altro
  const origine = request.headers.get('origin') || '';
  const suoDominio = new URL(request.url).origin;
  if (origine && origine !== suoDominio) {
    return risposta({ errore: 'Origine non ammessa' }, 403);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'sconosciuto';
  if (troppiInvii(ip)) {
    return risposta({ errore: 'Hai gia inviato piu richieste di fila. Riprova fra un minuto.' }, 429);
  }

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return risposta({ errore: 'Richiesta illeggibile' }, 400);
  }

  // campo trappola: e' nascosto nella pagina, un umano non lo compila mai
  if (pulisci(corpo.sitoWeb, 100)) {
    return risposta({ ok: true });   // al robot si risponde bene e non si manda niente
  }

  // tempo di compilazione: i robot riempiono e mandano in un lampo
  const impiegato = Number(corpo.tempo || 0);
  if (impiegato && impiegato < SECONDI_MINIMI * 1000) {
    return risposta({ ok: true });
  }

  const nome = pulisci(corpo.nome, 80);
  const contatto = pulisci(corpo.contatto, 120);
  const attivita = pulisci(corpo.attivita, 120);
  const messaggio = pulisci(corpo.messaggio, 4000);

  if (!nome || !contatto || !messaggio) {
    return risposta({ errore: 'Mancano nome, contatto o messaggio' }, 400);
  }

  if (!env.EMAILJS_PRIVATE_KEY || !env.EMAILJS_PUBLIC_KEY) {
    return risposta({ errore: 'Invio non configurato' }, 503);
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
    const dettaglio = await invio.text();
    console.error('EmailJS ha rifiutato:', invio.status, dettaglio);
    return risposta({ errore: 'Invio non riuscito' }, 502);
  }

  return risposta({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/preventivo') {
      return mandaPreventivo(request, env);
    }

    // tutto il resto e' il sito com'e' sempre stato
    return env.ASSETS.fetch(request);
  }
};
