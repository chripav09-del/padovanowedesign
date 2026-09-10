/* =========================================================
   Christian PADOVANO — Web Design · Salerno
   script.js — restyling 2026
   Il modulo preventivo, con EmailJS, sta in preventivo.js.
   ========================================================= */

/* ---------- Rispetto di prefers-reduced-motion ---------- */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- AOS Init ----------
   Nota: aos.css mette a opacity:0 tutto ciò che ha [data-aos^="fade"].
   Se AOS non parte (motion ridotto, CDN irraggiungibile) il contenuto
   resterebbe invisibile: in quel caso togliamo gli attributi. */
function disableAos() {
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
  });
}

if (typeof AOS === 'undefined' || REDUCED_MOTION) {
  disableAos();
} else {
  AOS.init({
    duration: 650,
    once: true,
    offset: 90,
    easing: 'ease-out-cubic',
  });
}

/* ---------- Navbar scroll effect ---------- */
const navbar = document.getElementById('navbar');
const waFab = document.getElementById('waFab');

function onScroll() {
  const y = window.scrollY;
  if (navbar) navbar.classList.toggle('navbar--scrolled', y > 40);
  // Il FAB WhatsApp è la CTA sempre raggiungibile: compare appena si lascia l'hero
  if (waFab) waFab.classList.toggle('is-visible', y > window.innerHeight * 0.45);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Hamburger menu ---------- */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Le pagine interne (portfolio, preventivo, privacy) non hanno il menu a panino:
// senza questo controllo lo script si fermerebbe qui e il resto non partirebbe.
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  });

  // il logo riporta alla home, e chiude il menu se era aperto
  const logoNav = document.querySelector('.navbar__logo');
  if (logoNav) {
    logoNav.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Apri menu');
    });
  }

  navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Apri menu');
    });
  });
}

/* ---------- Tilt 3D + glow che segue il puntatore ---------- */
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (hasFinePointer && !REDUCED_MOTION) {
  // Card portfolio: tilt 3D leggero
  document.querySelectorAll('.card--portfolio').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 3.5;
      const rotateX = ((rect.height / 2 - (e.clientY - rect.top)) / (rect.height / 2)) * 3.5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // Card servizi: spotlight radiale che segue il puntatore
  document.querySelectorAll('.card--feature').forEach(cell => {
    cell.addEventListener('mousemove', e => {
      const rect = cell.getBoundingClientRect();
      cell.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      cell.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      cell.style.transform = 'translateY(-4px)';
    });
    cell.addEventListener('mouseleave', () => {
      cell.style.transform = 'translateY(0)';
    });
  });
}

/* ---------- Caroselli a scorrimento infinito (solo telefono) ----------
   Sotto i 720px le griglie marcate [data-carousel] diventano caroselli
   orizzontali che girano all'infinito: arrivato in fondo si riparte dal
   primo senza stacchi, e lo stesso all'indietro.

   Come funziona: si clona l'intero set di card prima e dopo gli originali.
   Quando lo scorrimento entra in una delle copie, si riposiziona di colpo
   sul punto equivalente del set centrale. Il salto è invisibile perché
   il contenuto sotto è identico.

   Su computer non viene applicato nulla: la griglia resta com'è. */
