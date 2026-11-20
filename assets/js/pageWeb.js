/* ================ NIER BACkGROUND ================
 * nier-background.js — fond animé façon NieR, sans dépendance.
 * Cubes flottants avec parallaxe, grille, lignes de balayage, vignettage et grain.
 *
 * Utilisation :
 *   <script src="nier-background.js"></script>
 *   <script>
 *     const bg = NierBackground.mount();
 *     // bg.destroy() retire tout
 *   </script>
 *
 * Options de mount() (toutes facultatives) :
 *   color: [79, 75, 65]   couleur des cubes et de la grille (r, g, b)
 *   vignette: 'rgba(60,55,40,.35)'   couleur du vignettage, false pour le retirer
 *   cubes, grid, scanlines, noise: true | false   active ou retire chaque couche
 *   maxCubes: 46          nombre maximum de cubes
 *   gridSize: 48          taille des cases de la grille, en px
 *   parallax: 1           force de la parallaxe, 0 pour la couper
 *
 * La couleur de fond reste à définir par la page (ex. body { background: #d2cdb6 }),
 * et le contenu doit passer au-dessus : position: relative; z-index: 2.
 * Couches : cubes et grille en z-index 0, vignettage 49, balayage 50, grain 51.
 * Pour changer le vignettage en CSS, cible la classe .nb-vignette.
 */
(() => {
    const CSS = `
.nb-layer { position: fixed; pointer-events: none; }
.nb-cubes { inset: 0; width: 100%; height: 100%; z-index: 0; }
.nb-grid {
  inset: 0; z-index: 0; opacity: .35;
  background-image:
    linear-gradient(rgba(var(--nb-rgb), .14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--nb-rgb), .14) 1px, transparent 1px);
  background-size: var(--nb-grid) var(--nb-grid);
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
}
.nb-vignette { inset: 0; z-index: 49; background: radial-gradient(ellipse at center, transparent 55%, var(--nb-vignette) 100%); }
.nb-scan {
  inset: 0; z-index: 50; mix-blend-mode: multiply;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.045) 0 1px, transparent 1px 3px);
}
.nb-noise {
  inset: -50%; z-index: 51; opacity: .06; animation: nb-noise 1s steps(4) infinite;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
@keyframes nb-noise { 0%{transform:translate(0,0)} 25%{transform:translate(-5%,3%)} 50%{transform:translate(4%,-6%)} 75%{transform:translate(-3%,5%)} 100%{transform:translate(0,0)} }
@media (prefers-reduced-motion: reduce) { .nb-noise { animation: none; } }
`;

    function injectCSS() {
        if (document.getElementById('nb-style')) return;
        const s = document.createElement('style');
        s.id = 'nb-style'; s.textContent = CSS;
        document.head.appendChild(s);
    }

    function mount(opts = {}) {
        const o = {
            color: [79, 75, 65], vignette: 'rgba(60,55,40,.35)',
            cubes: true, grid: false, scanlines: false, noise: true,
            maxCubes: 46, gridSize: 48, parallax: 1, ...opts,
        };
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rgb = o.color.join(',');
        injectCSS();

        const layers = [];
        const layer = (tag, cls) => {
            const el = document.createElement(tag);
            el.className = 'nb-layer ' + cls;
            el.setAttribute('aria-hidden', 'true');
            el.style.setProperty('--nb-rgb', rgb);
            el.style.setProperty('--nb-grid', o.gridSize + 'px');
            if (o.vignette) el.style.setProperty('--nb-vignette', o.vignette);
            document.body.appendChild(el);
            layers.push(el);
            return el;
        };
        if (o.cubes) var cv = layer('canvas', 'nb-cubes');
        if (o.grid) layer('div', 'nb-grid');
        if (o.vignette) layer('div', 'nb-vignette');
        if (o.scanlines) layer('div', 'nb-scan');
        if (o.noise) layer('div', 'nb-noise');

        let raf = 0;
        const cleanups = [];
        if (cv) {
            const cx = cv.getContext('2d');
            let cubes = [], mx = 0, my = 0;
            const dpr = () => Math.min(devicePixelRatio || 1, 2);
            const init = () => {
                const r = cv.getBoundingClientRect(), d = dpr();
                cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d);
                const n = Math.round(Math.min(o.maxCubes, cv.width * cv.height / 60000));
                cubes = Array.from({ length: n }, () => ({
                    x: Math.random() * cv.width, y: Math.random() * cv.height,
                    s: (4 + Math.random() * 22) * d, v: .15 + Math.random() * .5,
                    r: Math.random() * 6, vr: (Math.random() - .5) * .01, z: .3 + Math.random() * .9,
                    fill: Math.random() < .45, a: .08 + Math.random() * .22,
                }));
                if (reduce) draw();
            };
            const draw = () => {
                const d = dpr();
                cx.clearRect(0, 0, cv.width, cv.height);
                cubes.forEach(c => {
                    if (!reduce) {
                        c.y -= c.v * c.z; c.r += c.vr;
                        if (c.y < -40) { c.y = cv.height + 40; c.x = Math.random() * cv.width; }
                    }
                    const x = c.x + mx * 40 * c.z * d * o.parallax, y = c.y + my * 30 * c.z * d * o.parallax;
                    cx.save(); cx.translate(x, y); cx.rotate(c.r);
                    if (c.fill) { cx.fillStyle = `rgba(${rgb},${c.a})`; cx.fillRect(-c.s / 2, -c.s / 2, c.s, c.s); }
                    else { cx.strokeStyle = `rgba(${rgb},${c.a + .08})`; cx.lineWidth = 1; cx.strokeRect(-c.s / 2, -c.s / 2, c.s, c.s); }
                    cx.restore();
                });
            };
            const loop = () => { draw(); raf = requestAnimationFrame(loop); };
            const onMove = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
            addEventListener('resize', init);
            addEventListener('pointermove', onMove);
            cleanups.push(() => { removeEventListener('resize', init); removeEventListener('pointermove', onMove); });
            init();
            if (!reduce) loop();
        }

        return {
            destroy() {
                cancelAnimationFrame(raf);
                cleanups.forEach(f => f());
                layers.forEach(l => l.remove());
            },
        };
    }

    window.NierBackground = { mount };
})();



