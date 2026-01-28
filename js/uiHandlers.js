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
      const isHintRevealed = window.getComputedStyle(this.hintRevealBox).display !== 'none';

      if (this.game.hintAvailable && !isHintRevealed) {
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
    const hintText = this.hintBox.querySelector(".hint-text");

    if (!hintText) return;

    if (this.game.hintAvailable) {
      hintText.textContent = "Click for hint!";
      this.hintBox.style.cursor = "pointer";
    } else {
      const attemptsLeft = 5 - this.game.attempts;
      hintText.textContent = `Hint appears after ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'}`;
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

    // Find all cats matching
    const matchingCats = this.game.getAllCats().filter(cat =>
      cat.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
    );

    // Get all related cats (same unitId)
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
    if (this.headers && this.headers.style.display === "none") {
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

  displayYesterdaysAnswer() {
    const yesterdayNameElement = document.getElementById('yesterday-cat-name');
    const yesterdayImgElement = document.getElementById('yesterday-cat-img');

    if (yesterdayNameElement && yesterdayImgElement) {
      const yesterdaysCat = this.game.getYesterdaysAnswer();

      if (yesterdaysCat) {
        yesterdayNameElement.textContent = yesterdaysCat.name;
        yesterdayImgElement.src = yesterdaysCat.img;
        yesterdayImgElement.alt = yesterdaysCat.name;
      } else {
        // Fallback
        yesterdayNameElement.textContent = 'Cat';
        yesterdayImgElement.src = 'images/cats/Cat.webp';
        yesterdayImgElement.alt = 'Cat';
      }
    }
  }

  displayVictoryScreen(cat) {
    const victoryScreen = document.getElementById('victory-screen');
    const victoryCatImg = document.getElementById('victory-cat-img');
    const victoryCatName = document.getElementById('victory-cat-name');
    const victoryGuessCount = document.getElementById('victory-guess-count');
    const catUnitLabel = document.querySelector('.cat-unit-label');

    if (victoryCatImg) victoryCatImg.src = cat.img;
    if (victoryCatImg) victoryCatImg.alt = cat.name;
    if (victoryCatName) victoryCatName.textContent = cat.name;
    if (victoryGuessCount) victoryGuessCount.textContent = this.game.attempts;

    const timerRow = document.querySelector('.victory-timer-row');
    if (timerRow) {
      if (this.game.isInfiniteMode()) {
        timerRow.style.display = 'none';
      } else {
        timerRow.style.display = 'flex';
        this.startCountdownTimer();
      }
    }

    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
      if (this.game.isInfiniteMode()) {
        playAgainButton.style.display = 'block';
        playAgainButton.onclick = () => {
          this.startNewInfiniteGame();
          victoryScreen.classList.remove('active');
        };
      } else {
        playAgainButton.style.display = 'none';
      }
    }

    if (catUnitLabel) {
      catUnitLabel.textContent = this.game.isInfiniteMode()
        ? "Correct Cat Unit!"
        : "Cat Unit of the Day";
    }

    victoryScreen.classList.add('active');
    this.setupVictoryScreenListeners();
  }

  startNewInfiniteGame() {
    this.clearGameDisplay();
    this.game.startNewInfiniteGame();
    this.resetHintDisplay();
    this.announceToScreenReader('New infinite game started!');
  }

  clearGameDisplay() {
    const catDetails = document.querySelectorAll('.cat-details-element');
    catDetails.forEach(element => element.remove());

    if (this.headers) {
      this.headers.style.display = 'none';
    }

    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = '';
      this.resultsContainer.style.display = 'none';
    }

    if (this.searchBar) {
      this.searchBar.value = '';
    }
    this.resetHintDisplay();
  }

  resetHintDisplay() {
    if (this.hintRevealBox) {
      this.hintRevealBox.style.display = 'none';
      this.hintDisplay.textContent = '';
    }

    this.updateHintDisplay();

    if (this.hintBox) {
      this.hintBox.style.cursor = this.game.hintAvailable ? 'pointer' : 'default';
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  setupVictoryScreenListeners() {
    const victoryScreen = document.getElementById('victory-screen');
    const victoryContent = victoryScreen.querySelector('.victory-content');

    victoryScreen.addEventListener('click', (e) => {
      if (!victoryContent.contains(e.target)) {
        if (this.game.isInfiniteMode()) {
          this.startNewInfiniteGame();
        } else {
          this.stopCountdownTimer();
        }
        victoryScreen.classList.remove('active');
      }
    });
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

    const timeUntilReset = this.game.dailyLogic.getTimeUntilNextReset();
    timerElement.textContent = timeUntilReset;
  }
}