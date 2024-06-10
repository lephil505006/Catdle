const cats = [
  {
    name: "Thunder Jack",
    img: "images/ThunderJack.webp",
    rarity: "Uber Super Rare",
    form: "True Form",
    source: "Dark Heros",
    role: "Rusher, CC",
    target: "",
    abilities: "",
    cost: "3,150¢",
    version: "v12.2",
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
                <p>Rarity: ${cat.rarity}</p>
                <p>Form: ${cat.form}</p>
                <p>Source: ${cat.source}</p>
                <p>Role: ${cat.role}</p>
                <p>Target: ${cat.target}</p>
                <p>Abilities: ${cat.abilities}</p>
                <p>Cost: ${cat.cost}</p>
                <p>Version: ${cat.version}</p>
            </div>
        `;
    resultsContainer.appendChild(catElement);
  });
}