(function initInfiniteCarousels() {
  const mqMobile = window.matchMedia('(max-width: 720px)');
  const tracks = Array.from(document.querySelectorAll('[data-carousel]'));
  if (!tracks.length) return;

  tracks.forEach(track => {
    const originals = Array.from(track.children);
    if (originals.length < 2) return;

    // data-carousel="always" → carosello a ogni larghezza (il portfolio).
    // Senza valore → solo su telefono, su computer resta griglia.
    const always = track.dataset.carousel === 'always';
    const mq = always ? { matches: true, addEventListener() {} } : mqMobile;

    let clones = [];
    let setWidth = 0;
    let active = false;
    let adjusting = false;
    let hint = null;

    function makeClone(node) {
      const c = node.cloneNode(true);
      c.classList.add('is-clone');
      c.setAttribute('aria-hidden', 'true');
      // le copie non devono essere raggiungibili da tastiera
      c.querySelectorAll('a, button, input, textarea, select').forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
      clones.push(c);
      return c;
    }

    function enable() {
      if (active) return;
      active = true;
      track.classList.add('is-carousel');

      // un set di copie prima e uno dopo
      const before = document.createDocumentFragment();
      originals.forEach(el => before.appendChild(makeClone(el)));
      track.insertBefore(before, originals[0]);

      const after = document.createDocumentFragment();
      originals.forEach(el => after.appendChild(makeClone(el)));
      track.appendChild(after);

      // indicazione "scorri", una per carosello
      hint = document.createElement('p');
      hint.className = 'carousel-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = `Scorri<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
      track.insertAdjacentElement('afterend', hint);

      measure();
      track.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', measure);

      /* Le schermate dei siti sono immagini lunghe e pigre: arrivano dopo.
         Finche' non sono arrivate il nastro e' piu' corto del vero, e la
         misura del salto resta sbagliata: si scorreva e a un certo punto
         il carosello si piantava invece di ripartire. Quindi si rimisura
         ogni volta che un'immagine finisce di caricare, e a pagina pronta. */
      track.querySelectorAll('img').forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', measure, { once: true });
        img.addEventListener('error', measure, { once: true });
      });
      window.addEventListener('load', measure);
      if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function () { measure(); }).observe(track);
      }
    }

    let primaMisura = true;
    function measure() {
      if (!active) return;
      const nuova = track.scrollWidth / 3;
      if (!nuova) return;
      // nessun salto se la misura non e' cambiata: altrimenti l'osservatore
      // di dimensione e la misura si rincorrono a vuoto
      if (!primaMisura && Math.abs(nuova - setWidth) < 2) return;
      // se la misura cambia mentre si guarda (immagini che arrivano), si
      // tiene il punto in cui si e' rimasti invece di sbalzare all'inizio
      if (!primaMisura && setWidth) {
        const quota = (track.scrollLeft - setWidth) / setWidth;
        setWidth = nuova;
        jumpTo(nuova + quota * nuova);
        return;
      }
      setWidth = nuova;
      primaMisura = false;
      // si parte dal set centrale, quello "vero"
      jumpTo(setWidth);
    }

    let releaseTimer = null;

    function jumpTo(x) {
      adjusting = true;
      // snap disattivato durante il salto, altrimenti il browser lo contrasta
      track.style.scrollSnapType = 'none';
      track.scrollLeft = x;
      // NB: qui serve setTimeout, non requestAnimationFrame.
      // rAF non scatta quando la scheda è in secondo piano: il flag
      // resterebbe alzato e il carosello smetterebbe di girare.
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        track.style.scrollSnapType = '';
        adjusting = false;
      }, 0);
    }

    function onScroll() {
      if (adjusting) return;
      // se la misura non c'è ancora (immagini che arrivano dopo), riprovo
      if (!setWidth) { setWidth = track.scrollWidth / 3; if (!setWidth) return; }
      const x = track.scrollLeft;
      if (x < setWidth * 0.5) jumpTo(x + setWidth);
      else if (x > setWidth * 1.5) jumpTo(x - setWidth);
    }

    function disable() {
      if (!active) return;
      active = false;
      track.classList.remove('is-carousel');
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      clones.forEach(c => c.remove());
      clones = [];
      if (hint) { hint.remove(); hint = null; }
      track.style.scrollSnapType = '';
      track.scrollLeft = 0;
    }

    function apply() { mq.matches ? enable() : disable(); }
    apply();
    mq.addEventListener('change', apply);
  });
})();

/* ---------- Three.js — scena dell'hero ----------
   Pensata prima per il telefono, dove non c'è il puntatore: tutto si muove da
   solo, e in più risponde a tre cose che sul telefono ci sono davvero —
   l'inclinazione del dispositivo, il dito che tocca lo schermo, e lo scorrimento
   della pagina. Sul computer il mouse si aggiunge a queste, non le sostituisce.

   Tre pezzi:
   1. il pianeta — una sfera di punti che ruota, con un anello inclinato attorno;
   2. il tessuto — una griglia che ondeggia sotto, come un layout che respira;
   3. i pannelli di vetro: tolti, distraevano dal titolo.
   Tutto si ferma quando l'hero esce dallo schermo o la scheda va in secondo piano. */
