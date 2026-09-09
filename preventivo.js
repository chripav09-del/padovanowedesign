/* =========================================================
   Christian PADOVANO — Web Design · Salerno
   preventivo.js — quattro passi, due uscite.
   Le chiavi EmailJS sono le stesse già in uso sul resto del sito.
   ========================================================= */
(() => {
  'use strict';

  const EMAILJS_KEY = 'Lt4q3_hmPmMtvR7Ls';
  const SERVICE_ID  = 'service_9ek1f8a';
  const TEMPLATE_ID = 'template_oqple5r';
  const WHATSAPP    = '393515894412';
  const RIDOTTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const form     = $('#prevForm');
  const stato    = $('#stato');
  const btnWa    = $('#btnWa');
  const btnMail  = $('#btnMail');
  const avanti   = $('#wizAvanti');
  const indietro = $('#wizIndietro');
  const invii    = $('#wizInvii');
  const nota     = $('#wizNota');
  const prog     = $('#wizProg');
  const scelte   = $('#wizScelte');
  const viste    = $$('.wiz__vista');
  const tappe    = $$('.wiz__tappe li');
  if (!form || !viste.length) return;

  const ULTIMO = viste.length;
  let passo = 1;

  /* ---------- Lettura del modulo ---------- */
  function letture() {
    const fd = new FormData(form);
    return {
      settore:   fd.get('settore')   || '',
      tipo:      fd.get('tipo')      || '',
      materiale: fd.getAll('materiale'),
      nome:     (fd.get('nome')     || '').trim(),
      attivita: (fd.get('attivita') || '').trim(),
      comune:   (fd.get('comune')   || '').trim(),
      contatto: (fd.get('contatto') || '').trim(),
      note:     (fd.get('note')     || '').trim(),
    };
  }

  /* ---------- Pastiglie di quello che è già stato scelto ---------- */
  function disegnaScelte() {
    const d = letture();
    const voci = [];
    if (d.settore) voci.push({ p: 1, t: d.settore });
    if (d.tipo) voci.push({ p: 2, t: d.tipo });
    d.materiale.forEach(m => voci.push({ p: 3, t: m }));

    scelte.innerHTML = '';
    voci.forEach(v => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wiz__chip';
      b.dataset.passo = v.p;
      b.textContent = v.t;
      b.title = 'Torna a questa domanda';
      scelte.appendChild(b);
    });
    scelte.classList.toggle('is-pieno', voci.length > 0);
  }
  scelte.addEventListener('click', e => {
    const chip = e.target.closest('.wiz__chip');
    if (chip) vaiA(parseInt(chip.dataset.passo, 10));
  });

  /* ---------- Cambio passo ---------- */
  function aggiornaBarra() {
    prog.style.width = ((passo - 1) / (ULTIMO - 1) * 100) + '%';
    tappe.forEach(t => {
      const n = parseInt(t.dataset.t, 10);
      t.classList.toggle('is-attiva', n === passo);
      t.classList.toggle('is-fatta', n < passo);
    });
  }

  function vaiA(n, verso) {
    if (n < 1 || n > ULTIMO || n === passo) return;
    const dir = verso || (n > passo ? 1 : -1);
    const vecchia = viste[passo - 1];
    const nuova = viste[n - 1];

    if (RIDOTTO) {
      vecchia.hidden = true;
      vecchia.classList.remove('is-attiva');
      nuova.hidden = false;
      nuova.classList.add('is-attiva');
    } else {
      vecchia.classList.add(dir > 0 ? 'esce-sx' : 'esce-dx');
      const chiudi = () => {
        vecchia.hidden = true;
        vecchia.classList.remove('is-attiva', 'esce-sx', 'esce-dx');
        nuova.hidden = false;
        nuova.classList.add(dir > 0 ? 'entra-dx' : 'entra-sx');
        // due frame: il browser deve vedere lo stato iniziale prima di animare
        requestAnimationFrame(() => requestAnimationFrame(() => {
          nuova.classList.add('is-attiva');
          nuova.classList.remove('entra-dx', 'entra-sx');
        }));
      };
      setTimeout(chiudi, 170);
    }

    passo = n;
    aggiornaBarra();
    stato.textContent = '';
    stato.className = 'form__status';

    const ultimo = passo === ULTIMO;
    indietro.hidden = passo === 1;
    avanti.hidden = ultimo;
    invii.hidden = !ultimo;
    nota.hidden = !ultimo;

    // il titolo del passo va portato a schermo, ma senza strappi
    const testa = document.querySelector('.wiz__barra');
    if (testa) {
      const y = testa.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > y + 40 || window.scrollY < y - 400) {
        window.scrollTo({ top: y, behavior: RIDOTTO ? 'auto' : 'smooth' });
      }
    }
    if (ultimo) setTimeout(() => { const n1 = $('#nome'); if (n1) n1.focus({ preventScroll: true }); }, 380);
  }

  /* ---------- Cosa manca, in italiano ---------- */
  function mancaNelPasso(n) {
    const d = letture();
    if (n === 1 && !d.settore) return 'Scegli che attività hai.';
    if (n === 2 && !d.tipo) return 'Scegli che tipo di sito ti serve.';
    if (n === 4) {
      const m = [];
      if (!d.nome) m.push('il tuo nome');
      if (!d.contatto) m.push('un telefono o una email');
      if (m.length) return 'Manca ancora: ' + m.join(' e ') + '.';
    }
    return null;
  }

  function segnala(msg) {
    stato.textContent = msg;
    stato.className = 'form__status form__status--error';
    const v = viste[passo - 1];
    v.classList.remove('trema');
    void v.offsetWidth;
    if (!RIDOTTO) v.classList.add('trema');
  }

  avanti.addEventListener('click', () => {
    const msg = mancaNelPasso(passo);
    if (msg) return segnala(msg);
    vaiA(passo + 1, 1);
  });
  indietro.addEventListener('click', () => vaiA(passo - 1, -1));

  /* ---------- Le scelte singole portano avanti da sole ---------- */
  form.addEventListener('change', e => {
    disegnaScelte();
    if (e.target.type === 'radio' && passo < ULTIMO) {
      setTimeout(() => { if (!mancaNelPasso(passo)) vaiA(passo + 1, 1); }, 260);
    }
  });
  form.addEventListener('input', disegnaScelte);

  // Invio da tastiera: avanza, non spedisce
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && passo < ULTIMO && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      avanti.click();
    }
  });

  /* ---------- Testo unico, per la mail e per WhatsApp ---------- */
  function riepilogoTesto(d) {
    const righe = [
      `Settore: ${d.settore || '—'}`,
      `Tipo di sito: ${d.tipo || '—'}`,
      `Materiale pronto: ${d.materiale.length ? d.materiale.join(', ') : 'niente ancora'}`,
      '',
      `Nome: ${d.nome || '—'}`,
      d.attivita ? `Attività: ${d.attivita}` : null,
      d.comune   ? `Comune: ${d.comune}`     : null,
      `Contatto: ${d.contatto || '—'}`,
    ].filter(r => r !== null);
    if (d.note) righe.push('', `Note: ${d.note}`);
    return righe.join('\n');
  }

  function mancantiTutti(d) {
    const m = [];
    if (!d.settore)  m.push('che attività hai');
    if (!d.tipo)     m.push('che sito ti serve');
    if (!d.nome)     m.push('il tuo nome');
    if (!d.contatto) m.push('un telefono o una email');
    return m;
  }

  function bloccaSeIncompleto(d) {
    const m = mancantiTutti(d);
    if (!m.length) return false;
    // riporta l'utente al primo passo che manca, invece di dirgli solo che manca qualcosa
    const primo = !d.settore ? 1 : !d.tipo ? 2 : 4;
    if (primo !== passo) vaiA(primo, -1);
    segnala('Manca ancora: ' + m.join(', ') + '.');
    return true;
  }

  /* ---------- Uscita 1: WhatsApp ---------- */
  btnWa.addEventListener('click', () => {
    const d = letture();
    if (bloccaSeIncompleto(d)) return;
    const testo = `Ciao Christian, ti scrivo dal sito per un preventivo.\n\n${riepilogoTesto(d)}`;
    // La chat si apre già scritta: premere invio resta un gesto di chi scrive.
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(testo)}`, '_blank', 'noopener');
    stato.textContent = 'Ti ho aperto WhatsApp con il riepilogo già scritto: premi invio lì.';
    stato.className = 'form__status form__status--success';
  });

  /* ---------- Uscita 2: email ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = letture();
    if (bloccaSeIncompleto(d)) return;

    if (typeof emailjs === 'undefined') {
      stato.innerHTML = 'Invio email non disponibile adesso. Usa il pulsante WhatsApp qui accanto, oppure scrivimi a <a href="mailto:padovanowebdesign@gmail.com">padovanowebdesign@gmail.com</a>.';
      stato.className = 'form__status form__status--error';
      return;
    }

    stato.textContent = 'Invio in corso...';
    stato.className = 'form__status';
    btnMail.disabled = true;

    emailjs.init(EMAILJS_KEY);
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      nome: d.nome,
      attivita: d.attivita || d.settore,
      contatto: d.contatto,
      messaggio: `RICHIESTA PREVENTIVO\n\n${riepilogoTesto(d)}`,
    })
      .then(() => {
        stato.textContent = 'Richiesta arrivata. Ti rispondo in giornata.';
        stato.className = 'form__status form__status--success';
        form.reset();
        disegnaScelte();
        vaiA(1, -1);
      })
      .catch(err => {
        stato.innerHTML = 'Non è partita. Prova con il pulsante WhatsApp qui accanto, oppure scrivimi a <a href="mailto:padovanowebdesign@gmail.com">padovanowebdesign@gmail.com</a>.';
        stato.className = 'form__status form__status--error';
        console.error('EmailJS:', err);
      })
      .finally(() => { btnMail.disabled = false; });
  });

  /* ---------- Arrivo da "Costruisci il tuo sito" ----------
     Chi ha già scelto mestiere e funzioni nella home non deve rifarlo qui:
     le scelte viaggiano nell'indirizzo e il modulo parte già compilato,
     posizionato sulla prima domanda ancora aperta. */
  (function daCostruttore() {
    const q = new URLSearchParams(location.search);
    const settore = q.get('settore');
    const tipo = q.get('tipo');
    const pezzi = q.get('pezzi');
    if (!settore && !tipo) return;

    let presi = 0;
    if (settore) {
      const r = form.querySelector('input[name="settore"][value="' + CSS.escape(settore) + '"]');
      if (r) { r.checked = true; presi++; }
    }
    if (tipo) {
      const r = form.querySelector('input[name="tipo"][value="' + CSS.escape(tipo) + '"]');
      if (r) { r.checked = true; presi++; }
    }
    if (!presi) return;

    // il nome dell'attività, se lo ha già scritto nel costruttore, non si richiede
    const att = q.get('attivita');
    if (att) {
      const campo = $('#attivita');
      if (campo && !campo.value) campo.value = att;
    }

    disegnaScelte();

    // le funzioni scelte nel costruttore non hanno un campo loro: finiscono
    // nelle note, dove servono davvero a chi legge la richiesta
    if (pezzi) {
      const note = $('#note');
      if (note && !note.value) note.value = 'Dal costruttore sul sito — mi servirebbe: ' + pezzi + '.';
    }

    // si salta alla prima domanda ancora da rispondere
    const salto = settore && tipo ? 3 : 2;
    for (let i = 1; i < salto; i++) {
      viste[i - 1].hidden = true;
      viste[i - 1].classList.remove('is-attiva');
    }
    viste[salto - 1].hidden = false;
    viste[salto - 1].classList.add('is-attiva');
    passo = salto;
    aggiornaBarra();
    indietro.hidden = false;

    const avviso = document.createElement('p');
    avviso.className = 'wiz__daCostruttore';
    avviso.textContent = 'Ho già segnato quello che hai scelto nella home. Mancano poche cose.';
    scelte.insertAdjacentElement('beforebegin', avviso);
  })();

  /* ---------- Avvio ---------- */
  aggiornaBarra();
  disegnaScelte();

  /* ---------- Testata che si scurisce allo scorrimento ---------- */
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('navbar--scrolled', true);
  }, { passive: true });
})();
