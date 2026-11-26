const calme = matchMedia('(prefers-reduced-motion:reduce)').matches;
if (!calme) document.documentElement.classList.add('pret');
const racine = document.documentElement;
const modeDessin = () => document.body.classList.contains('dessin');

// ---------- éclaboussure au clic
if (!calme) document.addEventListener('pointerdown', e => {
    const d = document.createElement('div');
    const s = 60 + Math.random() * 50;
    d.className = 'splash';
    d.style.left = e.clientX + 'px';
    d.style.top = e.clientY + 'px';
    d.style.width = d.style.height = s + 'px';
    d.style.margin = `${-s / 2}px 0 0 ${-s / 2}px`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2600);
});

// ---------- thème clair / sombre (mémorisé si le navigateur l'autorise)
const lireTheme = () => { try { return localStorage.getItem('encre-theme') } catch (e) { return null } };
const ecrireTheme = v => { try { localStorage.setItem('encre-theme', v) } catch (e) { } };
const appliquerTheme = v => {
    if (v === 'sombre') racine.setAttribute('data-theme', 'sombre'); else racine.removeAttribute('data-theme');
    ecrireTheme(v); dispatchEvent(new Event('themechange'));
};
if (lireTheme() === 'sombre') racine.setAttribute('data-theme', 'sombre');

// ---------- traits de séparation qui se dessinent
const io = new IntersectionObserver(l => l.forEach(x => { if (x.isIntersecting) { x.target.classList.add('vu'); io.unobserve(x.target) } }), { threshold: .8 });
document.querySelectorAll('.trait').forEach(h => io.observe(h));

// ---------- peinture au survol (sens tiré au hasard, écrit directement par le JS)
document.querySelectorAll('.btn--ds,.tag').forEach(b => {
    b.insertAdjacentHTML('afterbegin', '<i class="peint"></i>'); b.addEventListener('pointerenter', () => {
        b.querySelector('.peint').style.transform = `scaleX(${Math.random() < .5 ? 1 : -1})`;
    });
});

// ---------- canvas partagé : tracé du curseur et mode dessin
const cv = document.createElement('canvas'); cv.id = 'pinceau'; document.body.appendChild(cv);
const cx = cv.getContext('2d'); let W, H;
const size = () => { const r = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; cx.setTransform(r, 0, 0, r, 0, 0) };
size(); addEventListener('resize', size);
const couleur = nom => getComputedStyle(racine).getPropertyValue(nom).trim();
let col = couleur('--encre') || '#22262b';
addEventListener('themechange', () => { col = couleur('--encre') });

if (!calme) {
    let last = null, mid = null, lw = 6, run = false, idle = 0;
    const frame = () => {
        if (modeDessin()) { run = false; last = mid = null; return }
        cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.07)'; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = 'source-over';
        if (++idle < 110) requestAnimationFrame(frame); else { run = false; last = mid = null; cx.clearRect(0, 0, W, H) }
    };
    addEventListener('pointermove', e => {
        const p = { x: e.clientX, y: e.clientY };
        if (last) {
            const d = Math.hypot(p.x - last.x, p.y - last.y);
            lw += (Math.max(3, 18 - d * .3) - lw) * .2;
            const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
            cx.strokeStyle = col; cx.lineWidth = lw; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo((mid || last).x, (mid || last).y); cx.quadraticCurveTo(last.x, last.y, m.x, m.y); cx.stroke(); mid = m;
        }
        last = p; idle = 0; if (!run) { run = true; requestAnimationFrame(frame) }
    });
}

