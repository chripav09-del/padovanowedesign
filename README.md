# Christian Padovano — Web Design, Salerno

Sito vetrina di Padovano Web Design. HTML, CSS e JavaScript puri: nessun framework,
nessuna compilazione, nessuna dipendenza da installare.

## Come e' fatto

```
index.html         home
costruisci.html    il costruttore: si sceglie mestiere, nome e carattere e il
                   sito si monta dentro un telefono, poi le scelte passano al
                   preventivo o a WhatsApp gia' scritte
preventivo.html    quattro domande e il prezzo arriva per email (EmailJS)
privacy.html       informativa privacy e cookie policy
recensioni.html    pagina ponte verso la scheda Google
404.html           pagina di errore
style.css          tutti gli stili
script.js          scena 3D dell'hero, caroselli, video social, animazioni
costruisci.js      solo il costruttore
_headers           header di sicurezza (attivi su Cloudflare Pages e Netlify)
robots.txt
sitemap.xml
assets/
  fonts/           i caratteri, copiati dentro il sito
  lib/             Three.js, AOS ed EmailJS, copiati dentro il sito
  lavori/          le schermate dei siti consegnati, nomi dei clienti sostituiti
  video/           i video dei social
  social/          i post
```

## Perche' niente CDN

Font e librerie **non** arrivano da Google o da altri server esterni: stanno dentro
`assets/`. Cosi' nessun visitatore viene mandato a un terzo solo per leggere una
scritta, non c'e' trasferimento di indirizzi IP fuori dal sito, e **il banner cookie
non serve**. Se un domani si aggiunge Analytics o un pixel, il banner torna
obbligatorio: e' un'aggiunta da valutare, non una svista da correggere.

## Pubblicazione

Il sito e' statico: si pubblica cosi' com'e', senza build.

**Cloudflare Pages** (consigliato, gli header di `_headers` diventano attivi):
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Repository: questo. Branch: `main`
3. Build command: **vuoto**. Build output directory: `/`
4. Salva: da li' in poi ogni push aggiorna il sito da solo.

**Nota:** l'indirizzo `padovanowebsite.chripav09.workers.dev` oggi serve una versione
piu' vecchia, pubblicata in altro modo. Finche' non lo si collega a questo repository
(o non lo si ripubblica a mano), aggiornare qui **non** aggiorna quell'indirizzo.

## Aggiornare

Modifica i file, poi:

```bash
git add -A
git commit -m "cosa hai cambiato"
git push
```

Se cambi `style.css` o `script.js`, alza il numero dopo `?v=` nei richiami dentro le
pagine: serve a non far servire ai browser la versione vecchia dalla cache.
