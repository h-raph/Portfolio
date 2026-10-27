// Script simple pour déclencher des glitches aléatoires sur les textes
const glitchElements = document.querySelectorAll('.glitch-text');

setInterval(() => {
    glitchElements.forEach(el => {
        if (Math.random() > 0.75) { // 25% de chance de glitcher brièvement
            el.classList.add('glitching');
            setTimeout(() => el.classList.remove('glitching'), 150);
        }
    });
}, 2000);