(function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = document.getElementById('hero');
  const stretto = window.matchMedia('(max-width: 900px)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, stretto ? 2 : 2);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);
  camera.position.set(0, 0, 46);

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(DPR);

  const BLU = new THREE.Color(0x3B82F6);
  const BLU2 = new THREE.Color(0x93C5FD);

  // Il pianeta sta al centro sul telefono, spostato a destra sul computer,
  // dove a sinistra c'è il testo.
  const gruppo = new THREE.Group();
  gruppo.position.set(stretto ? 0.5 : 18.5, stretto ? -1.5 : 1, 0);
  scene.add(gruppo);

  /* ---------- 1. Il pianeta ---------- */
  const RAGGIO = stretto ? 9.2 : 10.5;
  const NP = stretto ? 2600 : 4200;
  const pp = new Float32Array(NP * 3);
  const pr = new Float32Array(NP);
  for (let i = 0; i < NP; i++) {
    // distribuzione uniforme sulla sfera (spirale di Fibonacci): niente grumi ai poli
    const y = 1 - (i / (NP - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.399963229728653;
    pp[i * 3] = Math.cos(th) * r * RAGGIO;
    pp[i * 3 + 1] = y * RAGGIO;
    pp[i * 3 + 2] = Math.sin(th) * r * RAGGIO;
    pr[i] = Math.random();
  }
  const geoPianeta = new THREE.BufferGeometry();
  geoPianeta.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  geoPianeta.setAttribute('aRand', new THREE.BufferAttribute(pr, 1));

  const matPianeta = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uDpr: { value: DPR },
      uA: { value: BLU }, uB: { value: BLU2 }
    },
    vertexShader: [
      'attribute float aRand;',
      'uniform float uTime;',
      'uniform float uDpr;',
      'varying float vF;',
      'varying float vR;',
      'void main() {',
      // respiro leggero: la sfera pulsa invece di stare ferma
      '  float resp = 1.0 + sin(uTime * 0.6 + aRand * 6.28) * 0.012;',
      '  vec3 p = position * resp;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  float dist = -mv.z;',
      '  gl_PointSize = (1.6 + aRand * 2.4) * (40.0 / dist) * uDpr;',
      // i punti sul davanti brillano, quelli dietro sfumano: da' volume
      '  float fronte = smoothstep(-12.0, 12.0, p.z);',
      '  vF = (0.16 + fronte * 0.84) * (0.45 + aRand * 0.55);',
      '  vR = aRand;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uA;',
      'uniform vec3 uB;',
      'varying float vF;',
      'varying float vR;',
      'void main() {',
      '  vec2 c = gl_PointCoord - 0.5;',
      '  float r = dot(c, c);',
      '  if (r > 0.25) discard;',
      '  gl_FragColor = vec4(mix(uA, uB, vR), smoothstep(0.25, 0.0, r) * vF);',
      '}'
    ].join('\n')
  });
  const pianeta = new THREE.Points(geoPianeta, matPianeta);
  gruppo.add(pianeta);

  // alone attorno al pianeta: un piano che guarda sempre la camera
  const alone = new THREE.Mesh(
    new THREE.PlaneGeometry(RAGGIO * 3.4, RAGGIO * 3.4),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCol: { value: BLU } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: [
        'uniform float uTime; uniform vec3 uCol; varying vec2 vUv;',
        'void main() {',
        '  float d = length(vUv - 0.5) * 2.0;',
        '  float a = smoothstep(1.0, 0.30, d) * 0.16;',
        '  a *= 0.85 + sin(uTime * 0.8) * 0.15;',
        '  gl_FragColor = vec4(uCol, a);',
        '}'
      ].join('\n')
    })
  );
  alone.position.z = -RAGGIO * 0.6;
  gruppo.add(alone);

  // anello inclinato: il dettaglio che fa "pianeta" e non "palla di puntini"
  const NA = stretto ? 2200 : 3600;
  const ap = new Float32Array(NA * 3);
  const ar = new Float32Array(NA);
  for (let i = 0; i < NA; i++) {
    const t = Math.random() * Math.PI * 2;
    // due fasce con un vuoto in mezzo: e il vuoto che fa capire che e un anello
    const fascia = Math.random() < 0.55 ? 0.0 : 0.30;
    const rr = RAGGIO * (1.34 + fascia + Math.random() * 0.24);
    ap[i * 3] = Math.cos(t) * rr;
    ap[i * 3 + 1] = (Math.random() - 0.5) * 0.38;
    ap[i * 3 + 2] = Math.sin(t) * rr;
    ar[i] = Math.random();
  }
  const geoAnello = new THREE.BufferGeometry();
  geoAnello.setAttribute('position', new THREE.BufferAttribute(ap, 3));
  geoAnello.setAttribute('aRand', new THREE.BufferAttribute(ar, 1));
  const anello = new THREE.Points(geoAnello, matPianeta.clone());
  anello.material.uniforms.uA.value = BLU2;
  anello.rotation.set(-0.62, 0, 0.34);
  gruppo.add(anello);

  /* ---------- 2. Il tessuto che ondeggia ---------- */
  const COL = stretto ? 78 : 132;
  const RIG = stretto ? 46 : 74;
  const PASSO = 0.95;
  const tot = COL * RIG;
  const pos = new Float32Array(tot * 3);
  const rnd = new Float32Array(tot);
  let k = 0;
  for (let y = 0; y < RIG; y++) {
    for (let x = 0; x < COL; x++) {
      pos[k * 3] = (x - COL / 2) * PASSO;
      pos[k * 3 + 1] = (y - RIG / 2) * PASSO;
      pos[k * 3 + 2] = 0;
      rnd[k] = Math.random();
      k++;
    }
  }
  const geoPunti = new THREE.BufferGeometry();
  geoPunti.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geoPunti.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));

  const matPunti = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uDpr: { value: DPR },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uForza: { value: 0 },
      uA: { value: BLU }, uB: { value: BLU2 }
    },
    vertexShader: [
      'attribute float aRand;',
      'uniform float uTime;',
      'uniform float uDpr;',
      'uniform vec2  uMouse;',
      'uniform float uForza;',
      'varying float vF;',
      'varying float vR;',
      'void main() {',
      '  vec3 p = position;',
      '  float w = sin(p.x * 0.16 + uTime * 0.55) * 1.45',
      '          + sin(p.y * 0.21 + uTime * 0.41) * 1.15',
      '          + sin((p.x + p.y) * 0.09 + uTime * 0.29) * 1.85;',
      // onda che si allarga dal punto toccato: sul telefono e' l\'unica interazione possibile
      '  vec2 m = uMouse * vec2(32.0, 20.0);',
      '  float d = distance(p.xy, m);',
      '  w += (2.6 + uForza * 5.0) * exp(-d * d * 0.0030);',
      '  p.z += w;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  float dist = -mv.z;',
      '  gl_PointSize = (1.9 + aRand * 2.5) * (36.0 / dist) * uDpr;',
      '  vF = smoothstep(104.0, 16.0, dist) * (0.26 + aRand * 0.62);',
      '  vR = aRand;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uA;',
      'uniform vec3 uB;',
      'varying float vF;',
      'varying float vR;',
      'void main() {',
      '  vec2 c = gl_PointCoord - 0.5;',
      '  float r = dot(c, c);',
      '  if (r > 0.25) discard;',
      '  gl_FragColor = vec4(mix(uA, uB, vR), smoothstep(0.25, 0.0, r) * vF);',
      '}'
    ].join('\n')
  });

  const punti = new THREE.Points(geoPunti, matPunti);
  punti.rotation.x = -0.68;
  punti.position.y = stretto ? -13 : -8;
  scene.add(punti);

  /* ---------- 3. Pannelli di vetro (solo schermi larghi) ---------- */
  const vertPannello = [
    'varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n');

  const fragPannello = [
    'precision highp float;',
    'uniform float uTime;',
    'uniform float uSeed;',
    'uniform vec3  uTinta;',
    'varying vec2 vUv;',
    'float rettoTondo(vec2 p, vec2 b, float r) {',
    '  vec2 q = abs(p) - b + r;',
    '  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;',
    '}',
    'void main() {',
    '  vec2 p = (vUv - 0.5) * 2.0;',
    '  float d = rettoTondo(p, vec2(0.94, 0.90), 0.30);',
    '  float dentro = smoothstep(0.012, -0.012, d);',
    '  float bordo  = smoothstep(0.030, 0.0, abs(d)) * 0.95;',
    '  float lama = sin((vUv.x * 2.1 + vUv.y * 1.3) * 3.14159 - uTime * 0.55 + uSeed);',
    '  lama = pow(max(lama, 0.0), 7.0) * 0.55;',
    '  float barra = smoothstep(0.845, 0.858, vUv.y) * smoothstep(0.952, 0.940, vUv.y);',
    '  float ui = 0.0;',
    '  for (int i = 0; i < 3; i++) {',
    '    vec2 dp = vUv - vec2(0.085 + float(i) * 0.045, 0.897);',
    '    dp.x *= 0.62;',
    '    ui += smoothstep(0.016, 0.006, length(dp));',
    '  }',
    '  for (int j = 0; j < 3; j++) {',
    '    float yy = 0.66 - float(j) * 0.13;',
    '    float larg = 0.60 - float(j) * 0.17;',
    '    float riga = smoothstep(0.010, 0.004, abs(vUv.y - yy));',
    '    riga *= step(0.10, vUv.x) * step(vUv.x, 0.10 + larg);',
    '    ui += riga * 0.55;',
    '  }',
    '  float alpha = dentro * (0.075 + lama * 0.45 + barra * 0.14 + ui * 0.26) + bordo * 0.28;',
    '  vec3 col = mix(uTinta, vec3(1.0), lama * 0.85 + bordo * 0.55 + ui * 0.45);',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  function pannello(w, h, x, y, z, rot, tinta, seed) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 }, uSeed: { value: seed },
          uTinta: { value: new THREE.Color(tinta) }
        },
        vertexShader: vertPannello, fragmentShader: fragPannello
      })
    );
    m.position.set(x, y, z);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.userData.base = { x: x, y: y, z: z, rot: rot.slice() };
    return m;
  }

  // I tre pannelli di vetro che galleggiavano accanto al pianeta sono stati
  // tolti: distraevano dal titolo. La funzione resta, i pannelli non si creano.
  const pannelli = [];
  pannelli.forEach(function (p) { scene.add(p); });

  /* ---------- Dimensioni ---------- */
  function ridimensiona() {
    const w = hero ? hero.clientWidth : window.innerWidth;
    const h = hero ? hero.clientHeight : window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  ridimensiona();
  window.addEventListener('resize', ridimensiona, { passive: true });

  /* ---------- Cosa muove la scena ---------- */
  const punt = { x: 0, y: 0 };
  const bersaglio = { x: 0, y: 0 };
  let forza = 0;          // impulso del tocco, si spegne da solo
  let inclina = { x: 0, y: 0 };
  let scorrimento = 0;

  if (!REDUCED_MOTION) {
    window.addEventListener('pointermove', function (e) {
      bersaglio.x = (e.clientX / window.innerWidth - 0.5) * 2;
      bersaglio.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // il dito: dove tocca, il tessuto si solleva e il pianeta accelera
    if (hero) {
      hero.addEventListener('touchstart', function (e) {
        const t = e.touches[0];
        if (!t) return;
        bersaglio.x = (t.clientX / window.innerWidth - 0.5) * 2;
        bersaglio.y = (t.clientY / window.innerHeight - 0.5) * 2;
        forza = 1;
      }, { passive: true });
      hero.addEventListener('touchmove', function (e) {
        const t = e.touches[0];
        if (!t) return;
        bersaglio.x = (t.clientX / window.innerWidth - 0.5) * 2;
        bersaglio.y = (t.clientY / window.innerHeight - 0.5) * 2;
        forza = Math.max(forza, 0.6);
      }, { passive: true });
    }

    // l'inclinazione del telefono, dove il permesso non serve (Android e iOS vecchi)
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || e.beta == null) return;
      inclina.x = Math.max(-1, Math.min(1, e.gamma / 34));
      inclina.y = Math.max(-1, Math.min(1, (e.beta - 45) / 34));
    }, { passive: true });

    // lo scorrimento della pagina fa girare il pianeta: si muove anche senza toccarlo
    window.addEventListener('scroll', function () {
      scorrimento = window.scrollY;
    }, { passive: true });
  }

  if (REDUCED_MOTION) {
    matPunti.uniforms.uTime.value = 2.0;
    matPianeta.uniforms.uTime.value = 2.0;
    gruppo.rotation.y = 0.4;
    renderer.render(scene, camera);
    return;
  }

  /* ---------- Ciclo ---------- */
  let attivo = false;
  let raf = null;
  const t0 = performance.now();

  function disegna(now) {
    if (!attivo) return;
    raf = requestAnimationFrame(disegna);
    const t = (now - t0) / 1000;

    // il puntatore e l'inclinazione si sommano: sul telefono c'e' solo la seconda
    const bx = bersaglio.x + inclina.x * 0.85;
    const by = bersaglio.y + inclina.y * 0.85;
    punt.x += (bx - punt.x) * 0.045;
    punt.y += (by - punt.y) * 0.045;
    forza *= 0.94;

    matPunti.uniforms.uTime.value = t;
    matPunti.uniforms.uForza.value = forza;
    matPunti.uniforms.uMouse.value.set(punt.x, -punt.y);
    punti.rotation.z = punt.x * 0.05;

    matPianeta.uniforms.uTime.value = t;
    anello.material.uniforms.uTime.value = t;
    alone.material.uniforms.uTime.value = t;

    // rotazione continua + una spinta legata a quanto si e' scorso
    gruppo.rotation.y = t * 0.17 + scorrimento * 0.0011 + punt.x * 0.22;
    gruppo.rotation.x = 0.16 + Math.sin(t * 0.23) * 0.07 - punt.y * 0.12;
    anello.rotation.y = -t * 0.24;
    gruppo.position.y = (stretto ? -1.5 : 1) + Math.sin(t * 0.5) * 0.55;

    pannelli.forEach(function (p, i) {
      p.material.uniforms.uTime.value = t;
      const b = p.userData.base;
      p.position.y = b.y + Math.sin(t * 0.42 + i * 1.7) * 0.85;
      p.position.x = b.x + Math.cos(t * 0.31 + i * 2.3) * 0.55;
      p.rotation.x = b.rot[0] + punt.y * 0.10 + Math.sin(t * 0.36 + i) * 0.035;
      p.rotation.y = b.rot[1] - punt.x * 0.14;
    });

    camera.position.x += (punt.x * 2.6 - camera.position.x) * 0.03;
    camera.position.y += (-punt.y * 1.7 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function avvia() { if (!attivo) { attivo = true; raf = requestAnimationFrame(disegna); } }
  function ferma() { attivo = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      e[0].isIntersecting ? avvia() : ferma();
    }, { threshold: 0 }).observe(hero);
  } else {
    avvia();
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden ? ferma() : avvia();
  });
})();

