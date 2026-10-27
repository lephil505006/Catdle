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
    this.infiniteControls = document.querySelector('.infinite-controls');
    this.dailyResultsContainer = document.querySelector('.daily-results-container');
    this.dailyResultsButton = document.getElementById('daily-results-button');
    this.infiniteRestartButton = document.getElementById('infinite-restart-button');
    this.shareButton = document.getElementById('share-results-button');
    this.restartButtonBox = document.querySelector('.reset-button-box');
    this.restartButton = document.getElementById('reset-button');
    this.customInstructionsBox = document.getElementById('custom-instructions-box');
    this.modeDropdownBtn = document.getElementById('mode-dropdown-btn');
    this.modeDropdownMenu = document.getElementById('mode-dropdown-menu');
    this.modeDropdownText = document.getElementById('mode-dropdown-text');
    this.modeDropdownItems = document.querySelectorAll('.mode-dropdown-item');

    if (this.infiniteRestartButton) {
      this.infiniteRestartButton.addEventListener('click', () => this.handleInfiniteRestart());
    }

    if (this.dailyResultsButton) {
      this.dailyResultsButton.addEventListener('click', () => this.handleDailyResults());
    }

    if (this.shareButton) {
      this.shareButton.addEventListener('click', () => this.shareResults());
    }

    if (this.restartButton) {
      this.restartButton.addEventListener('click', () => this.handleRestart());
    }

    if (this.shareButton) {
      if (this.game.isInfiniteMode()) {
        this.shareButton.style.display = 'none';
      } else {
        this.shareButton.style.display = 'block';
      }
    }

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

    if (this.modeDropdownBtn) {
      this.modeDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleModeDropdown();
      });
    }

    this.modeDropdownItems.forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        this.selectMode(mode);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.closeModeDropdown();
    });
  }

  setupEventListeners() {
    this.searchBar.addEventListener("input", () => this.searchCats());
    this.searchButton.addEventListener("click", () => this.handleSearchButtonClick());
    this.changelogButton.addEventListener("click", () => this.toggleChangelogBox());
    this.aboutButton.addEventListener("click", () => this.toggleAboutBox());

    this.hintBox.addEventListener("click", () => {
      if (this.game.mode === 'custom' && !this.game.isCustomAnswerSet()) {
        this.toggleCustomInstructions();
        return;
      }

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

    this.overlay.addEventListener("click", () => {
      this.closeInfoBox();
      this.closeCustomInstructions();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeInfoBox();
        this.closeCustomInstructions();
      }
    });
  }

  handleModeChange() {
    const mode = this.modeSelect.value;
    const currentMode = this.game.mode;

    if (mode === currentMode) return;

    const path = window.location.pathname;
    if (mode === 'daily') {
      window.location.href = path;
    } else {
      window.location.href = path + '#' + mode;
    }
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

  toggleCustomInstructions() {
    const isActive = this.customInstructionsBox.classList.contains('active');

    if (isActive) {
      this.closeCustomInstructions();
    } else {
      this.customInstructionsBox.classList.add('active');
      this.customInstructionsBox.setAttribute('aria-expanded', 'true');
      this.overlay.classList.add('active');
      document.body.classList.add('overlay-open');
      this.customInstructionsBox.scrollTop = 0;
    }
  }

  closeCustomInstructions() {
    this.customInstructionsBox.classList.remove('active');
    this.customInstructionsBox.setAttribute('aria-expanded', 'false');
    this.overlay.classList.remove('active');
    document.body.classList.remove('overlay-open');
  }

  closeInfoBox() {
    this.infoBox.classList.remove('active');
    this.changelogBox.classList.remove('active');
    this.aboutBox.classList.remove('active');
    this.customInstructionsBox.classList.remove('active');
    this.customInstructionsBox.setAttribute('aria-expanded', 'false');
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
      const cat = filteredCats[0];

      if (this.game.mode === 'custom' && !this.game.isCustomAnswerSet()) {
        this.setCustomAnswer(cat);
        return;
      }

      if (!this.game.getSelectedCats().includes(cat.name)) {
        this.handleCatSelection(cat);
      }
    }
  }

  updateHintDisplay() {
    const hintText = this.hintBox.querySelector(".hint-text");
    if (!hintText) return;

    if (this.game.mode === 'custom' && !this.game.isCustomAnswerSet()) {
      hintText.textContent = "Click me for more instructions!";
      return;
    }

    this.hintBox.style.backgroundColor = "#e6e6e6";
    this.hintBox.style.borderColor = "#000";
    this.hintBox.style.borderStyle = "solid";
    this.hintBox.style.borderWidth = "3px";

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

        catElement.addEventListener("click", () => {
          if (this.game.mode === 'custom') {
            if (!this.game.isCustomAnswerSet()) {
              this.setCustomAnswer(cat);
            } else {
              this.handleCatSelection(cat);
            }
          } else {
            this.handleCatSelection(cat);
          }
        });

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
      if (this.game.isInfiniteMode()) {
        Security.storage.set('infinite_selectedCats', this.game.getSelectedCats());
        Security.storage.set('infinite_attempts', this.game.getAttempts());
        Security.storage.set('infinite_hintAvailable', this.game.hintAvailable);
        Security.storage.set('infinite_currentAnswer', JSON.stringify(this.game.getAnswer()));
      }

      this.showGameRestartUI();
      this.displayVictoryScreen(cat);
    }
  }

  displayCatDetails(cat) {
    if (this.headers && this.headers.style.display === "none") {
      this.headers.style.display = "flex";
    }

    const catDetailsElement = document.createElement("div");
    catDetailsElement.classList.add("cat-details-element");

    const answer = this.game.getAnswer();
    const colors = this.game.compareCategories(cat, this.game.getAnswer());
    const isCatMatch = cat.name === answer.name;

    const categories = [
      "img",
      "rarity",
      "form",
      //"role", TEMP REMOVE
      "traits",
      "attackType",
      "abilities",
      "standingRange",
      "speed",
      "cost",
      "version",
    ];

    const detailsHTML = categories.map((category, index) => {
      let colorClass = "white-box";
      if (index > 0) colorClass = colors[index - 1];

      if (category === "img") {
        colorClass = isCatMatch ? "green-box" : "red-box";
      } else {
        colorClass = colors[index - 1];
      }

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

          return `<div class="cat-img-container ${colorClass}">
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
      const yesterdayNum = this.game.getYesterdayDayNumber();

      if (yesterdaysCat) {
        yesterdayNameElement.textContent = `#${yesterdayNum} ${yesterdaysCat.name}`;
        yesterdayImgElement.src = yesterdaysCat.img;
        yesterdayImgElement.alt = yesterdaysCat.name;
      } else {
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
      if (this.game.isInfiniteMode() || this.game.mode === 'custom') {
        timerRow.style.display = 'none';
      } else {
        timerRow.style.display = 'flex';
        this.startCountdownTimer();
      }
    }

    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
      playAgainButton.style.display = 'none';
    }

    if (catUnitLabel) {
      if (this.game.isInfiniteMode()) {
        catUnitLabel.textContent = "Correct Cat Unit!";
      } else if (this.game.mode === 'custom') {
        catUnitLabel.textContent = "Custom Cat Unit";
      } else {
        const dayNum = this.game.getCurrentDayNumber();
        catUnitLabel.textContent = `Catdle Unit #${dayNum}`;
      }
    }

    victoryScreen.classList.add('active');
    this.setupVictoryScreenListeners();
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
        victoryScreen.classList.remove('active');
        if (!this.game.isInfiniteMode()) {
          this.stopCountdownTimer();
        }
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

  handleInfiniteRestart() {
    this.startNewInfiniteGame();
    this.showGamePlayUI();
  }

  handleDailyResults() {
    const victoryScreen = document.getElementById('victory-screen');
    const victoryCatName = document.getElementById('victory-cat-name');
    const shareButton = document.getElementById('share-results-button');

    if (!victoryCatName || !victoryCatName.textContent) {
      const answer = this.game.getAnswer();
      this.displayVictoryScreen(answer);
    } else {
      if (shareButton && !this.game.isInfiniteMode()) {
        shareButton.style.display = 'block';
      }
      victoryScreen.classList.add('active');
      if (!this.game.isInfiniteMode()) {
        this.startCountdownTimer();
      }
    }
  }

  updateResetButtonUI() {
    if (this.restartButtonBox) {
      this.restartButtonBox.style.display = 'flex';
    }
  }

  handleRestart() {
    if (confirm('Reset the game? This will clear your current progress and start a fresh game.')) {
      Security.storage.remove('selectedCats');
      Security.storage.remove('attempts');
      Security.storage.remove('hintAvailable');
      Security.storage.remove('game_day');
      Security.storage.remove('game_index');
      Security.storage.remove('infinite_selectedCats');
      Security.storage.remove('infinite_attempts');
      Security.storage.remove('infinite_hintAvailable');
      Security.storage.remove('infinite_currentAnswer');
      Security.storage.remove('custom_selectedCats');
      Security.storage.remove('custom_attempts');
      Security.storage.remove('custom_hintAvailable');
      Security.storage.remove('custom_currentAnswer');
      Security.storage.remove('custom_answer_set');

      window.location.reload();
    }
  }

  startNewInfiniteGame() {
    if (!this.game.isInfiniteMode()) return;

    this.clearGameDisplay();
    this.game.resetInfiniteGame();
    this.resetHintDisplay();

    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) victoryScreen.classList.remove('active');

    if (this.catDetailsContainer) {
      const details = this.catDetailsContainer.querySelectorAll('.cat-details-element');
      details.forEach(el => el.remove());
    }

    this.showGamePlayUI();

    if (this.searchBar) {
      this.searchBar.value = '';
    }

    this.announceToScreenReader('New infinite game started!');
  }

  startCustomNewGame() {
    if (this.game.mode !== 'custom') return;

    this.clearGameDisplay();
    this.game.resetCustomGame();
    this.resetHintDisplay();

    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) victoryScreen.classList.remove('active');

    if (this.catDetailsContainer) {
      const details = this.catDetailsContainer.querySelectorAll('.cat-details-element');
      details.forEach(el => el.remove());
    }

    this.showGamePlayUI();

    const instructionElement = document.getElementById('game-instruction');
    if (instructionElement) {
      instructionElement.textContent = "Custom Mode - Select a Unit for the answer!";
    }

    if (this.searchBar) {
      this.searchBar.value = '';
    }
  }

  showGameRestartUI() {
    const searchArea = document.querySelector('.search-area-wrapper');
    if (searchArea) {
      searchArea.style.display = 'none';
    }

    if (this.game.isInfiniteMode()) {
      if (this.infiniteControls) {
        const button = this.infiniteControls.querySelector('#infinite-restart-button');
        if (button) {
          button.innerHTML = 'New Game';
          button.onclick = (e) => {
            e.stopPropagation();
            this.startNewInfiniteGame();
            this.showGamePlayUI();
          };
        }
        this.infiniteControls.style.display = 'flex';
      }
      if (this.dailyResultsContainer) {
        this.dailyResultsContainer.style.display = 'none';
      }
    } else if (this.game.mode === 'custom') {
      if (this.dailyResultsContainer) {
        const button = this.dailyResultsContainer.querySelector('#daily-results-button');
        if (button) {
          button.innerHTML = 'See Results';
          button.onclick = () => {
            this.showVictoryScreenAgain();
          };
        }
        this.dailyResultsContainer.style.display = 'flex';
      }

      if (this.infiniteControls) {
        const button = this.infiniteControls.querySelector('#infinite-restart-button');
        if (button) {
          button.innerHTML = 'New Game';
          button.onclick = (e) => {
            e.stopPropagation();
            this.startCustomNewGame();
            this.showGamePlayUI();
          };
        }
        this.infiniteControls.style.display = 'flex';
      }

      if (this.infiniteControls && this.dailyResultsContainer) {
        this.infiniteControls.style.display = 'flex';
        this.dailyResultsContainer.style.display = 'flex';
        this.infiniteControls.style.width = 'auto';
        this.dailyResultsContainer.style.width = 'auto';
        this.infiniteControls.style.gap = '15px';
        this.dailyResultsContainer.style.gap = '15px';
      }
    } else {
      if (this.dailyResultsContainer) {
        const button = this.dailyResultsContainer.querySelector('#daily-results-button');
        if (button) {
          button.innerHTML = 'See Results';
          button.onclick = () => {
            this.showVictoryScreenAgain();
          };
        }
        this.dailyResultsContainer.style.display = 'flex';
      }
      if (this.infiniteControls) {
        this.infiniteControls.style.display = 'none';
      }
    }
  }

  showGamePlayUI() {
    const searchArea = document.querySelector('.search-area-wrapper');
    if (searchArea) {
      searchArea.style.display = 'flex';
    }

    if (this.infiniteControls) {
      this.infiniteControls.style.display = 'none';
    }
    if (this.dailyResultsContainer) {
      this.dailyResultsContainer.style.display = 'none';
    }
  }

  setCustomAnswer(cat) {
    if (this.game.setCustomAnswer(cat)) {
      this.showToast(`Answer set to: ${cat.name}! 🎯`);

      const instructionElement = document.getElementById('game-instruction');
      if (instructionElement) {
        instructionElement.textContent = `Answer: ${cat.name} - Taking audience guesses!`;
      }

      const searchButton = document.getElementById('search-button');
      if (searchButton) {
        searchButton.textContent = 'Play';
      }

      if (this.hintBox) {
        this.hintBox.style.backgroundColor = "#e6e6e6";
        this.hintBox.style.borderColor = "#000";
        this.hintBox.style.borderStyle = "solid";
        this.hintBox.style.borderWidth = "3px";
      }

      this.updateHintDisplay();
      this.searchBar.value = '';
      this.resultsContainer.innerHTML = '';
      this.resultsContainer.style.display = 'none';
    }
  }

  generateShareText() {
    const answer = this.game.getAnswer();
    const attempts = this.game.attempts;
    const isInfinite = this.game.isInfiniteMode();
    const isCustom = this.game.mode === 'custom';
    const guesses = [...this.game.getSelectedCats()].reverse();
    let grid = '';

    for (let i = 0; i < guesses.length; i++) {
      const guessName = guesses[i];
      const guessCat = this.game.getAllCats().find(c => c.name === guessName);
      if (guessCat) {
        //Get and use the cat answer first
        const isCatMatch = guessCat.name === answer.name;
        const catEmoji = isCatMatch ? '🟩' : '🟥';
        const colors = this.game.compareCategories(guessCat, answer);

        let row = catEmoji;
        for (let j = 0; j < colors.length; j++) {
          const color = colors[j];
          if (color === 'green-box') row += '🟩';
          else if (color === 'yellow-box') row += '🟨';
          else if (color === 'red-box') row += '🟥';
          else if (color === 'single-up') row += '🔼';
          else if (color === 'double-up') row += '⏫';
          else if (color === 'single-down') row += '🔽';
          else if (color === 'double-down') row += '⏬';
          else row += '⬜';
        }
        grid += row + '\n';
      }
    }

    let header = '';
    if (isCustom) {
      header = `Custom Catdle (${attempts} guesses)`;
    } else if (isInfinite) {
      header = `Catdle ∞ (${attempts} guesses)`;
    } else {
      const dayNum = this.game.getCurrentDayNumber ? this.game.getCurrentDayNumber() : '?';
      header = `Catdle #${dayNum} (${attempts} guesses)`;
    }

    return `${header}\n\n${grid}\n\nPlay Catdle: https://catdle.com`;
  }

  shareResults() {
    const self = this;
    const shareText = this.generateShareText();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(function () {
        self.showToast('Results copied to clipboard! 📋');
      }).catch(function () {
        self.fallbackCopyToClipboard(shareText);
      });
    } else {
      this.fallbackCopyToClipboard(shareText);
    }
  }

  fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      this.showToast('Results copied to clipboard! 📋');
    } catch (err) {
      this.showToast('Press Ctrl+C to copy results');
    }

    document.body.removeChild(textarea);
  }

  showToast(message) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  toggleModeDropdown() {
    this.modeDropdownBtn.classList.toggle('open');
    this.modeDropdownMenu.classList.toggle('open');
  }

  closeModeDropdown() {
    this.modeDropdownBtn.classList.remove('open');
    this.modeDropdownMenu.classList.remove('open');
  }

  selectMode(mode) {
    const modeNames = {
      'daily': 'Daily Mode',
      'infinite': 'Endless Mode',
      'custom': 'Custom Mode'
    };

    if (this.modeDropdownText) {
      this.modeDropdownText.textContent = modeNames[mode] || mode;
    }

    this.modeDropdownItems.forEach(item => {
      item.classList.toggle('active', item.dataset.mode === mode);
    });

    this.closeModeDropdown();

    const path = window.location.pathname;
    if (mode === 'daily') {
      window.location.href = path;
    } else {
      window.location.href = path + '#' + mode;
    }
  }

  updateModeDropdown(mode) {
    const modeNames = {
      'daily': 'Daily Mode',
      'infinite': 'Endless Mode',
      'custom': 'Custom Mode'
    };

    if (this.modeDropdownText) {
      this.modeDropdownText.textContent = modeNames[mode] || 'Daily Mode';
    }

    this.modeDropdownItems.forEach(item => {
      item.classList.toggle('active', item.dataset.mode === mode);
    });
  }
}