// ---------- reconnaissance de gestes : cercle, 日 (soleil) et 夜 (nuit)
// Reconnaissance de gestes par structure : cercle, 日 (soleil), 夜 (nuit)
function reconnaitre(traits) {
    traits = traits.filter(t => t.length > 1);
    const pts = traits.flat();
    if (!pts.length) return null;
    const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x));
    const y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
    const w = x1 - x0, h = y1 - y0;
    if (Math.max(w, h) < 60) return null;                 // trop petit
    const ratio = w / (h || 1);
    const longueur = t => t.reduce((a, p, i) => i ? a + Math.hypot(p.x - t[i - 1].x, p.y - t[i - 1].y) : 0, 0);
    // points rééchantillonnés régulièrement sur chaque trait, ramenés au carré unité
    const dense = [];
    traits.forEach(t => {
        const L = longueur(t), pas = Math.max(L / Math.max(8, Math.round(L / 4)), 1); let reste = 0;
        for (let i = 1; i < t.length; i++) {
            const a = t[i - 1], b = t[i], d = Math.hypot(b.x - a.x, b.y - a.y);
            let s = pas - reste;
            while (s <= d) { const k = s / d; dense.push({ x: (a.x + (b.x - a.x) * k - x0) / (w || 1), y: (a.y + (b.y - a.y) * k - y0) / (h || 1) }); s += pas }
            reste = d - (s - pas);
        }
    });
    // nombre de cases (sur n) touchées par au moins 2 points dans une bande
    const couv = (axe, a, b, n = 5) => {
        const c = new Array(n).fill(0);
        dense.forEach(p => { const t = axe === 'x' ? p.y : p.x, u = axe === 'x' ? p.x : p.y; if (t >= a && t <= b) c[Math.min(n - 1, Math.floor(u * n))]++ });
        return c.map(v => v >= 2);
    };
    const nb = c => c.filter(Boolean).length;

    // cercle : un seul trait qui tourne d'environ un tour, sans angles, ouvert ou chevauché
    if (traits.length === 1) {
        const brut = traits[0];
        // points répartis régulièrement sur le trait (quelle que soit la vitesse de la main), puis lissage léger
        const echant = (tr, n) => {
            const L = longueur(tr); if (!L) return tr;
            const out = []; let j = 1, acc = 0;
            for (let i = 0; i < n; i++) {
                const d = L * i / (n - 1);
                while (j < tr.length - 1 && acc + Math.hypot(tr[j].x - tr[j - 1].x, tr[j].y - tr[j - 1].y) < d) { acc += Math.hypot(tr[j].x - tr[j - 1].x, tr[j].y - tr[j - 1].y); j++ }
                const p = tr[j - 1], q = tr[j], seg = Math.hypot(q.x - p.x, q.y - p.y) || 1, k = Math.min(1, Math.max(0, (d - acc) / seg));
                out.push({ x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k });
            }
            return out;
        };
        const reg = echant(brut, 72);
        const lisse = reg.map((_, i) => { let a = 0, b = 0, n = 0; for (let j = Math.max(0, i - 3); j <= Math.min(reg.length - 1, i + 3); j++) { a += reg[j].x; b += reg[j].y; n++ } return { x: a / n, y: b / n } });
        const t = lisse.filter((_, i) => i % 3 === 0 || i === lisse.length - 1).map(p => ({ x: (p.x - x0) / (w || 1), y: (p.y - y0) / (h || 1) }));
        const virages = [];
        for (let i = 1; i < t.length - 1; i++) {
            let d = Math.atan2(t[i + 1].y - t[i].y, t[i + 1].x - t[i].x) - Math.atan2(t[i].y - t[i - 1].y, t[i].x - t[i - 1].x);
            while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; virages.push(d);
        }
        const total = virages.reduce((a, v) => a + v, 0), sens = Math.sign(total) || 1;
        const constant = virages.filter(v => v * sens >= -.15).length / (virages.length || 1);
        const coins = virages.filter(v => Math.abs(v) > .9).length;
        const cx = t.reduce((a, p) => a + p.x, 0) / t.length, cy = t.reduce((a, p) => a + p.y, 0) / t.length;
        const r = t.map(p => Math.hypot(p.x - cx, p.y - cy)), rm = r.reduce((a, v) => a + v, 0) / r.length;
        const var_ = Math.sqrt(r.reduce((a, v) => a + (v - rm) ** 2, 0) / r.length) / rm;
        const plat = virages.filter(v => Math.abs(v) < .08).length / (virages.length || 1);
        const ok_ratio = ratio > .5 && ratio < 2;
        if (Math.abs(total) < 4.5) return { echec: 'Il faut fermer le cercle : fais presque un tour complet.' };
        if (Math.abs(total) > 8.8) return { echec: 'Un seul tour suffit pour le cercle.' };
        if (coins > 2 || plat > .4 || var_ > .26 || constant < .8 || !ok_ratio) return { echec: 'Le cercle est trop anguleux : trace-le d’un geste fluide.' };
        return { nom: 'cercle', cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, taille: Math.max(w, h), box: [x0, y0, x1, y1] };
    }
    const box = [x0, y0, x1, y1];
    const geo = traits.map(t => {
        const xs = t.map(p => p.x), ys = t.map(p => p.y); const a = Math.min(...xs), b = Math.max(...xs), c = Math.min(...ys), d = Math.max(...ys);
        return { ex: (b - a) / (w || 1), ey: (d - c) / (h || 1), cx: ((a + b) / 2 - x0) / (w || 1), cy: ((c + d) / 2 - y0) / (h || 1), long: Math.hypot(b - a, d - c) / Math.max(w, h) }
    });
    const barreH = g => g.ex >= .55 && (g.ey * h) / (g.ex * w || 1) <= .28;
    // 日 : cadre + barre au milieu, 2 à 6 traits
    if (traits.length <= 6 && ratio > .4 && ratio < 1.6) {
        const haut = nb(couv('x', 0, .25)) >= 4, bas = nb(couv('x', .75, 1)) >= 4;
        const gauche = nb(couv('y', 0, .25)) >= 4, droite = nb(couv('y', .75, 1)) >= 4;
        const mil = couv('x', .3, .7);
        const barre = geo.some(g => barreH(g) && g.cy > .3 && g.cy < .7);
        const encombre = dense.filter(p => p.x > .2 && p.x < .8 && p.y > .2 && p.y < .8 && (p.y < .35 || p.y > .65)).length / dense.length;
        if (haut && bas && gauche && droite && mil[1] && mil[2] && mil[3] && barre && encombre < .15) return { nom: 'jour', cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, taille: Math.max(w, h), box };
    }
    // 夜 : au moins 6 traits, grande barre en haut, encre répartie en bas
    if (traits.length >= 6 && traits.length <= 12 && ratio > .5 && ratio < 1.5) {
        const barre = geo.some(g => barreH(g) && g.cy > .08 && g.cy < .38);
        const vertG = geo.some(g => g.ey >= .35 && g.ex <= .25 && g.cx < .45 && g.cy > .45);
        const petits = geo.filter(g => g.long <= .3).length >= 2;
        const bas = nb(couv('x', .42, 1)) >= 4;
        if (barre && vertG && petits && bas) return { nom: 'nuit', cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, taille: Math.max(w, h), box };
    }

    return null;
}