/* ================ NIER GLITCH ================
 * nier-glitch.js — effets de glitch façon NieR, sans dépendance.
 *
 * Utilisation :
 *   <h1 class="gt">BUNKER</h1>
 *   <script src="nier-glitch.js"></script>
 *   <script>
 *     NierGlitch.start();                       // rafales aléatoires sur tous les .gt
 *     NierGlitch.burst(el);                     // une rafale sur un texte (el doit avoir .gt)
 *     NierGlitch.burst(el, 1200);               // idem, durée en ms
 *     NierGlitch.block(el);                     // déchire un bloc entier
 *     NierGlitch.flash();                       // flash de bandes sur tout l'écran
 *     NierGlitch.decode(el, 'TEXTE', onDone);   // le texte se décode depuis des symboles
 *     NierGlitch.markWords(el, texte, /mot|autre mot/);  // écrit texte dans el, les mots trouvés glitchent plus souvent
 *   </script>
 *
 * Le motif de markWords ne doit pas contenir de groupe capturant : (?:...) si besoin.
 * Classes : .gt est un texte qui peut glitcher, .gt.hot glitche plus souvent.
 * start() accepte { selector: '.gt', hot: '.gt.hot', min: 900, max: 3100 } et renvoie
 * une fonction pour l'arrêter. Un .gt doit contenir du texte seul.
 * Couleurs à surcharger en CSS, au format r, g, b :
 *   :root { --gt-accent-rgb: 195, 96, 76; --gt-ink-rgb: 79, 75, 65; }
 * Tout est désactivé si le système demande de réduire les animations.
 */