/* Il modulo di contatto (e con esso EmailJS) vive ora su preventivo.html,
   con il suo preventivo.js: qui in home restano solo i tre pulsanti. */

/* =========================================================
   ANTEPRIME DEL PORTFOLIO
   Dentro ogni scheda c'è la schermata intera del sito, alta molte volte la
   finestra. Col mouse sopra, la pagina scorre piano fino in fondo: si legge
   davvero, non è un lampo.

   Sul telefono non si scorre e basta: non c'è il mouse, e far partire da sole
   quattro pagine lunghe sarebbe solo confusione. Lì resta il fermo immagine,
   che è già una schermata intera del sito.

   NB: si usa la delega su document. Il carosello duplica le schede per girare
   all'infinito, e le copie nascono dopo: un listener attaccato ora non
   finirebbe mai su di loro.
   ========================================================= */
(function initShots() {
  const CARD = '.card--portfolio';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function corsa(card) {
    const strip = card.querySelector('.shot__strip');
    const box = card.querySelector('.shot');
    if (!strip || !box) return 0;
    return Math.max(0, strip.getBoundingClientRect().height - box.getBoundingClientRect().height);
  }

  function scorri(card) {
    const strip = card.querySelector('.shot__strip');
    if (!strip) return;
    const px = corsa(card);
    if (px < 60) return;
    // ~140 px al secondo: si fa in tempo a leggere le sezioni mentre passano
    strip.style.transitionTimingFunction = 'linear';
    strip.style.transitionDuration = Math.min(20, Math.max(6, px / 140)) + 's';
    strip.style.transform = 'translate3d(0, ' + (-px) + 'px, 0)';
  }

  function torna(card) {
    const strip = card.querySelector('.shot__strip');
    if (!strip) return;
    strip.style.transitionTimingFunction = 'cubic-bezier(.16,1,.3,1)';
    strip.style.transitionDuration = '1.4s';
    strip.style.transform = 'translate3d(0, 0, 0)';
  }

  /* ---------- Da telefono: si tocca ----------
     Col mouse la schermata scorre passandoci sopra. Sul telefono il mouse non
     c'e', e prima non scorreva affatto: si vedeva solo la prima schermata e
     basta. Adesso un tocco fa partire lo scorrimento, un secondo tocco lo
     riporta in cima. La scheda non e' un link, quindi il tocco non porta via
     da nessuna parte. */
  if (!finePointer) {
    if (REDUCED_MOTION) return;

    // la pastiglia dice cosa fare col dito, non col mouse
    function etichetta(card, testo) {
      const p = card.querySelector('.shot__pc');
      if (!p) return;
      const svg = p.querySelector('svg');
      p.textContent = testo;
      if (svg) p.prepend(svg);
    }

    document.querySelectorAll(CARD).forEach(function (card) {
      etichetta(card, 'Tocca per scorrere');
    });

    document.addEventListener('click', function (e) {
      const card = e.target.closest(CARD);
      if (!card) return;
      // se si e' toccato un link o un pulsante dentro la scheda, comanda quello
      if (e.target.closest('a, button')) return;
      const inCorsa = card.classList.toggle('is-in-corsa');
      if (inCorsa) {
        scorri(card);
        etichetta(card, 'Tocca per fermare');
      } else {
        torna(card);
        etichetta(card, 'Tocca per scorrere');
      }
    });

    return;
  }

  if (REDUCED_MOTION) return;

  document.addEventListener('pointerover', function (e) {
    const card = e.target.closest(CARD);
    if (!card || card.contains(e.relatedTarget)) return;
    scorri(card);
  });
  document.addEventListener('pointerout', function (e) {
    const card = e.target.closest(CARD);
    if (!card || card.contains(e.relatedTarget)) return;
    torna(card);
  });
  // la tastiera deve poter fare la stessa cosa
  document.addEventListener('focusin', function (e) {
    const card = e.target.closest(CARD);
    if (card) scorri(card);
  });
  document.addEventListener('focusout', function (e) {
    const card = e.target.closest(CARD);
    if (card && !card.contains(e.relatedTarget)) torna(card);
  });

  // bagliore che segue il puntatore sulla scheda
  document.addEventListener('pointermove', function (e) {
    const card = e.target.closest(CARD);
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });
})();

