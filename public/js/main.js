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
    catElement.addEventListener("click", () => displayCatDetails(cat));
    resultsContainer.appendChild(catElement);
  });
}

function displayCatDetails(cat) {
  const catDetailsContainer = document.getElementById("cat-details-container");
  catDetailsContainer.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; padding: 10px;">
        <div style="flex: 1; margin: 10px;">
            <h2>${cat.name}</h2>
            <img src="${cat.img}" alt="${cat.name}" class="cat-img" style="width: 100px; height: 100px;">
        </div>
        <div style="flex: 1; margin: 10px;">
            <p><strong>Rarity:</strong> ${cat.rarity}</p>
            <p><strong>Form:</strong> ${cat.form}</p>
            <p><strong>Source:</strong> ${cat.source}</p>
            <p><strong>Role:</strong> ${cat.role}</p>
            <p><strong>Target:</strong> ${cat.target}</p>
            <p><strong>Abilities:</strong> ${cat.abilities}</p>
            <p><strong>Cost:</strong> ${cat.cost}</p>
            <p><strong>Version:</strong> ${cat.version}</p>
        </div>
    </div>
  `;
}
