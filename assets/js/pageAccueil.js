// =================HEADER=================
const body = document.getElementById("body")

const header = document.createElement("header")
const titre = document.createElement('h1')

titre.classList.add('titre')

titre.textContent = "Mon portfolio"

header.append(titre)
body.appendChild(header)

// =================LIENS=================
const main = document.createElement('main')
const liste = document.createElement('li')
const navLiens1 = document.createElement('ul')
const navLiens2 = document.createElement('ul')
const liens1 = document.createElement('a')
const liens2 = document.createElement('a')

liens1.setAttribute('href', './pages/pageWebDev.html')

liens2.setAttribute('href', './pages/pageDesign.html')

liste.classList.add('menu')

liens1.textContent = 'Projets WEB/Développement'
liens2.textContent = 'Projets DESIGN'

navLiens1.appendChild(liens1)
navLiens2.appendChild(liens2)
liste.append(navLiens1, navLiens2)
main.append(liste)
body.append(main)