(() => {
    const CSS = `
:where(:root) { --gt-accent-rgb: 195, 96, 76; --gt-ink-rgb: 79, 75, 65; }
.gt { position: relative; }
em.gt, span.gt { display: inline-block; }
.gt::before, .gt::after {
  content: attr(data-text); position: absolute; inset: 0; padding: inherit;
  opacity: 0; pointer-events: none;
}
.gt.burst { animation: gt-base .18s steps(1) infinite; }
.gt.burst::before { opacity: 1; color: rgb(var(--gt-accent-rgb)); animation: gt-a .24s steps(1) infinite; }
.gt.burst::after { opacity: .85; animation: gt-b .3s steps(1) infinite; }
@keyframes gt-base {
  0% { transform: none; }
  33% { transform: translateX(1px) skewX(-6deg); }
  66% { transform: translateX(-2px); }
}
@keyframes gt-a {
  0% { clip-path: inset(8% 0 62% 0); transform: translateX(-5px); }
  25% { clip-path: inset(58% 0 12% 0); transform: translateX(6px); }
  50% { clip-path: inset(30% 0 48% 0); transform: translateX(-3px); }
  75% { clip-path: inset(78% 0 4% 0); transform: translateX(4px); }
}
@keyframes gt-b {
  0% { clip-path: inset(62% 0 18% 0); transform: translateX(5px); }
  25% { clip-path: inset(12% 0 70% 0); transform: translateX(-6px); }
  50% { clip-path: inset(44% 0 34% 0); transform: translateX(3px); }
  75% { clip-path: inset(0 0 82% 0); transform: translateX(-4px); }
}
.gt-block { animation: gt-block .38s steps(2) both; }
@keyframes gt-block {
  0% { clip-path: inset(10% 0 70% 0); transform: translate(-8px, 0); filter: contrast(1.6); }
  20% { clip-path: inset(55% 0 20% 0); transform: translate(10px, 0); }
  40% { clip-path: inset(30% 0 45% 0); transform: translate(-4px, 2px); }
  60% { clip-path: inset(80% 0 2% 0); transform: translate(6px, -2px); }
  80% { clip-path: inset(0 0 85% 0); transform: translate(-2px, 0); }
  100% { clip-path: inset(0 0 0 0); transform: none; filter: none; }
}
.gt-flash { position: fixed; inset: 0; z-index: 60; pointer-events: none; opacity: 0; }
.gt-flash.on { animation: gt-flash .5s steps(3) both; }
@keyframes gt-flash {
  0% { opacity: 1; background: repeating-linear-gradient(0deg, rgba(var(--gt-accent-rgb), .35) 0 6px, transparent 6px 22px, rgba(var(--gt-ink-rgb), .4) 22px 25px, transparent 25px 60px); transform: translateX(-12px); }
  50% { opacity: 1; background: repeating-linear-gradient(0deg, transparent 0 14px, rgba(17, 16, 13, .5) 14px 16px, transparent 16px 40px); transform: translateX(14px); }
  100% { opacity: 0; transform: none; }
}
`;
    const style = document.createElement('style');
    style.id = 'gt-style'; style.textContent = CSS;
    document.head.appendChild(style);

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // symboles par code pour rester justes même sur une page sans <meta charset="utf-8">
    const GLYPHS = String.fromCodePoint(0x2593, 0x2592, 0x2591, 0x2588, 0x259A, 0x259E, 0x25C6, 0x25C7, 0x25A0, 0x25A1) + '01ABCDEFXYZ#%&@';
    const glyph = () => GLYPHS[Math.random() * GLYPHS.length | 0];
    const corrupt = t => [...t].map(c => c !== ' ' && Math.random() < .18 ? glyph() : c).join('');

    function burst(el, ms = 260 + Math.random() * 420) {
        if (reduce || !el || el.classList.contains('burst')) return;
        el.dataset.text = corrupt(el.textContent);
        el.classList.add('burst');
        const t = setInterval(() => el.dataset.text = corrupt(el.textContent), 60);
        setTimeout(() => { clearInterval(t); el.classList.remove('burst'); }, ms);
    }

    function block(el) {
        if (reduce || !el) return;
        el.classList.remove('gt-block'); void el.offsetWidth; el.classList.add('gt-block');
    }

    let overlay = null;
    function flash() {
        if (reduce) return;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'gt-flash';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }
        overlay.classList.remove('on'); void overlay.offsetWidth; overlay.classList.add('on');
    }

    const decodeTimers = new Map();
    function decode(el, text, onDone) {
        clearInterval(decodeTimers.get(el));
        if (reduce) { el.textContent = text; if (onDone) onDone(el); return; }
        let f = 0; const total = 16;
        const t = setInterval(() => {
            f++;
            el.textContent = [...text].map((c, i) => {
                if (c === ' ') return ' ';
                return i < (f / total) * text.length ? c : glyph();
            }).join('');
            if (f >= total) { clearInterval(t); el.textContent = text; if (onDone) onDone(el); }
        }, 28);
        decodeTimers.set(el, t);
    }

    function markWords(el, text, pattern) {
        el.textContent = '';
        // le groupe capturant garde les mots trouvés aux indices impairs du découpage
        text.split(new RegExp('(' + pattern.source + ')', pattern.flags)).forEach((p, i) => {
            if (i % 2 === 0) { el.append(p); return; }
            const s = document.createElement('span');
            s.className = 'gt hot'; s.textContent = p;
            el.append(s);
        });
    }

    function start({ selector = '.gt', hot = '.gt.hot', min = 900, max = 3100 } = {}) {
        let timer = 0;
        const tick = () => {
            const all = document.querySelectorAll(selector);
            if (all.length) burst(all[Math.random() * all.length | 0]);
            document.querySelectorAll(hot).forEach(e => { if (Math.random() < .5) burst(e); });
            timer = setTimeout(tick, min + Math.random() * (max - min));
        };
        tick();
        return () => clearTimeout(timer);
    }

    window.NierGlitch = { burst, block, flash, decode, markWords, start };
})();

// Rafales de glitch aléatoires sur tous les textes .gt de la page (voir nier-glitch.js)
NierGlitch.start();