export class UIHandlers {
  constructor(gameLogic) {
    this.game = gameLogic;
    this.initializeElements();
    this.setupEventListeners();
    this.updateHintDisplay();
  }

  initializeElements() {
    this.searchBar = document.getElementById("search-bar");
    this.resultsContainer = document.getElementById("results-container");
    this.catDetailsContainer = document.getElementById("cat-details-container");
    this.headers = document.getElementById("headers");
    this.hintDisplay = document.getElementById("hint-display");
    this.hintBox = document.querySelector(".hint-box");
    this.hintRevealBox = document.querySelector(".hint-reveal-box");
    this.searchButton = document.getElementById("search-button");
    this.updateResultsWidth();
    window.addEventListener('resize', () => this.updateResultsWidth());

    this.infoButton = document.getElementById("info-button");
    this.infoBox = document.getElementById("info-box");
    this.overlay = document.createElement("div");
    this.overlay.className = "overlay";
    document.body.appendChild(this.overlay);
    
    this.updateResultsWidth();
    window.addEventListener('resize', () => this.updateResultsWidth());
  }

  setupEventListeners() {
    this.searchBar.addEventListener("input", () => this.searchCats());
    this.searchButton.addEventListener("click", () => this.handleSearchButtonClick());
    
    this.hintBox.addEventListener("click", () => {
        if (this.game.hintAvailable && !this.hintRevealBox.style.display) {
            const hint = this.game.getHint();
            if (hint) {
                this.hintDisplay.textContent = hint;
                this.hintRevealBox.style.display = "block";
            }
        }
    });
    
    this.infoButton.addEventListener("click", () => this.toggleInfoBox());
    this.overlay.addEventListener("click", () => this.closeInfoBox());
    document.querySelector('.close-info')?.addEventListener('click', () => this.closeInfoBox());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeInfoBox();
    });
  }

  toggleInfoBox() {
    const isExpanded = this.infoButton.getAttribute('aria-expanded') === 'true';
    this.infoButton.setAttribute('aria-expanded', !isExpanded);
    this.infoBox.classList.toggle('active');
    this.overlay.classList.toggle('active');
    
    // Toggle body class to lock scrolling
    document.body.classList.toggle('overlay-open', !isExpanded);
    
    // If opening, scroll info box to top
    if (!isExpanded) {
        this.infoBox.scrollTop = 0;
    }
  }

closeInfoBox() {
    this.infoBox.classList.remove('active');
    this.overlay.classList.remove('active');
    this.infoButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overlay-open');
}

  updateResultsWidth() {
    const searchBar = document.querySelector('.search-bar-outer');
    if (searchBar) {
        this.resultsContainer.style.width = `${searchBar.offsetWidth}px`;
        this.resultsContainer.style.minWidth = `${searchBar.offsetWidth}px`;
    }
  }

  handleSearchButtonClick() {
    const query = this.searchBar.value.toLowerCase();
    if (query === "") return;
    
    const filteredCats = this.game.getAllCats().filter(cat => 
      cat.name.toLowerCase().includes(query)
    );
    
    if (filteredCats.length > 0) {
      const firstValidCat = filteredCats.find(cat => 
        !this.game.getSelectedCats().includes(cat.name)
      );
      
      if (firstValidCat) {
        this.handleCatSelection(firstValidCat);
      }
    }
  }

  updateHintDisplay() {
    const attemptsLeft = 5 - this.game.attempts;
    const hintText = this.hintBox.querySelector(".hint-text");
    
    if (this.game.hintAvailable) {
      hintText.textContent = "Click for hint!";
      this.hintBox.style.cursor = "pointer";
    } else {
      hintText.textContent = `Hint available in ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'}`;
      this.hintBox.style.cursor = "default";
    }
  }

  searchCats() {
    const query = this.searchBar.value.toLowerCase();
    this.resultsContainer.innerHTML = "";

    if (query === "") {
      this.resultsContainer.style.display = "none";
      return;
    }

    // Find all cats matching the search OR sharing unitId with matching cats
    const matchingCats = this.game.getAllCats().filter(cat => 
      cat.name.toLowerCase().includes(query)
    );

    // Get all related cats (same unitId) that haven't been selected yet
    const relatedCats = [];
    matchingCats.forEach(cat => {
      relatedCats.push(...this.game.getAllCats().filter(c => 
        c.unitId === cat.unitId && 
        !this.game.getSelectedCats().includes(c.name)
      ));
    });

    // Remove duplicates by name
    const uniqueCats = [];
    const namesSeen = new Set();
    relatedCats.forEach(cat => {
      if (!namesSeen.has(cat.name)) {
        namesSeen.add(cat.name);
        uniqueCats.push(cat);
      }
    });

    if (uniqueCats.length > 0) {
      this.resultsContainer.style.display = "block";
      uniqueCats.forEach(cat => {
        const catElement = document.createElement("div");
        catElement.classList.add("cat-result");
        catElement.innerHTML = `
          <img src="${cat.img}" alt="${cat.name}" class="search-cat-img">
          <div class="cat-details">
            <p><strong>${cat.name}</strong></p>
          </div>
        `;
        catElement.addEventListener("click", () => this.handleCatSelection(cat));
        this.resultsContainer.appendChild(catElement);
      });
    } else {
      const noCatElement = document.createElement("div");
      noCatElement.classList.add("cat-result");
      noCatElement.style.textAlign = "center";
      noCatElement.style.color = "#000";
      noCatElement.style.pointerEvents = "none";
      noCatElement.innerHTML = "<p><strong>No Cat Found</strong></p>";
      this.resultsContainer.appendChild(noCatElement);
      this.resultsContainer.style.display = "block";
    }
  }

  handleCatSelection(cat) {
    if (this.game.getSelectedCats().includes(cat.name)) return;
    
    const isCorrect = this.game.checkGuess(cat);
    this.displayCatDetails(cat);
    this.updateHintDisplay();
    
    // Clear search and results
    this.searchBar.value = "";
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.style.display = "none";
    
    if (isCorrect) {
      this.displayGoodJobMessage();
    }
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