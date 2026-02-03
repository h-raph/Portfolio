const projets = [
    {
        nom: 'Star Wars',
        class: 'star-wars',
        github: 'https://github.com/h-raph/star-wars-trilogie.git',
        site: 'https://star-wars-trilogie.vercel.app/',
        image: '../assets/images/Star-wars.png',
        langage: 'HTML & CSS',
    },
    {
        nom: 'Collectif Rainbow Photo',
        class: 'collectif-rainbow-photo',
        github: 'https://github.com/h-raph/Collectif-Rainbow-Photo.git',
        site: 'https://collectif-rainbow-photo.vercel.app/',
        image: '../assets/images/Rainbow.png',
        langage: 'HTML & CSS',
    },
    {
        nom: 'Site mariage',
        class: 'site-mariage',
        github: 'https://github.com/h-raph/Site-mariage.git',
        site: 'https://site-mariage-six.vercel.app/',
        image: '../assets/images/Mariage.png',
        langage: 'HTML & CSS',
    },
    {
        nom: 'Bibliothèque',
        class: 'bibliotheque',
        github: 'https://github.com/h-raph/Bibliotheque',
        site: 'https://bibliotheque-peach.vercel.app/',
        image : '../assets/images/Bibliotheque.png',
        langage: 'HTML, CSS & JS',
    }
]

// =================HEADER=================
const body = document.getElementById("body")

const header = document.createElement("header")
const titre = document.createElement('h1')
const losan = document.createElement('div')

titre.classList.add('titre')
losan.classList.add('losange')

titre.textContent = "Mes projets"

header.append(losan, titre)
body.appendChild(header)

// =================SECTION=================
const section = document.createElement("section")

section.setAttribute("id", "projets")

body.append(section)

// =================PROJETS=================
for (let i = 0; i < projets.length; i++) {
    const cardsProjets = document.createElement('div')
    const boutonDiv = document.createElement('div')
    const imageProjets = document.createElement('img')
    const nomProjets = document.createElement('h2')
    const langage = document.createElement('h3')
    const boutonGitHub = document.createElement('button')
    const boutonSite = document.createElement('button')
    
    cardsProjets.classList.add(`cards`, "projets-" + projets[i].class)
    boutonGitHub.classList.add('github')
    boutonGitHub.classList.add('btn')
    boutonSite.classList.add('site')
    boutonSite.classList.add('btn')
    boutonDiv.classList.add('bouton-git-site')

    imageProjets.src = projets[i].image
    imageProjets.setAttribute('alt', projets[i].nom)

    boutonGitHub.setAttribute('onclick', `window.open('${projets[i].github}')`)
    boutonSite.setAttribute('onclick', `window.open('${projets[i].site}')`)

    langage.textContent = projets[i].langage
    nomProjets.textContent = projets[i].nom

    boutonGitHub.append('GitHub')
    boutonSite.append('Voir la page')
    boutonDiv.append(boutonSite, boutonGitHub)
    cardsProjets.append(imageProjets, nomProjets, langage, boutonDiv)

    section.append(cardsProjets)
}