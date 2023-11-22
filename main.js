const base_url = `https://api.punkapi.com/v2/`

let beerCache = {}
let pageNum = 1

loadLandingPage()

let loadedbeer

const landingImage = document.querySelector("#landing-image")
const landingName = document.querySelector("#landing-name")
const landingLink = document.querySelector("#landing-link")
const landingButton = document.querySelector("#landing-button")

const searchResult = document.querySelector("#search-result")
const searchBox = document.querySelector("#search-box")
const searchNav = document.querySelector("#search-nav")

const infoPage = document.querySelector("#beer-info-page")

landingLink.addEventListener("click", (e) => loadInfoPage(loadedbeer))
landingButton.addEventListener("click", () => loadLandingPage())

//Next and prev buttons
searchNav.addEventListener("click", (e) => {
  const id = e.target.id

  if (id == "next") {
    pageNum++
    prepareResult("")
  }
  if (id == "prev") {
    pageNum--
    prepareResult("")
  }
})

//Load beer from result list
searchResult.addEventListener("click", (e) => {
  const id = e.target.id
  if (id) {
    loadInfoPage(beerCache[id])
  }
})

//Search as we type in search box
searchBox.addEventListener("input", (e) => {
  e.preventDefault()
  searchByName(e.target.value)
})

async function loadLandingPage() {
  const [beer, ..._] = await getUrl("https://api.punkapi.com/v2/beers/random")
  loadedbeer = beer
  if (beer.image_url) {
    landingImage.src = beer.image_url
  } else {
    landingImage.src = "./img/noimage.png"
  }
  landingName.innerText = beer.name
  // landingLink.dataset.beerid = beer.id

  // loadInfoPage(beer)

  // https://api.punkapi.com/v2/beers/beerid

  // Användaren ska kunna slumpa fram en öl genom att trycka på en knapp exempelvis.
  //
  // Namnet och bilden på den slumpade ölen ska man se i ett “card” (se nedan för exempel).
  //
  // Användaren ska kunna trycka på "See More" för att komma till "Beer Info Page" (Se längre ner för info).
}

function loadSearchPage() {
  //   Search Page
  // Användare ska kunna söka på en öl med hjälp av dess namn.
  // Sidan ska använda sig av ett formulär.
  // Resultatet av sökningen ska visas i en lista (endast namnen på ölen).
  // Listan får innehålla max 10 resultat. Om fler än 10 sökresultat finns ska listan vara paginerad.
  // Klickar man på ett sökresultat ska man komma till Beer Info Page för den ölen.
}

async function searchByName(name) {
  const found = await getUrl(`https://api.punkapi.com/v2/beers?beer_name=${name} `)

  //Resets
  beerCache = {}

  if (found.length > 0) {
    found.forEach((beer) => {
      beerCache[beer.id] = beer
    })
    prepareResult(name)
  }
}

function prepareResult(name) {
  // Gör en array med de 10 vi ska visa

  searchResult.innerHTML = ""
  searchNav.innerHTML = ""

  //Vi gör om objectet där varje key är ölens id-nummer till en array för att kunna slica
  const keysToDisplay = Object.keys(beerCache) //array med det vi ska visa
  if (keysToDisplay.length > 0) {
    const toDisplay = []

    keysToDisplay.map((key) => {
      toDisplay.push(beerCache[key])
    })
    const currentResult = toDisplay.slice(pageNum * 10 - 10, pageNum * 10)

    //Visar array med 10 resultat
    displayResults(currentResult)

    //Visar bottom nav

    if (keysToDisplay.length > 10 && pageNum > 1) {
      const pre = document.createElement("a")
      pre.id = "prev"
      pre.innerText = "Previous"
      pre.href = "#"
      searchNav.append(pre)
    }

    if (keysToDisplay.length > 10 && currentResult.length >= 10) {
      const nxt = document.createElement("a")
      nxt.id = "next"
      nxt.innerText = "Next"
      nxt.href = "#"
      searchNav.append(nxt)
    }
  } else {
    searchResult.innerHTML = `No results for ${name}`
  }
}

function displayResults(results) {
  results.forEach((beer) => {
    const li = document.createElement("li")
    const a = document.createElement("a")

    a.innerText = beer.name
    a.href = "#"
    a.id = beer.id
    li.append(a)
    searchResult.append(li)
  })
}

function loadInfoPage(beer) {
  infoPage.innerHTML = ""
  const h1 = document.createElement("h1")
  h1.innerText = beer.name
  infoPage.append(h1)

  const image = document.createElement("img")
  image.src = beer.image_url || "./img/noimage.png"
  infoPage.append(image)

  const content = `
  <p><span class="category">Description:</span> ${beer.description}</p>
  <p><span class="category">Alcohol (abv):</span> ${beer.abv}%</p>
  <p><span class="category">Food pairing:</span></p>
  ${makeUlfromArray(beer.food_pairing)}
  <h3>Make it your self</h3>
  <p><span class="category">Batch Volume:</span> ${beer.volume.value} ${
    beer.volume.unit
  }</p>
  <p><span class="category">Ingredients:</span></p>
  <p><span class="category">Malt:</span></p>
  <ul>
  ${makeIngredients(beer.ingredients.malt)}
  </ul>
  <p><span class="category">Hops:</span></p>
  <ul>
  ${makeIngredients(beer.ingredients.hops)}
  </ul>
  <p><span class="category">Yeast:</span>${beer.ingredients.yeast}</p>
  <p><span class="category">Brewers tips:</span>${beer.brewers_tips}</p>
  `

  infoPage.innerHTML += content

  function makeIngredients(ingredients) {
    let result = ""
    ingredients.forEach((ingredient) => {
      result += `<li>${ingredient.amount.value} ${ingredient.amount.unit} ${ingredient.name}</li>`
    })
    return result
  }

  function makeUlfromArray(array) {
    let result = "<ul>"
    array.forEach((item) => {
      result += `<li>${item}</li>`
    })
    return (result += "</ul>")
  }

  /* 
  Denna sida ska bara gå att vi någon av de sidorna som beskrivs ovan.
På denna sida ska användaren kunna få detaljerad information om en specifik öl.
Sidan ska minst innehålla:
- Description
- Image
- Alcohol by volume
- Volume
- Ingredients
- Hops
- Food pairing
- Brewers tips */
}

/* - Användare ska kunna söka på en öl med hjälp av dess namn.
- Sidan ska använda sig av ett formulär.
- Resultatet av sökningen ska visas i en lista (endast namnen på ölen).
- Listan får innehålla max 10 resultat. Om fler än 10 sökresultat finns ska listan vara paginerad.
- Klickar man på ett sökresultat ska man komma till Beer Info Page för den ölen. */

async function getUrl(url) {
  try {
    console.log("Trying ", url)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Error in fetching ${response.status}`)
    const jsObject = await response.json()
    return jsObject
  } catch (error) {
    console.log(error)
  }
}
