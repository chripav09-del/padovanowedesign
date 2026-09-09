/* =========================================================
   Christian PADOVANO — Web Design · Salerno
   costruisci.js — la pagina di personalizzazione.

   Il telefono non e' un'immagine: e' un sito che si monta davvero.
   Cambia col mestiere (foto di fondo, parole, sezioni), col carattere
   (colori E font, non solo colori) e col nome che scrivi, che entra
   nel marchio, nell'indirizzo del browser e dentro i testi.

   Le foto: se in assets/mestieri/<mestiere>.webp c'e' una foto vera,
   viene usata quella; altrimenti resta il fondo disegnato, che non e'
   un rettangolo grigio ma una scena costruita coi gradienti.

   Alla fine tutto esce da due porte: il preventivo con le risposte
   gia' compilate nell'indirizzo, oppure WhatsApp col riepilogo scritto
   dentro il messaggio.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const TELEFONO = '393515894412';

  /* ---------- I mestieri ----------
     occhiello/titolo/sotto usano {nome}: al posto suo entra il nome scritto. */
  const MESTIERI = {
    ristorazione: {
      settore: 'Ristorazione', nome: 'Da Mario', dominio: 'damario',
      occhiello: 'RISTORANTE · SALERNO',
      titolo: 'Il gusto di casa,<br>ogni giorno',
      sotto: 'Cucina di famiglia a Salerno. Prenoti in due tocchi, anche dal telefono.',
      azione: 'Prenota un tavolo',
      listinoNome: 'Il menù',
      prenotaNome: 'Prenota il tavolo',
      listino: ['Antipasti|da 6 €', 'Primi|da 8 €', 'Secondi|da 10 €'],
      fiducia: [['1998', 'Dal'], ['4,9', 'Su Google'], ['2 min', 'Dal centro']],
      recensione: 'Si mangia come a casa, e si spende il giusto.',
      firma: 'Antonio R.',
      consigliati: ['listino', 'galleria', 'prenota', 'mappa'],
      scena: 'cibo'
    },
    bellezza: {
      settore: 'Bellezza e benessere', nome: 'Atelier', dominio: 'atelier',
      occhiello: 'PARRUCCHIERE · NOCERA INFERIORE',
      titolo: 'Il dettaglio<br>che si ricorda',
      sotto: 'Tagli, colore e acconciature sposa. Prova inclusa, su appuntamento.',
      azione: 'Prenota la prova',
      listinoNome: 'Il listino',
      prenotaNome: 'Prenota l\'appuntamento',
      listino: ['Taglio|da 18 €', 'Piega|da 15 €', 'Acconciatura sposa|su misura'],
      fiducia: [['2002', 'Dal'], ['5,0', 'Su Google'], ['A casa', 'Servizio sposa']],
      recensione: 'Mi ha fatto i capelli per il matrimonio, tenuta perfetta tutto il giorno.',
      firma: 'Maria C.',
      consigliati: ['listino', 'galleria', 'prenota', 'recensioni'],
      scena: 'capelli'
    },
    artigiano: {
      settore: 'Casa e artigiani', nome: 'Pronto Casa', dominio: 'prontocasa',
      occhiello: 'PRONTO INTERVENTO · 24/7',
      titolo: 'Arrivo oggi,<br>non fra due settimane',
      sotto: 'Impianti, riparazioni e manutenzione in tutta la provincia di Salerno.',
      azione: 'Chiama ora',
      listinoNome: 'Cosa faccio',
      prenotaNome: 'Chiedi l\'intervento',
      listino: ['Riparazioni|preventivo gratis', 'Installazioni|in giornata', 'Manutenzione|a contratto'],
      fiducia: [['24/7', 'Reperibile'], ['2h', 'Tempo medio'], ['12 anni', 'Di mestiere']],
      recensione: 'Chiamato la mattina, risolto entro sera. Prezzo detto prima.',
      firma: 'Giuseppe P.',
      consigliati: ['listino', 'mappa', 'recensioni', 'contatti'],
      scena: 'cantiere'
    },
    studio: {
      settore: 'Studio professionale', nome: 'Studio Marino', dominio: 'studiomarino',
      occhiello: 'COMMERCIALISTI · DAL 1998',
      titolo: 'Conti in ordine,<br>testa libera',
      sotto: 'Contabilità, dichiarazioni e consulenza per imprese e partite IVA.',
      azione: 'Prenota consulenza',
      listinoNome: 'I servizi',
      prenotaNome: 'Prenota la consulenza',
      listino: ['Contabilità|ordinaria e semplificata', 'Dichiarazioni|730 · Redditi · IVA', 'Consulenza|aperture e bilanci'],
      fiducia: [['1998', 'Dal'], ['320', 'Clienti seguiti'], ['48h', 'Risposta']],
      recensione: 'Rispondono sempre, e spiegano le cose in italiano.',
      firma: 'Studio Ferri',
      consigliati: ['listino', 'squadra', 'contatti', 'mappa'],
      scena: 'ufficio'
    },
    ricettivo: {
      settore: 'Ricettivo e turismo', nome: 'La Masseria', dominio: 'lamasseria',
      occhiello: 'B&B · COSTIERA',
      titolo: 'Dormi dove<br>il tempo si ferma',
      sotto: 'Cinque camere in pietra, colazione fatta in casa, mare a dieci minuti.',
      azione: 'Verifica disponibilità',
      listinoNome: 'Le camere',
      prenotaNome: 'Chiedi disponibilità',
      listino: ['Camera doppia|da 85 €', 'Suite con volta|da 120 €', 'Colazione|inclusa'],
      fiducia: [['5', 'Camere'], ['9,4', 'Booking'], ['10 min', 'Dal mare']],
      recensione: 'Posto bellissimo e accoglienza vera. Ci torniamo.',
      firma: 'Famiglia Rossi',
      consigliati: ['listino', 'galleria', 'prenota', 'recensioni'],
      scena: 'masseria'
    },
    negozio: {
      settore: 'Negozio o commercio', nome: 'Bottega', dominio: 'bottega',
      occhiello: 'NEGOZIO · CENTRO',
      titolo: 'Quello che cerchi,<br>ce l\'abbiamo',
      sotto: 'Novità ogni settimana, ordini su misura e ritiro in negozio.',
      azione: 'Vieni a trovarci',
      listinoNome: 'Il catalogo',
      prenotaNome: 'Metti da parte',
      listino: ['Novità|ogni settimana', 'Su ordinazione|in 3 giorni', 'Ritiro in negozio|gratis'],
      fiducia: [['1200', 'Articoli'], ['4,8', 'Su Google'], ['Gratis', 'Ritiro']],
      recensione: 'Mi hanno ordinato il pezzo che non trovavo da nessuna parte.',
      firma: 'Luca D.',
      consigliati: ['listino', 'galleria', 'offerte', 'mappa'],
      scena: 'negozio'
    }
  };

  /* ---------- I caratteri ----------
     Ogni carattere porta i suoi font, non solo i suoi colori: e' la differenza
     fra un sito che sembra un modello e uno che sembra tuo. */
  const STILI = {
    classico: {
      etichetta: 'Classico',
      fontTitoli: "'Fraunces', Georgia, serif",
      fontTesti: "'Inter', system-ui, sans-serif",
      pesoTitolo: 700, spaziatura: '-.01em', maiuscolo: 'none', raggio: '12px',
      tavolozze: {
        ristorazione: ['#12172B', 'linear-gradient(150deg,#7A2B1E,#2B1410)', '#F2A33C', 'linear-gradient(140deg,#C2703A,#6B3218)'],
        bellezza:     ['#1A1614', 'linear-gradient(150deg,#4A3B33,#211A16)', '#D9B382', 'linear-gradient(140deg,#D8C3AE,#7A6250)'],
        artigiano:    ['#141A22', 'linear-gradient(150deg,#2C4257,#131D28)', '#E8A33D', 'linear-gradient(140deg,#B9CBDA,#4E6675)'],
        studio:       ['#141A26', 'linear-gradient(150deg,#2A3A52,#131A26)', '#C9A96B', 'linear-gradient(140deg,#C3CEDC,#5C6C80)'],
        ricettivo:    ['#141A16', 'linear-gradient(150deg,#2F5741,#14231A)', '#C89B5A', 'linear-gradient(140deg,#9FC4A8,#47705A)'],
        negozio:      ['#1B1614', 'linear-gradient(150deg,#5A3A26,#241811)', '#E0A45C', 'linear-gradient(140deg,#D9B694,#8A6244)']
      }
    },
    elegante: {
      etichetta: 'Elegante',
      fontTitoli: "'Cormorant Garamond', Georgia, serif",
      fontTesti: "'Jost', 'Inter', sans-serif",
      pesoTitolo: 700, spaziatura: '.01em', maiuscolo: 'none', raggio: '4px',
      tavolozze: {
        ristorazione: ['#0F0E0C', 'linear-gradient(150deg,#2A2521,#100E0C)', '#D9C08A', 'linear-gradient(140deg,#CFC2A6,#6E6353)'],
        bellezza:     ['#141013', 'linear-gradient(150deg,#33232C,#150F13)', '#E3C7D2', 'linear-gradient(140deg,#E4CDD6,#7E6470)'],
        artigiano:    ['#101418', 'linear-gradient(150deg,#242E36,#0E1216)', '#BFD2DE', 'linear-gradient(140deg,#C6D4DE,#5A6A75)'],
        studio:       ['#0E1219', 'linear-gradient(150deg,#1D2836,#0C1017)', '#B9C7DC', 'linear-gradient(140deg,#C7D2E2,#5A6779)'],
        ricettivo:    ['#101310', 'linear-gradient(150deg,#26332A,#0E110F)', '#D6C7A4', 'linear-gradient(140deg,#CBD6C4,#5F6E5F)'],
        negozio:      ['#131017', 'linear-gradient(150deg,#2C2437,#120F16)', '#CDBEE4', 'linear-gradient(140deg,#CFC3E2,#6C6180)']
      }
    },
    deciso: {
      etichetta: 'Deciso',
      fontTitoli: "'Anton', 'Arial Black', sans-serif",
      fontTesti: "'Space Grotesk', 'Inter', sans-serif",
      pesoTitolo: 400, spaziatura: '.005em', maiuscolo: 'uppercase', raggio: '2px',
      tavolozze: {
        ristorazione: ['#0B0B0B', 'linear-gradient(150deg,#B4231A,#3A0B08)', '#FFD23F', 'linear-gradient(140deg,#F0A03C,#8A2A12)'],
        bellezza:     ['#0C0A10', 'linear-gradient(150deg,#7E1E5A,#2A0A1E)', '#FF6FB5', 'linear-gradient(140deg,#F09ACB,#7C2A57)'],
        artigiano:    ['#0A0F16', 'linear-gradient(150deg,#0F3F7A,#08131F)', '#FF7A29', 'linear-gradient(140deg,#7FB4EC,#20456E)'],
        studio:       ['#0A0F1A', 'linear-gradient(150deg,#123566,#080D16)', '#4EA3FF', 'linear-gradient(140deg,#8FC0F5,#28517E)'],
        ricettivo:    ['#0A100C', 'linear-gradient(150deg,#12653F,#071A11)', '#5CE39B', 'linear-gradient(140deg,#8FE3B6,#226E48)'],
        negozio:      ['#0D0916', 'linear-gradient(150deg,#5B21B6,#1B0D33)', '#C084FC', 'linear-gradient(140deg,#CDA8F0,#6A4494)']
      }
    },
    pulito: {
      etichetta: 'Pulito',
      fontTitoli: "'Manrope', system-ui, sans-serif",
      fontTesti: "'Manrope', system-ui, sans-serif",
      pesoTitolo: 800, spaziatura: '-.03em', maiuscolo: 'none', raggio: '16px',
      tavolozze: {
        ristorazione: ['#F5F3EF', 'linear-gradient(150deg,#E8E1D6,#D8CFC0)', '#B4451F', 'linear-gradient(140deg,#E5D3C2,#B79880)'],
        bellezza:     ['#F7F3F4', 'linear-gradient(150deg,#EFE3E7,#DFCED5)', '#9C5878', 'linear-gradient(140deg,#EBD8DF,#B893A3)'],
        artigiano:    ['#F2F5F8', 'linear-gradient(150deg,#DFE8F0,#C8D6E2)', '#1D5FA8', 'linear-gradient(140deg,#D6E3EF,#93AAC0)'],
        studio:       ['#F4F6F9', 'linear-gradient(150deg,#E2E8F1,#CBD6E4)', '#1F4E86', 'linear-gradient(140deg,#D8E1EC,#96A7BC)'],
        ricettivo:    ['#F3F6F2', 'linear-gradient(150deg,#E1EADF,#CBD9C8)', '#2F6B4A', 'linear-gradient(140deg,#D9E6D6,#94AC92)'],
        negozio:      ['#F5F3F8', 'linear-gradient(150deg,#E7E1F0,#D3CAE3)', '#5B3E9B', 'linear-gradient(140deg,#DED5EE,#A294C0)']
      }
    }
  };

  /* ---------- Le scene di fondo ----------
     Finche' non ci sono foto vere in assets/mestieri/, l'hero non e' un
     rettangolo piatto: sono strati di luce costruiti sul mestiere. */
  const SCENE = {
    cibo: 'radial-gradient(120% 70% at 22% 12%, rgba(255,196,120,.55), transparent 60%), radial-gradient(90% 60% at 85% 30%, rgba(255,120,60,.38), transparent 62%), radial-gradient(140% 90% at 50% 118%, rgba(0,0,0,.55), transparent 70%)',
    capelli: 'radial-gradient(110% 65% at 78% 8%, rgba(255,225,205,.45), transparent 58%), radial-gradient(80% 60% at 18% 42%, rgba(190,140,110,.42), transparent 62%), radial-gradient(140% 90% at 50% 120%, rgba(0,0,0,.5), transparent 70%)',
    cantiere: 'radial-gradient(100% 60% at 15% 10%, rgba(255,180,80,.42), transparent 55%), linear-gradient(115deg, rgba(255,255,255,.10) 0 12%, transparent 12% 24%, rgba(255,255,255,.08) 24% 34%, transparent 34%), radial-gradient(140% 90% at 50% 118%, rgba(0,0,0,.55), transparent 72%)',
    ufficio: 'linear-gradient(180deg, rgba(255,255,255,.14), transparent 45%), repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 2px, transparent 2px 26px), radial-gradient(120% 80% at 70% 5%, rgba(160,200,255,.35), transparent 60%), radial-gradient(140% 90% at 50% 120%, rgba(0,0,0,.5), transparent 70%)',
    masseria: 'radial-gradient(120% 70% at 25% 6%, rgba(255,214,150,.48), transparent 58%), radial-gradient(90% 70% at 90% 60%, rgba(110,180,140,.35), transparent 62%), radial-gradient(140% 90% at 50% 118%, rgba(0,0,0,.5), transparent 70%)',
    negozio: 'radial-gradient(100% 55% at 50% 4%, rgba(255,255,255,.28), transparent 55%), repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 22px), radial-gradient(120% 80% at 20% 70%, rgba(200,150,255,.3), transparent 62%), radial-gradient(140% 90% at 50% 120%, rgba(0,0,0,.5), transparent 72%)'
  };

  const NOMI_PEZZI = {
    listino: 'Menù o listino', galleria: 'Galleria foto', prenota: 'Prenotazioni',
    mappa: 'Mappa e orari', recensioni: 'Recensioni', squadra: 'Chi siamo',
    offerte: 'Offerte del mese', contatti: 'Modulo contatti'
  };

  /* ---------- Stato ---------- */
  let mestiere = 'ristorazione';
  let stile = 'classico';
  let scelti = new Set(['listino', 'galleria']);
  let nome = '';

  const vetro = $('#tfVetro');
  const sito = $('#tfSito');
  const cta = $('#costrCta');
  const wa = $('#costrWa');
  const conto = $('#costrConto');
  const riepilogo = $('#costrRiepilogo');
  const campoNome = $('#nomeAttivita');
  if (!vetro || !cta) return;

  const nomeVivo = () => nome.trim() || MESTIERI[mestiere].nome;

  /* Il dominio si costruisce dal nome, come farebbe davvero chi lo registra. */
  function dominio() {
    const scritto = nome.trim();
    if (!scritto) return MESTIERI[mestiere].dominio + '.it';
    const pulito = scritto.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 22);
    return (pulito || MESTIERI[mestiere].dominio) + '.it';
  }

  /* ---------- Vestire il telefono ---------- */
  function tavolozza() {
    const s = STILI[stile];
    return (s.tavolozze[mestiere] || s.tavolozze.ristorazione);
  }

  function vesti() {
    const m = MESTIERI[mestiere];
    const s = STILI[stile];
    const [fondo, hero, acc, foto] = tavolozza();

    sito.style.setProperty('--tf-fondo', fondo);
    sito.style.setProperty('--tf-hero', hero);
    sito.style.setProperty('--tf-acc', acc);
    sito.style.setProperty('--tf-foto', foto);
    sito.style.setProperty('--tf-titoli', s.fontTitoli);
    sito.style.setProperty('--tf-testi', s.fontTesti);
    sito.style.setProperty('--tf-peso', s.pesoTitolo);
    sito.style.setProperty('--tf-spaziatura', s.spaziatura);
    sito.style.setProperty('--tf-maiuscolo', s.maiuscolo);
    sito.style.setProperty('--tf-raggio', s.raggio);

    // sui fondi chiari il testo deve diventare scuro, altrimenti sparisce
    const chiaro = /^#[EF]/i.test(fondo);
    sito.classList.toggle('is-chiaro', chiaro);

    $('#tfFondo').style.backgroundImage = SCENE[m.scena] || SCENE.cibo;

    const n = nomeVivo();
    $('#tfMarchio').textContent = n;
    $('#tfPieMarchio').textContent = n;
    $('#tfDominio').textContent = dominio();
    $('#tfOcchiello').textContent = m.occhiello;
    $('#tfTitolo').innerHTML = m.titolo;
    $('#tfSotto').textContent = m.sotto;
    $('#tfBtn').textContent = m.azione;
    $('#tfListinoNome').textContent = m.listinoNome;
    $('#tfPrenotaNome').textContent = m.prenotaNome;
    $('#tfRecensione').textContent = m.recensione;
    $('.tf__firma').textContent = m.firma;

    m.fiducia.forEach((v, i) => {
      const num = $('#tfNum' + (i + 1));
      const eti = $('#tfEti' + (i + 1));
      if (num) num.textContent = v[0];
      if (eti) eti.textContent = v[1];
    });

    const bl = $('.tf__blocco[data-pezzo="listino"]');
    if (bl) {
      $$('.tf__riga', bl).forEach((r, i) => {
        const v = m.listino[i];
        if (!v) { r.style.display = 'none'; return; }
        r.style.display = '';
        const p = v.split('|');
        r.innerHTML = '<i>' + p[0] + '</i><b>' + p[1] + '</b>';
      });
    }

    fotoVera(m);
  }

  /* Se la foto vera del mestiere esiste, prende il posto della scena disegnata.
     Basta lasciarla in assets/mestieri/<mestiere>.webp: nessuna altra modifica. */
  /* Elenco delle foto vere gia' presenti in assets/mestieri/.
     Si scrive qui il mestiere quando la foto viene aggiunta: cosi' il sito
     non va a cercare file che non esistono (erano sei errori 404 a vuoto
     nella console a ogni visita). */
  const FOTO_PRONTE = [];

  const fotoTrovate = {};
  function fotoVera(m) {
    const chiave = mestiere;
    if (!FOTO_PRONTE.includes(chiave)) return;
    if (fotoTrovate[chiave] === false) return;
    if (fotoTrovate[chiave]) { applicaFoto(fotoTrovate[chiave]); return; }
    const via = 'assets/mestieri/' + chiave + '.webp';
    const img = new Image();
    img.onload = () => { fotoTrovate[chiave] = via; if (mestiere === chiave) applicaFoto(via); };
    img.onerror = () => { fotoTrovate[chiave] = false; };
    img.src = via;
  }
  function applicaFoto(via) {
    $('#tfFondo').style.backgroundImage = 'url("' + via + '")';
    $('#tfFondo').style.backgroundSize = 'cover';
    $('#tfFondo').style.backgroundPosition = 'center';
  }

  function mostraPezzi() {
    $$('.tf__blocco').forEach(b => b.classList.toggle('is-fuori', !scelti.has(b.dataset.pezzo)));
  }

  function aggiornaConto() {
    const n = scelti.size;
    conto.innerHTML = n
      ? '<b>' + n + '</b> ' + (n === 1 ? 'sezione' : 'sezioni') + ' oltre alla presentazione'
      : 'Una pagina sola, essenziale';
  }

  function tipoSito() {
    if (scelti.has('prenota')) return 'Sito con prenotazioni o ordini';
    if (scelti.size === 0) return 'Una pagina sola';
    return 'Sito completo multi-pagina';
  }

  function voci() {
    const m = MESTIERI[mestiere];
    return [
      ['Attività', nome.trim() || '—'],
      ['Mestiere', m.settore],
      ['Carattere', STILI[stile].etichetta],
      ['Tipo di sito', tipoSito()],
      ['Sezioni', scelti.size ? [...scelti].map(p => NOMI_PEZZI[p]).join(' · ') : 'nessuna, solo la presentazione']
    ];
  }

  function aggiornaRiepilogo() {
    riepilogo.innerHTML = voci().map(v =>
      '<div class="riep2"><dt>' + v[0] + '</dt><dd>' + v[1] + '</dd></div>'
    ).join('');
  }

  function aggiornaLink() {
    const q = new URLSearchParams({
      settore: MESTIERI[mestiere].settore,
      tipo: tipoSito(),
      pezzi: [...scelti].map(p => NOMI_PEZZI[p]).join(', '),
      carattere: STILI[stile].etichetta
    });
    if (nome.trim()) q.set('attivita', nome.trim());
    cta.href = 'preventivo.html?' + q.toString();

    // WhatsApp: il riepilogo va scritto dentro il messaggio, gia' pronto da mandare
    const righe = [
      'Ciao Christian, ho provato il costruttore sul tuo sito.',
      '',
      ...voci().map(v => '• ' + v[0] + ': ' + v[1]),
      '',
      'Mi diresti quanto viene?'
    ];
    wa.href = 'https://wa.me/' + TELEFONO + '?text=' + encodeURIComponent(righe.join('\n'));
  }

  function tutto() {
    vesti(); mostraPezzi(); aggiornaConto(); aggiornaRiepilogo(); aggiornaLink(); coloraStili();
  }

  /* ---------- Comandi ---------- */
  $$('#costrMestieri .costr__chip').forEach(c => c.addEventListener('click', () => {
    mestiere = c.dataset.mestiere;
    $$('#costrMestieri .costr__chip').forEach(o => {
      const on = o === c;
      o.classList.toggle('is-scelto', on);
      o.setAttribute('aria-pressed', String(on));
    });
    // il mestiere porta con se' le sezioni che di solito servono a quel mestiere
    scelti = new Set(MESTIERI[mestiere].consigliati);
    $$('#costrPezzi .costr__chip').forEach(p => {
      const on = scelti.has(p.dataset.pezzo);
      p.classList.toggle('is-scelto', on);
      p.setAttribute('aria-pressed', String(on));
    });
    segnalaCambio();
    tutto();
  }));

  $$('#costrStili .stile').forEach(c => c.addEventListener('click', () => {
    stile = c.dataset.stile;
    $$('#costrStili .stile').forEach(o => {
      const on = o === c;
      o.classList.toggle('is-scelto', on);
      o.setAttribute('aria-pressed', String(on));
    });
    segnalaCambio();
    tutto();
  }));

  $$('#costrPezzi .costr__chip').forEach(c => c.addEventListener('click', () => {
    const p = c.dataset.pezzo;
    if (scelti.has(p)) scelti.delete(p); else scelti.add(p);
    c.classList.toggle('is-scelto', scelti.has(p));
    c.setAttribute('aria-pressed', String(scelti.has(p)));
    tutto();
  }));

  campoNome.addEventListener('input', () => { nome = campoNome.value; tutto(); });

  /* Quando cambia mestiere o carattere la pagina finta "si ricarica":
     e' il dettaglio che fa sembrare vero il telefono. */
  function segnalaCambio() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    vetro.classList.remove('is-ricarica');
    void vetro.offsetWidth;
    vetro.classList.add('is-ricarica');
    if (sito) sito.scrollTop = 0;
  }

  /* ---------- I bottoncini del carattere mostrano i loro colori ---------- */
  function coloraStili() {
    $$('#costrStili .stile').forEach(b => {
      const tav = STILI[b.dataset.stile].tavolozze[mestiere];
      const punti = $$('i', b);
      if (punti[0]) punti[0].style.background = tav[0];
      if (punti[1]) punti[1].style.background = tav[2];
      if (punti[2]) punti[2].style.backgroundImage = tav[3];
      b.style.setProperty('--anteprima-font', STILI[b.dataset.stile].fontTitoli);
    });
  }

  /* ---------- L'ora del telefono e' l'ora vera ---------- */
  function ora() {
    const o = $('#tfOra');
    if (!o) return;
    const d = new Date();
    o.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  ora();
  setInterval(ora, 30000);

  tutto();
})();