/* =========================================================
   RIFINITURE — barra di avanzamento, titoli che salgono,
   pulsanti magnetici, pannello dell'offerta che si inclina.
   Tutto si spegne da solo se l'utente ha chiesto meno animazioni.
   ========================================================= */
(function initRifiniture() {
  if (REDUCED_MOTION) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Filo di avanzamento in cima alla pagina ---------- */
  (function barraScorrimento() {
    const barra = document.createElement('div');
    barra.className = 'scroll-barra';
    barra.setAttribute('aria-hidden', 'true');
    const filo = document.createElement('span');
    barra.appendChild(filo);
    document.body.appendChild(barra);

    let ticking = false;
    function aggiorna() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      filo.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(aggiorna); }
    }, { passive: true });
    aggiorna();
  })();

  /* ---------- 2. Titoli di sezione: le parole salgono una dopo l'altra ---------- */
  (function titoliAParole() {
    const titoli = document.querySelectorAll('h2.section__title');
    if (!titoli.length || !('IntersectionObserver' in window)) return;

    titoli.forEach(function (t) {
      // si spezza solo il testo semplice: dentro non c'è markup da salvare
      const parole = t.textContent.trim().split(/\s+/);
      if (parole.length > 14) return;
      t.textContent = '';
      t.classList.add('titolo-parole');
      parole.forEach(function (p, i) {
        const w = document.createElement('span');
        w.className = 'parola';
        w.style.setProperty('--i', i);
        w.textContent = p;
        t.appendChild(w);
        if (i < parole.length - 1) t.appendChild(document.createTextNode(' '));
      });
    });

    const io = new IntersectionObserver(function (voci, obs) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        v.target.classList.add('is-in');
        obs.unobserve(v.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });
    titoli.forEach(function (t) { io.observe(t); });
  })();

  /* ---------- 3. Pulsanti magnetici ---------- */
  (function pulsantiMagnetici() {
    if (!finePointer) return;
    document.querySelectorAll('.btn--lg').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        b.style.transform = 'translate(' + (x * 5).toFixed(2) + 'px,' + (y * 3.5).toFixed(2) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();

  /* ---------- 4. Il pannello dell'offerta si inclina col puntatore ---------- */
  (function offertaInclinata() {
    if (!finePointer) return;
    const p = document.querySelector('.offerta');
    if (!p) return;
    p.addEventListener('pointermove', function (e) {
      const r = p.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      p.style.transform = 'perspective(1400px) rotateX(' + (-y * 1.7).toFixed(2) + 'deg) rotateY(' + (x * 2.2).toFixed(2) + 'deg)';
      p.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      p.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    p.addEventListener('pointerleave', function () { p.style.transform = ''; });
  })();
})();

/* =========================================================
   COSTRUISCI IL TUO SITO
   Il telefono accanto ai comandi non è un'immagine: è il sito che si
   monta pezzo per pezzo. Cambia mestiere e cambiano colori, parole e
   foto; togli una funzione e la sezione se ne va con una molla.
   Alla fine le scelte passano al preventivo nell'indirizzo, così chi
   arriva lì trova le prime due domande già compilate.
   ========================================================= */
(function initCostruttore() {
  const zona = document.getElementById('costruisci');
  if (!zona) return;

  const mestieri = {
    ristorazione: {
      etichetta: 'Ristorazione',
      settore: 'Ristorazione',
      marchio: 'Da Mario',
      occhiello: 'RISTORANTE · SALERNO',
      titolo: 'Il gusto di casa,<br>ogni giorno',
      azione: 'Prenota un tavolo',
      fondo: '#12172B',
      hero: 'linear-gradient(150deg, #7A2B1E, #2B1410)',
      acc: '#F2A33C',
      foto: 'linear-gradient(140deg, #C2703A, #6B3218)',
      listino: ['Antipasti|da 6 €', 'Primi|da 8 €', 'Secondi|da 10 €'],
      listinoNome: 'Il menù'
    },
    bellezza: {
      etichetta: 'Bellezza',
      settore: 'Bellezza e benessere',
      marchio: 'Atelier',
      occhiello: 'PARRUCCHIERE · NOCERA',
      titolo: 'Il dettaglio<br>che si ricorda',
      azione: 'Prenota la prova',
      fondo: '#1A1614',
      hero: 'linear-gradient(150deg, #4A3B33, #211A16)',
      acc: '#D9B382',
      foto: 'linear-gradient(140deg, #D8C3AE, #7A6250)',
      listino: ['Taglio|da 18 €', 'Piega|da 15 €', 'Acconciatura sposa|su misura'],
      listinoNome: 'Il listino'
    },
    artigiano: {
      etichetta: 'Casa e artigiani',
      settore: 'Casa e artigiani',
      marchio: 'Pronto Casa',
      occhiello: 'PRONTO INTERVENTO · 24/7',
      titolo: 'Arrivo oggi,<br>non la settimana prossima',
      azione: 'Chiama ora',
      fondo: '#0E1726',
      hero: 'linear-gradient(150deg, #14396B, #0A1A2E)',
      acc: '#F97316',
      foto: 'linear-gradient(140deg, #6BA3E8, #24507F)',
      listino: ['Riparazioni|preventivo gratis', 'Installazioni|in giornata', 'Manutenzione|a contratto'],
      listinoNome: 'Cosa faccio'
    },
    studio: {
      etichetta: 'Studio',
      settore: 'Studio professionale',
      marchio: 'Studio Marino',
      occhiello: 'COMMERCIALISTI · DAL 1998',
      titolo: 'Conti in ordine,<br>testa libera',
      azione: 'Prenota consulenza',
      fondo: '#101A2B',
      hero: 'linear-gradient(150deg, #1B3557, #0C1727)',
      acc: '#8FB2FF',
      foto: 'linear-gradient(140deg, #A9C2E8, #46618C)',
      listino: ['Contabilità|ordinaria e semplificata', 'Dichiarazioni|730 · Redditi · IVA', 'Consulenza|aperture e bilanci'],
      listinoNome: 'I servizi'
    },
    ricettivo: {
      etichetta: 'B&B',
      settore: 'Ricettivo e turismo',
      marchio: 'La Masseria',
      occhiello: 'B&B · COSTA DI LEUCA',
      titolo: 'Dormi dove<br>il tempo si ferma',
      azione: 'Verifica disponibilità',
      fondo: '#141A16',
      hero: 'linear-gradient(150deg, #2F5741, #14231A)',
      acc: '#C89B5A',
      foto: 'linear-gradient(140deg, #9FC4A8, #47705A)',
      listino: ['Camera doppia|da 85 €', 'Suite con volta|da 120 €', 'Colazione|inclusa'],
      listinoNome: 'Le camere'
    },
    negozio: {
      etichetta: 'Negozio',
      settore: 'Negozio o commercio',
      marchio: 'Bottega',
      occhiello: 'NEGOZIO · CENTRO',
      titolo: 'Quello che cerchi,<br>ce l\'abbiamo',
      azione: 'Vieni a trovarci',
      fondo: '#181428',
      hero: 'linear-gradient(150deg, #4B2E6B, #1E1230)',
      acc: '#C084FC',
      foto: 'linear-gradient(140deg, #CDA8F0, #6A4494)',
      listino: ['Novità|in arrivo ogni settimana', 'Su ordinazione|in 3 giorni', 'Ritiro in negozio|gratis'],
      listinoNome: 'Il catalogo'
    }
  };

  const nomiPezzi = {
    listino: 'Menù o listino',
    galleria: 'Galleria foto',
    prenota: 'Prenotazioni',
    mappa: 'Mappa e orari',
    recensioni: 'Recensioni',
    squadra: 'Chi siamo'
  };

  const schermo = document.getElementById('telSchermo');
  const cta = document.getElementById('costrCta');
  const conto = document.getElementById('costrConto');
  const chipMestieri = Array.from(document.querySelectorAll('#costrMestieri .costr__chip'));
  const chipPezzi = Array.from(document.querySelectorAll('#costrPezzi .costr__chip'));
  const blocchi = Array.from(document.querySelectorAll('.tel__blocco'));
  if (!schermo || !cta) return;

  let mestiere = 'ristorazione';
  let scelti = new Set(['listino', 'galleria']);

  function vestiTelefono() {
    const m = mestieri[mestiere];
    schermo.style.setProperty('--tel-fondo', m.fondo);
    schermo.style.setProperty('--tel-hero', m.hero);
    schermo.style.setProperty('--tel-acc', m.acc);
    schermo.style.setProperty('--tel-foto', m.foto);

    document.getElementById('telMarchio').textContent = m.marchio;
    document.getElementById('telOcchiello').textContent = m.occhiello;
    document.getElementById('telTitolo').innerHTML = m.titolo;
    document.getElementById('telBtn').textContent = m.azione;

    // il listino cambia voce per voce col mestiere
    const bloccoListino = document.querySelector('.tel__blocco[data-pezzo="listino"]');
    if (bloccoListino) {
      const et = bloccoListino.querySelector('.tel__etichetta');
      if (et) et.textContent = m.listinoNome;
      bloccoListino.querySelectorAll('.tel__riga').forEach((r, i) => {
        const v = m.listino[i];
        if (!v) { r.style.display = 'none'; return; }
        r.style.display = '';
        const pezzi = v.split('|');
        r.innerHTML = '<i>' + pezzi[0] + '</i><b>' + pezzi[1] + '</b>';
      });
    }
  }

  function mostraPezzi() {
    blocchi.forEach(b => b.classList.toggle('is-fuori', !scelti.has(b.dataset.pezzo)));
  }

  function aggiornaConto() {
    const n = scelti.size;
    if (!n) {
      conto.textContent = 'Una pagina sola, essenziale: chi sei, dove sei, come ti contattano.';
      return;
    }
    conto.innerHTML = 'Il tuo sito avrebbe <b>' + n + (n === 1 ? ' sezione' : ' sezioni') + '</b> oltre alla presentazione.';
  }

  function aggiornaLink() {
    const m = mestieri[mestiere];
    const tipo = scelti.has('prenota')
      ? 'Sito con prenotazioni o ordini'
      : (scelti.size >= 3 ? 'Sito completo multi-pagina' : 'Una pagina sola');
    const q = new URLSearchParams({
      settore: m.settore,
      tipo: tipo,
      pezzi: Array.from(scelti).map(p => nomiPezzi[p]).join(', ')
    });
    cta.href = 'preventivo.html?' + q.toString();
  }

  function aggiornaTutto() {
    vestiTelefono();
    mostraPezzi();
    aggiornaConto();
    aggiornaLink();
  }

  chipMestieri.forEach(c => c.addEventListener('click', () => {
    mestiere = c.dataset.mestiere;
    chipMestieri.forEach(o => {
      const attivo = o === c;
      o.classList.toggle('is-scelto', attivo);
      o.setAttribute('aria-pressed', String(attivo));
    });
    aggiornaTutto();
  }));

  chipPezzi.forEach(c => c.addEventListener('click', () => {
    const p = c.dataset.pezzo;
    if (scelti.has(p)) scelti.delete(p); else scelti.add(p);
    c.classList.toggle('is-scelto', scelti.has(p));
    c.setAttribute('aria-pressed', String(scelti.has(p)));
    aggiornaTutto();
  }));

  aggiornaTutto();
})();


/* ---------- I video social partono da soli quando li guardi ----------
   Sono i video veri dei profili, tenuti dentro al sito (assets/video/):
   niente riquadro di Instagram o TikTok, che vorrebbe il banner cookie.
   Partono muti quando entrano nello schermo e si fermano quando escono,
   così non consumano dati a vuoto. Se il file non c'è resta la copertina. */
(function initReel() {
  const video = Array.from(document.querySelectorAll('.reel__video'));
  if (!video.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const osserva = new IntersectionObserver(voci => {
    voci.forEach(v => {
      const el = v.target;
      const card = el.closest('.reel');
      if (v.isIntersecting) {
        const p = el.play();
        if (p && p.catch) p.catch(() => {});
        if (card) card.classList.add('is-in-onda');
      } else {
        el.pause();
        if (card) card.classList.remove('is-in-onda');
      }
    });
  }, { threshold: 0.55 });

  video.forEach(v => {
    // se il file manca resta la copertina, senza errori in console
    v.addEventListener('error', () => {
      const card = v.closest('.reel');
      if (card) card.classList.remove('is-in-onda');
    }, true);
    osserva.observe(v);
  });
})();
