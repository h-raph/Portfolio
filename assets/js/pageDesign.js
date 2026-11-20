const calme = matchMedia('(prefers-reduced-motion:reduce)').matches;
if (!calme) document.documentElement.classList.add('pret');
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
const io = new IntersectionObserver(l => l.forEach(x => { if (x.isIntersecting) { x.target.classList.add('vu'); io.unobserve(x.target) } }), { threshold: .8 });
document.querySelectorAll('.trait').forEach(h => io.observe(h));
document.querySelectorAll('.btn:not(.btn-lien):not(.btn-enso):not([disabled]),.tag').forEach(b => {
    b.insertAdjacentHTML('afterbegin', '<i class="peint"></i>'); b.addEventListener('pointerenter', () => {
        b.querySelector('.peint').style.transform = `scaleX(${Math.random() < .5 ? 1 : -1})`;
    });
});
if (!calme) {
    const cv = document.createElement('canvas'); cv.id = 'pinceau'; document.body.appendChild(cv);
    const cx = cv.getContext('2d'); let W, H;
    const size = () => { const r = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; cx.setTransform(r, 0, 0, r, 0, 0) };
    size(); addEventListener('resize', size);
    const col = getComputedStyle(document.documentElement).getPropertyValue('--encre').trim() || '#22262b';
    let last = null, mid = null, lw = 6, run = false, idle = 0;
    const frame = () => { cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.07)'; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = 'source-over'; if (++idle < 110) requestAnimationFrame(frame); else { run = false; last = mid = null; cx.clearRect(0, 0, W, H) } };
    addEventListener('pointermove', e => { const p = { x: e.clientX, y: e.clientY }; if (last) { const d = Math.hypot(p.x - last.x, p.y - last.y); lw += (Math.max(3, 18 - d * .3) - lw) * .2; const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 }; cx.strokeStyle = col; cx.lineWidth = lw; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo((mid || last).x, (mid || last).y); cx.quadraticCurveTo(last.x, last.y, m.x, m.y); cx.stroke(); mid = m } last = p; idle = 0; if (!run) { run = true; requestAnimationFrame(frame) } });
}
const t = document.getElementById('toast');
document.getElementById('save').addEventListener('click', () => { t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800) });

// menu de navigation
(() => {
    const b = document.querySelector('.burger'), m = document.getElementById('menu');
    const fermer = () => { b.setAttribute('aria-expanded', 'false'); m.classList.remove('ouvert') };
    b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); m.classList.toggle('ouvert', o) });
    m.addEventListener('click', e => { if (e.target.closest('a')) fermer() });
    addEventListener('keydown', e => { if (e.key === 'Escape') fermer() });
    const liens = [...m.querySelectorAll('a')];
    const so = new IntersectionObserver(l => l.forEach(x => { if (x.isIntersecting) liens.forEach(a => a.setAttribute('aria-current', a.hash === '#' + x.target.id)) }), { rootMargin: '-25% 0px -65% 0px' });
    document.querySelectorAll('h2[id]').forEach(h => so.observe(h));
})();
