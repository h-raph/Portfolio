const projets = [
    {
        nom: 'Star Wars',
        class: 'star-wars',
        github: 'https://github.com/h-raph/star-wars-trilogie.git',
        site: 'https://star-wars-trilogie.vercel.app/',
        image: '../assets/images/Star-wars.png',
        langage: 'HTML & CSS',
        description: 'Je devais choisir les bons sélecteurs en CSS pour styliser la page',
    },
    {
        nom: 'Collectif Rainbow Photo',
        class: 'collectif-rainbow-photo',
        github: 'https://github.com/h-raph/Collectif-Rainbow-Photo.git',
        site: 'https://collectif-rainbow-photo.vercel.app/',
        image: '../assets/images/Rainbow.png',
        langage: 'HTML & CSS',
        description: 'Je devais reproduire le style d\'un modèle que le prof nous avez donnée',
    },
    {
        nom: 'Site mariage',
        class: 'site-mariage',
        github: 'https://github.com/h-raph/Site-mariage.git',
        site: 'https://site-mariage-six.vercel.app/',
        image: '../assets/images/Mariage.png',
        langage: 'HTML & CSS',
        description: '',
    },
    {
        nom: 'Bibliothèque',
        class: 'bibliotheque',
        github: 'https://github.com/h-raph/Bibliotheque',
        site: 'https://bibliotheque-peach.vercel.app/',
        image : '../assets/images/Bibliotheque.png',
        langage: 'HTML, CSS & JS',
        description: '',
    },
    {
        nom: 'Street-Fusion',
        class: 'street-fusion',
        github: '',
        site: '',
        image: '',
        langage: 'HTML, CSS & JS',
        description: '',
    }
]

// =================HEADER=================
const body = document.getElementById("body")

const header = document.createElement("header")
const titre = document.createElement('h1')

titre.classList.add('titre')

titre.textContent = "Mes projets"

header.append(titre)
body.appendChild(header)

// =================SECTION=================
const main = document.createElement("main")
const article = document.createElement('article')

main.setAttribute('id', 'main')
article.setAttribute("id", "projets")

main.append(article)
body.append(main)

// =================PROJETS=================
for (let i = 0; i < projets.length; i++) {
    // CREATION DES DIFFERENTES BALISES
    const cardsProjets = document.createElement('section') // section

    const divFront = document.createElement('div') // face avant
    const divBack = document.createElement('div') // face arrière
    const shadow = document.createElement('div') // ombre des cartes

    const boutonDiv = document.createElement('div')
    const imageProjets = document.createElement('img')
    const nomProjets = document.createElement('h2')
    const langage = document.createElement('h3')
    const boutonGitHub = document.createElement('button')
    const boutonSite = document.createElement('button')

    // AJOUT DE CLASSE
    cardsProjets.classList.add('cards', "projets-" + projets[i].class)

    divFront.classList.add('face', 'front', 'contain-cards')
    divBack.classList.add('face', 'back')
    shadow.classList.add('shadow')

    boutonGitHub.classList.add('github')
    boutonGitHub.classList.add('btn')

    boutonSite.classList.add('site')
    boutonSite.classList.add('btn')

    boutonDiv.classList.add('bouton-git-site')

    // AJOUT D'ATTRIBUT
    cardsProjets.setAttribute('style', '--i:' + i + ';')

    imageProjets.src = projets[i].image
    imageProjets.setAttribute('alt', projets[i].nom)

    boutonGitHub.setAttribute('onclick', `window.open('${projets[i].github}')`)
    boutonSite.setAttribute('onclick', `window.open('${projets[i].site}')`)

    // AJOUT DE TEXTE
    langage.textContent = projets[i].langage
    nomProjets.textContent = projets[i].nom

    // AJOUTES LES BALISES AUX BALISES PARENTS
    boutonGitHub.append('GitHub')
    boutonSite.append('Voir la page')
    boutonDiv.append(boutonSite, boutonGitHub)
    divFront.append(imageProjets, nomProjets, langage, boutonDiv)

    cardsProjets.append(divFront, divBack, shadow)

    article.append(cardsProjets)
}

// =================FOOTER=================
const footer = document.createElement('footer')

footer.classList.add('footer')
footer.setAttribute('id', 'footer')

body.append(footer)