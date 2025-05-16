export class UIHandlers {
  constructor(gameLogic) {
    this.game = gameLogic;
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.searchBar = document.getElementById("search-bar");
    this.resultsContainer = document.getElementById("results-container");
    this.catDetailsContainer = document.getElementById("cat-details-container");
    this.headers = document.getElementById("headers");
    this.hintDisplay = document.getElementById("hint-display");
  }

  setupEventListeners() {
    this.searchBar.addEventListener("input", () => this.searchCats());
    document.getElementById("search-button")
      .addEventListener("click", () => this.searchCats());
    
    const searchBarOuter = document.querySelector(".search-bar-outer");
    if (searchBarOuter && this.resultsContainer) {
      this.resultsContainer.style.width = `${searchBarOuter.offsetWidth}px`;
    }
  }

  searchCats() {
    const query = this.searchBar.value.toLowerCase();
    this.resultsContainer.innerHTML = "";

    if (query !== "") {
      const filteredCats = this.game.getAllCats().filter((cat) =>
        cat.name.toLowerCase().includes(query)
      );

      const allRelatedCats = [];
      filteredCats.forEach((cat) => {
        allRelatedCats.push(...this.game.getAllCats().filter((c) => c.unitId === cat.unitId));
      });

      const uniqueCats = Array.from(
        new Set(allRelatedCats.map((a) => a.name))
      ).map((name) => {
        return allRelatedCats.find((a) => a.name === name);
      });

      const validCats = uniqueCats.filter(
        (cat) => !this.game.getSelectedCats().includes(cat.name)
      );

      if (validCats.length > 0) {
        this.resultsContainer.style.display = "block";
        validCats.forEach((cat, index) => {
          const catElement = document.createElement("div");
          catElement.classList.add("cat-result");
          catElement.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}" class="search-cat-img">
            <div class="cat-details">
                <p><strong>${cat.name}</strong></p>
            </div>
          `;
          catElement.addEventListener("click", () => {
            this.handleCatSelection(cat);
          });
          this.resultsContainer.appendChild(catElement);

          if (index === 0) {
            document.getElementById("search-button").onclick = () => {
              this.handleCatSelection(cat);
            };
          }
        });
      } else {
        // Display "No Cat Found" message
        const noCatElement = document.createElement("div");
        noCatElement.classList.add("cat-result");
        noCatElement.style.textAlign = "center";
        noCatElement.style.color = "#000";
        noCatElement.style.pointerEvents = "none";
        noCatElement.innerHTML = "<p><strong>No Cat Found</strong></p>";
        this.resultsContainer.appendChild(noCatElement);
        this.resultsContainer.style.display = "block";
        document.getElementById("search-button").onclick = null;
      }
    } else {
      this.resultsContainer.style.display = "none";
      this.searchBar.placeholder = "Enter cat name...";
      document.getElementById("search-button").onclick = null;
    }
  }

  handleCatSelection(cat) {
    if (!this.game.getSelectedCats().includes(cat.name)) {
      const isCorrect = this.game.checkGuess(cat);
      this.displayCatDetails(cat);
      if (isCorrect) {
        this.displayGoodJobMessage();
      }
    }
    this.resultsContainer.innerHTML = "";
    this.searchBar.value = "";
    this.resultsContainer.style.display = "none";
  }

  displayCatDetails(cat) {
    if (this.headers.style.display === "none") {
      this.headers.style.display = "flex";
    }

    const catDetailsElement = document.createElement("div");
    catDetailsElement.classList.add("cat-details-element");

    const colors = this.game.compareCategories(cat, this.game.getAnswer());
    const categories = [
      "img",
      "rarity",
      "form",
      "role",
      "traits",
      "attackType",
      "abilities",
      "cost",
      "version",
    ];

    const detailsHTML = categories
      .map((category, index) => {
        let colorClass = "white-box";
        if (index > 0) {
          colorClass = colors[index - 1];
        }
        
        if (category === "img") {
          return `<div class="cat-img-container">
              <img src="${cat[category]}" alt="${cat.name}" class="cat-img">
          </div>`;
        } 
        else if (category === "traits") {
          const traits = cat[category].split(" ");
          const traitCount = traits.length;
          const manyTraitsClass = traitCount >= 10 ? "many-traits" : "";
          
          const images = traits.map((value) => {
            const imagePath = value === "X" 
              ? `images/${category}/x.png`
              : `images/${category}/${value.toLowerCase()}.webp`;
            return `<img src="${imagePath}" alt="${value}" class="trait-icon">`;
          }).join(" ");
          
          return `<div class="cat-detail ${colorClass} ${manyTraitsClass}" 
                  data-category="${category}" data-trait-count="${traitCount}">
              <div class="traits-container">${images}</div>
          </div>`;
        } 
        else if (category === "attackType") {
          const attackTypes = cat[category].split(" ");
          const images = attackTypes.map((type) => {
            const imagePath = `images/attackType/${type.toLowerCase()}.webp`;
            return `<img src="${imagePath}" alt="${type}" class="attack-type-icon">`;
          }).join(" ");
          
          return `<div class="cat-detail ${colorClass}">
              <div class="attack-type-container">${images}</div>
          </div>`;
        } 
        else if (category === "abilities") {
          const abilities = cat[category].split(" ");
          const abilityCount = abilities.length;
          const manyAbilitiesClass = abilityCount >= 6 ? "many-abilities" : "";
          
          const images = abilities.map((value) => {
            const imagePath = value === "X" 
              ? `images/${category}/x.png`
              : `images/${category}/${value.toLowerCase()}.webp`;
            return `<img src="${imagePath}" alt="${value}" class="ability-icon">`;
          }).join(" ");
          
          return `<div class="cat-detail ${colorClass} ${manyAbilitiesClass}" 
                  data-category="${category}" data-ability-count="${abilityCount}">
              <div class="abilities-container">${images}</div>
          </div>`;
        } 
        else {
          return `<div class="cat-detail ${colorClass}">
              <p>${cat[category]} ${
                category === "cost"
                  ? '<span class="indicator ' + 
                    (typeof colors[index - 1] === 'string' ? colors[index - 1].split(" ")[1] : '') + 
                    '"></span>'
                  : ""
              }</p>
          </div>`;
        }
      })
      .join("");

    catDetailsElement.innerHTML = detailsHTML;

    if (this.catDetailsContainer.children.length === 0) {
      this.catDetailsContainer.appendChild(this.headers);
    }
    this.catDetailsContainer.insertBefore(
      catDetailsElement,
      this.catDetailsContainer.children[1]
    );
  }

  displayGoodJobMessage() {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("good-job-message");
    messageContainer.innerHTML = "<p>Good job! You guessed correctly!</p>";
    document.body.appendChild(messageContainer);

    setTimeout(() => {
      messageContainer.remove();
    }, 3000);
  }
}