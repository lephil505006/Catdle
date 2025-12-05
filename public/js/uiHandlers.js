import { Security } from './security.js';

export class UIHandlers {
  constructor(gameLogic) {
    this.game = gameLogic;
    this.initializeElements();
    this.setupEventListeners();
    this.updateHintDisplay();
    this.initializeStorage();
  }

  initializeStorage() {
    ['selectedCats', 'attempts', 'hintAvailable'].forEach(key => {
      if (localStorage.getItem(key) && !localStorage.getItem(Security.storage.prefix + key)) {
        try {
          const value = localStorage.getItem(key);
          Security.storage.set(key.replace('catdle_', ''), JSON.parse(value));
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Storage migration failed:', e);
        }
      }
    });
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

    this.infoButton = document.getElementById("info-button");
    this.infoBox = document.getElementById("info-box");
    this.changelogButton = document.getElementById("changelog-button");
    this.changelogBox = document.getElementById("changelog-box");
    this.aboutButton = document.getElementById("about-button");
    this.aboutBox = document.getElementById("about-box");

    this.overlay = document.createElement("div");
    this.overlay.className = "overlay";
    document.body.appendChild(this.overlay);

    this.updateResultsWidth();
    window.addEventListener('resize', () => this.updateResultsWidth());
  }

  setupEventListeners() {
    this.searchBar.addEventListener("input", () => this.searchCats());
    this.searchButton.addEventListener("click", () => this.handleSearchButtonClick());
    this.changelogButton.addEventListener("click", () => this.toggleChangelogBox());
    this.aboutButton.addEventListener("click", () => this.toggleAboutBox());

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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeInfoBox();
    });
  }

  toggleInfoBox() {
    const isExpanded = this.infoButton.getAttribute('aria-expanded') === 'true';
    this.infoButton.setAttribute('aria-expanded', !isExpanded);
    this.infoBox.classList.toggle('active');
    this.overlay.classList.toggle('active');

    document.body.classList.toggle('overlay-open', !isExpanded);

    if (!isExpanded) {
      this.infoBox.scrollTop = 0;
    }
  }

  toggleChangelogBox() {
    const isExpanded = this.changelogButton.getAttribute('aria-expanded') === 'true';
    this.changelogButton.setAttribute('aria-expanded', !isExpanded);
    this.changelogBox.classList.toggle('active');
    this.overlay.classList.toggle('active');

    document.body.classList.toggle('overlay-open', !isExpanded);

    if (!isExpanded) {
      this.changelogBox.scrollTop = 0;
    }
  }

  toggleAboutBox() {
    const isExpanded = this.aboutButton.getAttribute('aria-expanded') === 'true';
    this.aboutButton.setAttribute('aria-expanded', !isExpanded);
    this.aboutBox.classList.toggle('active');
    this.overlay.classList.toggle('active');

    document.body.classList.toggle('overlay-open', !isExpanded);

    if (!isExpanded) {
      this.aboutBox.scrollTop = 0;
    }
  }

  closeInfoBox() {
    this.infoBox.classList.remove('active');
    this.changelogBox.classList.remove('active');
    this.aboutBox.classList.remove('active');
    this.overlay.classList.remove('active');
    this.infoButton.setAttribute('aria-expanded', 'false');
    this.changelogButton.setAttribute('aria-expanded', 'false');
    this.aboutButton.setAttribute('aria-expanded', 'false');
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
    const query = this.searchBar.value;
    const sanitizedQuery = Security.sanitizeInput(query, 50);
    
    if (sanitizedQuery === "") return;

    const filteredCats = this.game.getAllCats().filter(cat =>
      cat.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
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
    const query = this.searchBar.value;
    const sanitizedQuery = Security.sanitizeInput(query, 50);
    
    this.resultsContainer.innerHTML = "";

    if (sanitizedQuery === "") {
      this.resultsContainer.style.display = "none";
      return;
    }

    // Find all cats matching the search OR sharing unitId with matching cats
    const matchingCats = this.game.getAllCats().filter(cat =>
      cat.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
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
        
        // Escape cat name for display
        const escapedName = Security.escapeHTML(cat.name);
        
        catElement.innerHTML = `
          <img src="${Security.escapeHTML(cat.img)}" alt="${escapedName}" class="search-cat-img">
          <div class="cat-details">
            <p><strong>${escapedName}</strong></p>
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

    this.searchBar.value = "";
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.style.display = "none";

    if (isCorrect) {
      this.displayVictoryScreen(cat);
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

const detailsHTML = categories.map((category, index) => {
      let colorClass = "white-box";
      if (index > 0) colorClass = colors[index - 1];

      const getSafeSplit = (value) => {
        if (!value || typeof value !== 'string') return ['X'];
        const sanitized = Security.sanitizeInput(value);
        return sanitized.split(" ");
      };

      switch (category) {
        case "img":
          // Validate image URL is safe
          const safeImg = cat.img.startsWith('images/') || cat.img.startsWith('data:') 
            ? cat.img 
            : 'images/cats/unknown.webp';
          
          return `<div class="cat-img-container">
                <img src="${Security.escapeHTML(safeImg)}" alt="${Security.escapeHTML(cat.name)}" class="cat-img">
              </div>`;

        case "traits":
          const traits = getSafeSplit(cat[category]);
          const traitCount = traits.length;
          return `<div class="cat-detail ${Security.escapeHTML(colorClass)}" data-trait-count="${traitCount}">
                <div class="traits-container">
                  ${traits.map(value => {
                    const safeValue = Security.sanitizeInput(value);
                    return `<img src="images/traits/${safeValue === 'X' ? 'x.png' : safeValue.toLowerCase() + '.webp'}" 
                         alt="${Security.escapeHTML(value)}" class="trait-icon">
                  `}).join("")}
                </div>
              </div>`;

        case "attackType":
          const attackTypes = getSafeSplit(cat[category]);
          const attackCount = attackTypes.length;
          return `<div class="cat-detail ${Security.escapeHTML(colorClass)}" data-trait-count="${attackCount}">
                <div class="attack-type-container">
                  ${attackTypes.map(type => {
                    const sanitizedType = Security.sanitizeInput(type);
                    const typeKey = sanitizedType.toLowerCase().replace(/\s+/g, '');
                    const validTypes = ['singleattack', 'areaattack', 'multihit', 'omnistrike', 'longdistance'];
                    const safeType = validTypes.includes(typeKey) ? typeKey : 'x';
                    return `<img src="images/attackType/${safeType}.webp" 
                                alt="${Security.escapeHTML(type)}" class="attack-type-icon">`;
                  }).join("")}
                </div>
              </div>`;

        case "abilities":
          const abilities = getSafeSplit(cat[category]);
          const abilityCount = abilities.length;
          return `<div class="cat-detail ${Security.escapeHTML(colorClass)}" data-trait-count="${abilityCount}">
                <div class="abilities-container">
                  ${abilities.map(value => {
                    const safeValue = Security.sanitizeInput(value);
                    return `<img src="images/abilities/${safeValue === 'X' ? 'x.png' : safeValue.toLowerCase() + '.webp'}" 
                         alt="${Security.escapeHTML(value)}" class="ability-icon">
                  `}).join("")}
                </div>
              </div>`;

        default:
          const displayValue = cat[category] ? Security.escapeHTML(cat[category]) : 'N/A';
          return `<div class="cat-detail ${Security.escapeHTML(colorClass)}">
                <p>${displayValue}</p>
              </div>`;
      }
    }).join("");

    catDetailsElement.innerHTML = detailsHTML;

    if (this.catDetailsContainer.children.length === 0) {
      this.catDetailsContainer.appendChild(this.headers);
    }
    this.catDetailsContainer.insertBefore(
      catDetailsElement,
      this.catDetailsContainer.children[1]
    );
  }

  displayVictoryScreen(cat) {
    const victoryScreen = document.getElementById('victory-screen');
    const victoryCatImg = document.getElementById('victory-cat-img');
    const victoryCatName = document.getElementById('victory-cat-name');
    const victoryGuessCount = document.getElementById('victory-guess-count');

    if (victoryCatImg) victoryCatImg.src = cat.img;
    if (victoryCatImg) victoryCatImg.alt = cat.name;
    if (victoryCatName) victoryCatName.textContent = cat.name;
    if (victoryGuessCount) victoryGuessCount.textContent = this.game.attempts;

    victoryScreen.classList.add('active');

    this.startCountdownTimer();
    this.setupVictoryScreenListeners();
  }

  setupVictoryScreenListeners() {
    const victoryScreen = document.getElementById('victory-screen');

    victoryScreen.addEventListener('click', (e) => {
      if (e.target === victoryScreen) {
        this.stopCountdownTimer();
        victoryScreen.classList.remove('active');
      }
    });
  }

  displayYesterdaysAnswer() {
    const yesterdayNameElement = document.getElementById('yesterday-cat-name');
    const yesterdayImgElement = document.getElementById('yesterday-cat-img');

    if (yesterdayNameElement && yesterdayImgElement) {
      const yesterdaysCat = this.game.getYesterdaysAnswer();

      yesterdayNameElement.textContent = yesterdaysCat.name;
      yesterdayImgElement.src = yesterdaysCat.img;
      yesterdayImgElement.alt = yesterdaysCat.name;
    }
  }

  startCountdownTimer() {
    const timerElement = document.getElementById('victory-timer');
    if (!timerElement) return;

    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);
  }

  stopCountdownTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById('victory-timer');
    if (!timerElement) return;

    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();

    const resetUTC = 17;

    let secondsUntilReset;
    if (utcHours < resetUTC) {
      secondsUntilReset = (resetUTC - utcHours) * 3600 - utcMinutes * 60 - utcSeconds;
    } else {
      secondsUntilReset = (24 - utcHours + resetUTC) * 3600 - utcMinutes * 60 - utcSeconds;
    }

    if (secondsUntilReset <= 5) {
      setTimeout(() => {
        Security.storage.clearAll();
        location.reload();
      }, 1000);
      timerElement.textContent = "00:00:00";
      return;
    }

    const hours = Math.floor(secondsUntilReset / 3600);
    const minutes = Math.floor((secondsUntilReset % 3600) / 60);
    const seconds = secondsUntilReset % 60;

    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}