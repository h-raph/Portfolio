const debut = performance.now();
const dureeMin = 800; // en millisecondes

function masquerLoader() {
    const loader = document.querySelector('.loading-ecran');
    if (loader) loader.classList.add('is-hidden');
}

window.addEventListener('load', () => {
    const ecoule = performance.now() - debut;
    console.log('temps écoulé :' + ecoule);
    const reste = Math.max(0, dureeMin - ecoule);
    console.log(reste);
    setTimeout(masquerLoader, reste);
});