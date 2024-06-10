const cats = [
  {
    name: "Thunder Jack",
    img: "images/ThunderJack.webp",
    rarity: "Uber Super Rare",
    form: "Normal Form",
    source: "Dark Heros",
    role: "Rusher, CC",
    target: "Angel, Alien",
    abilities: "Knockback",
    cost: "3,150¢",
    version: "v12.2",
  },
  {
    name: "The Grateful Crane",
    img: "images/TheGratefulCrane.webp",
    rarity: "Uber Super Rare",
    form: "Normal Form",
    source: "Ultra Souls",
    role: "CC",
    target: "Angel",
    abilities: "Knockback",
    cost: "832¢",
    version: "v2.7",
  },
  {
    name: "Thunder God Zeus",
    img: "images/ThunderGodZeus.webp",
    rarity: "Uber Super Rare",
    form: "Normal Form",
    source: "Almighties",
    role: "Backliner",
    target: "Angel",
    abilities: "Resistant",
    cost: "4800¢",
    version: "v4.6",
  },
  {
    name: "Thundia",
    img: "images/Thundia.webp",
    rarity: "Uber Super Rare",
    form: "Normal Form",
    source: "Galaxy Gals",
    role: "Nuker, Backliner",
    target: "Red",
    abilities: "Massive DMG",
    cost: "4410¢",
    version: "v2.1",
  },
];

function searchCats() {
  const searchBar = document.getElementById("search-bar");
  const resultsContainer = document.getElementById("results-container");
  const query = searchBar.value.toLowerCase();

  // Clear previous results
  resultsContainer.innerHTML = "";

  // Filter cats based on the query
  const filteredCats = cats.filter((cat) =>
    cat.name.toLowerCase().includes(query)
  );

  // Display results
  filteredCats.forEach((cat) => {
    const catElement = document.createElement("div");
    catElement.classList.add("cat-result");
    catElement.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}" class="cat-img">
            <div class="cat-details">
                <p><strong>${cat.name}</strong></p>
            </div>
        `;
    catElement.addEventListener("click", () => {
      displayCatDetails(cat);
      resultsContainer.innerHTML = "";
      searchBar.value = "";
    });
    resultsContainer.appendChild(catElement);
  });
}

function displayCatDetails(cat) {
  const catDetailsContainer = document.getElementById("cat-details-container");
  const catDetailsElement = document.createElement("div");
  catDetailsElement.classList.add("cat-details-element");
  catDetailsElement.innerHTML = `
    <div class="cat-detail">
        <img src="${cat.img}" alt="${cat.name}" class="cat-img">
    </div>
    <div class="cat-detail">
        <p>${cat.rarity}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.form}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.source}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.role}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.target}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.abilities}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.cost}</p>
    </div>
    <div class="cat-detail">
        <p>${cat.version}</p>
    </div>
  `;
  catDetailsContainer.appendChild(catDetailsElement);
}