// ---------- mode dessin : on trace un geste, la page le reconnaît
(() => {
    const btn = document.getElementById('btn-dessin'), aide = document.getElementById('aide-dessin'), msg = document.getElementById('msg-geste');
    let traits = [], courant = null, minuteur = null, msgT = null;
    const dire = texte => { msg.textContent = texte; msg.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => msg.classList.remove('on'), 2400) };
    const effacer = () => cx.clearRect(0, 0, W, H);
    const segment = (a, b) => { cx.strokeStyle = col; cx.lineWidth = 7; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke() };
    const basculer = on => {
        document.body.classList.toggle('dessin', on); btn.setAttribute('aria-pressed', on); aide.hidden = !on;
        traits = []; courant = null; clearTimeout(minuteur); effacer(); if (!on) msg.classList.remove('on');
    };
    btn.addEventListener('click', () => basculer(!modeDessin()));
    addEventListener('keydown', e => { if (e.key === 'Escape' && modeDessin()) basculer(false) });

    cv.addEventListener('pointerdown', e => {
        if (!modeDessin()) return;
        e.preventDefault(); cv.setPointerCapture(e.pointerId); clearTimeout(minuteur);
        courant = [{ x: e.clientX, y: e.clientY }]; traits.push(courant);
        cx.fillStyle = col; cx.beginPath(); cx.arc(e.clientX, e.clientY, 3.5, 0, 7); cx.fill();
    });
    cv.addEventListener('pointermove', e => {
        if (!courant) return;
        const p = { x: e.clientX, y: e.clientY }, q = courant[courant.length - 1];
        if (Math.hypot(p.x - q.x, p.y - q.y) < 2) return;
        courant.push(p); segment(q, p);
    });
    const fin = () => {
        if (!courant) return;
        if (courant.length === 1) courant.push({ x: courant[0].x + 3, y: courant[0].y + 3 });   // un simple point compte comme un trait
        courant = null; minuteur = setTimeout(analyser, 1250);                            // on attend 1,25 s pour un éventuel trait suivant
    };
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);

    const analyser = () => {
        const brut = traits; traits = [];
        const r = reconnaitre(brut);
        if (!r || r.echec) { dire(r ? r.echec : 'Geste non reconnu, essaie encore.'); effacer(); return }
        // le tracé devient rouge et un sceau s'imprime
        effacer(); cx.strokeStyle = couleur('#b3302a'); cx.lineWidth = 7; cx.lineCap = 'round'; cx.lineJoin = 'round';
        brut.forEach(tr => { cx.beginPath(); tr.forEach((p, i) => i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y)); cx.stroke() });
        const s = document.createElement('div'); s.className = 'tampon'; s.setAttribute('aria-hidden', 'true');
        s.textContent = { nuit: '夜', jour: '日', cercle: '円' }[r.nom];
        s.style.left = Math.min(r.box ? r.box[2] + 8 : r.cx, W - 64) + 'px'; s.style.top = Math.min((r.box ? r.box[3] : r.cy) - 24, H - 110) + 'px';
        document.body.appendChild(s); setTimeout(() => s.remove(), 1900);
        setTimeout(() => {
            if (r.nom === 'nuit') changerTheme('sombre', r.cx, r.cy);
            else if (r.nom === 'jour') changerTheme('clair', r.cx, r.cy);
            else goutte(r.cx, r.cy, r.taille);
            setTimeout(() => { if (!traits.length && !courant) effacer() }, 1200);
        }, 600);
    };

    // le thème change sous une vague d'encre qui part du geste
    const changerTheme = (nom, x, y) => {
        const sombre = nom === 'sombre';
        if (sombre === (racine.getAttribute('data-theme') === 'sombre')) { dire(sombre ? 'Déjà en thème sombre' : 'Déjà en thème clair'); return }
        dire(sombre ? 'Thème sombre' : 'Thème clair');
        if (calme) { appliquerTheme(nom); return }
        const R = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) / .62 * 1.03;
        const o = document.createElement('div'); o.className = 'encrage';
        o.dataset.theme = sombre ? 'clair' : 'sombre';
        o.style.cssText = `left:${x - R}px;top:${y - R}px;width:${2 * R}px;height:${2 * R}px;background:radial-gradient(circle closest-side,var(--papier2) 0 62%,transparent 72%)`;
        document.body.appendChild(o);
        requestAnimationFrame(() => requestAnimationFrame(() => { o.style.transform = 'scale(1)' }));
        setTimeout(() => { appliquerTheme(nom); o.style.opacity = '0' }, 850);
        setTimeout(() => o.remove(), 1600);
    };

    // le cercle fait tomber une grande goutte d'encre, avec des gouttelettes autour
    const goutte = (x, y, taille) => {
        dire('Une goutte d’encre');
        const s = Math.min(520, Math.max(180, taille * 1.3));
        const g = document.createElement('div'); g.className = 'splash';
        g.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px`;
        document.body.appendChild(g); setTimeout(() => g.remove(), 2600);
        for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2, d = s * (.45 + Math.random() * .5), r = 8 + Math.random() * 26;
            const e = document.createElement('i'); e.className = 'gouttelette';
            e.style.cssText = `left:${x + Math.cos(a) * d - r / 2}px;top:${y + Math.sin(a) * d - r / 2}px;width:${r}px;height:${r}px;animation-delay:${(Math.random() * .4).toFixed(2)}s,1.7s`;
            document.body.appendChild(e); setTimeout(() => e.remove(), 2600);
        }
    };
})();

/* // menu de navigation
(() => {
    const b = document.querySelector('.burger'), m = document.getElementById('menu');
    const fermer = () => { b.setAttribute('aria-expanded', 'false'); m.classList.remove('ouvert') };
    b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); m.classList.toggle('ouvert', o) });
    m.addEventListener('click', e => { if (e.target.closest('a')) fermer() });
    addEventListener('keydown', e => { if (e.key === 'Escape') fermer() });
    const liens = [...m.querySelectorAll('a')];
    const so = new IntersectionObserver(l => l.forEach(x => { if (x.isIntersecting) liens.forEach(a => a.setAttribute('aria-current', a.hash === '#' + x.target.id)) }), { rootMargin: '-25% 0px -65% 0px' });
    document.querySelectorAll('h2[id]').forEach(h => so.observe(h));
})(); */
