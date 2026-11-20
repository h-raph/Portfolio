(() => {
    const B1 = [
        {
            n: 'Site mariage',
            git: 'https://github.com/h-raph/Site-mariage',
            site: 'https://site-mariage-six.vercel.app/',
            lines: [
                ['> ACCESS ARCHIVE: SITE MARIAGE', 'hl'],
                '> Chargement du module...',
                '  Type ........ Exercice',
                '  Objectif .......... Styliser une page avec CSS',
                '  Notion ................ HTML, CSS',
                ['> STATUT : opérationnel ✔', 'hl']]
        },
        {
            n: 'Star Wars, la première trilogie',
            git: 'https://github.com/h-raph/star-wars-trilogie',
            site: 'https://star-wars-trilogie.vercel.app/',
            lines: [
                ['> ACCESS ARCHIVE: SITE MARIAGE', 'hl'],
                '> Chargement du module...',
                '  Type ........ Exercice',
                '  Objectif .......... Styliser une page avec CSS',
                '  Notion ................ HTML, CSS',
                ['> STATUT : opérationnel ✔', 'hl']]
        },
        {
            n: 'Collectif Rainbow Photo',
            git: 'https://github.com/h-raph/Collectif-Rainbow-Photo',
            site: 'https://collectif-rainbow-photo.vercel.app/',
            lines: [
                ['> ACCESS ARCHIVE: SITE MARIAGE', 'hl'],
                '> Chargement du module...',
                '  Type ........ Exercice',
                '  Objectif .......... Styliser une page avec CSS',
                '  Notion ................ HTML, CSS',
                ['> STATUT : opérationnel ✔', 'hl']]
        }
    ];

    const B2 = [
        {
            n: 'Resonance',
            git: 'https://github.com/h-raph/Resonance',
            site: 'https://gitflow-sigma.vercel.app/',
            lines: [
                ['> ACCESS ARCHIVE: RESONANCE', 'hl'],
                '> Chargement du module...',
                '  Type ........ Exercice',
                '  Objectif .......... Créer des pages avec la méthode SMACS et BEM',
                '  Notion ................ SCSS, NPX/NPM',
                ['> STATUT : opérationnel ✔', 'hl']]
        },
        {
            n: 'Mediatheque',
            git: 'https://github.com/h-raph/Mediatheque',
            site: 'https://mediatheque-tau.vercel.app/',
            lines: [
                ['> ACCESS ARCHIVE: MEDIATHEQUE', 'hl'],
                '> Chargement du modul...',
                '  Type ........ Exercice',
                '  Objectif .......... Créer une page en SASS et utiliser la méthode BEM',
                '  Notion ................ SCSS, NPX/NPM',
                ['> STATUT : opérationnel ✔', 'hl']]
        }
    ];

    const Perso = [
        {
            n: 'Mangathèque', 
            git: 'https://github.com/h-raph/Librairy-mangatheque',
            site: 'https://mangatheque.alwaysdata.net/index.php',
            lines: [
                ['> ACCESS ARCHIVE: MANGATHEQUE', 'hl'],
                '> Connexion à l’API publique...',
                '  Source API .............. AniList',
                '  Couvertures ......... récupération automatique',
                '  Front ............... HTML / CSS / JS',
                ['> STATUT : en cours de développement', 'hl']]
        },
        {
            n: 'Mini-jeu hacking', 
            site: 'http://127.0.0.1:5501/pages/miniGame.html',
            lines: [
                ['> ACCESS ARCHIVE: HACKING_GAME', 'hl'],
                '> Initialisation du moteur...',
                '  Genre ............... shoot’em up',
                '  Vue ................. isométrique',
                '  Inspiration ......... piratage de NieR:Automata',
                '  Rendu ............... three.js (envisagé)',
                ['> STATUT : concept', 'hl']]
        },
    ];

    const annees = [
        { titre: '1ère année', projets: B1 },
        { titre: '2ème année', projets: B2 },
        { titre: 'Projet personnel', projets: Perso}
    ];

    const P = annees.flatMap(a => a.projets);

    /* P[1].git = 'https://github.com/h-raph/Librairy-mangatheque';
    P[1].site = 'https://mangatheque.alwaysdata.net/index.php'; */

    const term = document.getElementById('term'), menu = document.getElementById('menu'), lk = document.getElementById('links');
    let run = 0, cur = 0, speed = 22, skip = false;
    const sleep = ms => new Promise(r => setTimeout(r, skip ? 0 : ms));
    let k = 0;
    annees.forEach(a => {
        const h = document.createElement('h2');
        h.textContent = a.titre;
        menu.appendChild(h);
        a.projets.forEach(p => {
            const idx = k++;
            const b = document.createElement('button');
            b.textContent = p.n;
            b.onclick = () => play(idx);
            menu.appendChild(b);
        });
    });
    async function play(i) {
        cur = i; const id = ++run; skip = false;
        [...menu.querySelectorAll('button')].forEach((b, k) => b.classList.toggle('on', k === i));
        term.innerHTML = ''; lk.innerHTML = ''; term.classList.remove('shake'); void term.offsetWidth; term.classList.add('shake');
        const c = document.createElement('span'); c.className = 'cur';
        const out = document.createElement('span'); term.append(out, c);
        const boot = ['[ BOOT ] YoRHa interface v2.0', '[ BOOT ] noyau chargé', '[ OK ] mémoire vérifiée .......... 100%', '[ OK ] liaison sécurisée établie', '[ WARN ] intrusion détectée, contournement...', '[ OK ] accès accordé', ''];
        const all = [...boot.map(t => [t, 'dim']), ...P[i].lines];
        for (const l of all) {
            if (id !== run) return;
            const [t, cls] = Array.isArray(l) ? l : [l, ''];
            const s = document.createElement('span'); if (cls) s.className = cls; out.appendChild(s);
            for (const ch of t) { if (id !== run) return; s.textContent += ch; if (!skip) await sleep(speed) }
            out.appendChild(document.createTextNode('\n'));
            await sleep(160);
        }
        if (id === run) showLinks(i);
    }
    function showLinks(i) {
        const p = P[i]; lk.innerHTML = ''; if (!p.git && !p.site) return;
        const mk = (t, h) => { const a = document.createElement('a'); a.textContent = t; a.href = h; a.target = '_blank'; a.rel = 'noopener'; lk.appendChild(a) };
        if (p.git) mk('> Ouvrir le code', p.git);
        if (p.site) mk('> Voir le site', p.site);
    }
    document.getElementById('replay').onclick = () => play(cur);
    document.getElementById('skip').onclick = () => { skip = true };
    document.getElementById('speed').onclick = function () { speed = speed > 10 ? 6 : 22; this.textContent = 'Vitesse ×' + (speed > 10 ? 1 : 3) };
    document.getElementById('speed').style.cursor = 'pointer';
    setInterval(() => { document.getElementById('clock').textContent = new Date().toTimeString().slice(0, 8) }, 1000);
    (() => {
        const cv = document.getElementById('grid'), x = cv.getContext('2d'); let W, H; const S = 44; let cells = [];
        function rs() { W = cv.width = innerWidth; H = cv.height = innerHeight } rs(); addEventListener('resize', rs);
        const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
        setInterval(() => { if (cells.length < 14) cells.push({ c: Math.floor(Math.random() * W / S), r: Math.floor(Math.random() * H / S), t: 0, h: hex() }) }, 350);
        (function f() {
            x.clearRect(0, 0, W, H); x.strokeStyle = 'rgba(69,65,56,.1)'; x.lineWidth = 1; x.beginPath();
            for (let i = 0; i <= W; i += S) { x.moveTo(i + .5, 0); x.lineTo(i + .5, H) } for (let j = 0; j <= H; j += S) { x.moveTo(0, j + .5); x.lineTo(W, j + .5) } x.stroke();
            x.font = '10px ui-monospace,Menlo,monospace';
            cells = cells.filter(k => k.t < 120);
            cells.forEach(k => { k.t++; const a = Math.sin(k.t / 120 * Math.PI) * .22; x.fillStyle = 'rgba(69,65,56,' + a + ')'; x.fillRect(k.c * S + 1, k.r * S + 1, S - 1, S - 1); x.fillStyle = 'rgba(69,65,56,' + Math.min(1, a * 3) + ')'; x.fillText(k.h, k.c * S + 6, k.r * S + S - 8) });
            const y = (Date.now() / 12) % (H + 80) - 40; x.fillStyle = 'rgba(69,65,56,.07)'; x.fillRect(0, y, W, 2);
            requestAnimationFrame(f)
        })()
    })();
    play(0);
})();