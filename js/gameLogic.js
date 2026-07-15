import { DailyLogic } from './dailyLogic.js';
import { Security } from './security.js';

export class GameLogic {
  constructor(catsData, mode = 'daily') {
    this.cats = catsData;
    this.mode = mode;

    if (this.mode === 'infinite') {
      this.initializeInfiniteMode();
    } else {
      this.initializeDailyMode();
    }
  }

  initializeDailyMode() {
    this.dailyLogic = new DailyLogic(this.cats);
    this.currentGameIndex = this.dailyLogic.getDaysSinceLaunch();
    const needsReset = this.checkAndResetForNewDay();
    this.selectedCats = this.loadValidatedState('selectedCats', [], 'daily');
    this.attempts = this.loadValidatedState('attempts', 0, 'daily');
    this.hintAvailable = this.loadValidatedState('hintAvailable', false, 'daily');
    this.answer = this.dailyLogic.getTodaysAnswer();
    this.yesterdaysAnswer = this.dailyLogic.getYesterdaysAnswer();

    Security.storage.set(`answer_${this.currentGameIndex}`, JSON.stringify(this.answer), 365 * 24 * 60 * 60 * 1000);
  }

  initializeInfiniteMode() {
    this.dailyLogic = null;
    this.selectedCats = this.loadValidatedState('selectedCats', [], 'infinite');
    this.attempts = this.loadValidatedState('attempts', 0, 'infinite');
    this.hintAvailable = this.loadValidatedState('hintAvailable', false, 'infinite');

    // temp fixed answer
    // const testCat = this.cats.find(c => c.name === "Nymph Cat");
    // if (testCat) {
    //   this.answer = testCat;
    //   Security.storage.set('infinite_currentAnswer', JSON.stringify(this.answer));
    //   this.yesterdaysAnswer = this.getPlaceholderCat();
    //   return;
    // }

    const storedAnswer = Security.storage.get('infinite_currentAnswer');
    if (storedAnswer) {
      try {
        this.answer = JSON.parse(storedAnswer);
      } catch (e) {
        this.answer = this.generateRandomAnswer();
        this.saveInfiniteState();
      }
    } else {
      this.answer = this.generateRandomAnswer();
      this.saveInfiniteState();
    }

    this.yesterdaysAnswer = this.getPlaceholderCat();
  }

  generateRandomAnswer() {
    const randomIndex = Math.floor(Math.random() * this.cats.length);
    return this.cats[randomIndex];
  }

  saveInfiniteState() {
    Security.storage.set('infinite_currentAnswer', JSON.stringify(this.answer));
  }

  checkAndResetForNewDay() {
    if (this.mode !== 'daily') return false;

    const storedGameIndex = Security.storage.get('game_index');

    if (storedGameIndex !== this.currentGameIndex) {
      this.clearOldGameState('daily');
      Security.storage.set('game_index', this.currentGameIndex, 48 * 60 * 60 * 1000);
      return true;
    }
    return false;
  }

  clearOldGameState(prefix = 'daily') {
    if (prefix === 'daily') {
      ['selectedCats', 'attempts', 'hintAvailable'].forEach(key => {
        Security.storage.remove(key);
      });
    } else {
      ['infinite_selectedCats', 'infinite_attempts', 'infinite_hintAvailable'].forEach(key => {
        Security.storage.remove(key);
      });
    }
  }

  loadValidatedState(key, defaultValue, prefix = 'daily') {
    const storageKey = prefix === 'infinite' ? `infinite_${key}` : key;
    const stored = Security.storage.get(storageKey);

    if (stored === null) return defaultValue;

    switch (key) {
      case 'selectedCats':
        if (!Array.isArray(stored)) return defaultValue;
        return stored
          .filter(item => typeof item === 'string')
          .slice(0, 8)
          .map(item => Security.sanitizeInput(item));

      case 'attempts':
        const num = parseInt(stored);
        return (Number.isInteger(num) && num >= 0 && num <= 8) ? num : defaultValue;

      case 'hintAvailable':
        return typeof stored === 'boolean' ? stored : defaultValue;

      default:
        return defaultValue;
    }
  }

  getPlaceholderCat() {
    return {
      unitId: 0,
      name: 'Cat',
      img: 'images/cats/Cat.webp',
      rarity: 'Normal',
      form: 'Normal Form',
      role: '',
      traits: '',
      attackType: '',
      abilities: '',
      cost: '0¢',
      version: 'V1.0',
      source: 'Unknown'
    };
  }

  getCurrentDayNumber() {
    if (this.mode === 'infinite') return null;
    return this.dailyLogic.getCurrentDayNumber();
  }

  getYesterdayDayNumber() {
    if (this.mode === 'infinite') return null;
    return this.dailyLogic.getCurrentDayNumber() - 1;
  }

  getAttempts() {
    return this.attempts;
  }

  getAllCats() {
    return this.cats;
  }

  getSelectedCats() {
    return this.selectedCats;
  }

  getAnswer() {
    return this.answer;
  }

  compareCategories(cat, answerCat) {
    const categories = [
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

    return categories.map((category) => {
      if (category === "form") {
        const validForms = [
          "Normal Form",
          "Evolved Form",
          "True Form",
          "Ultra Form",
        ];
        if (validForms.includes(cat[category]) && validForms.includes(answerCat[category])) {
          return cat[category] === answerCat[category] ? "green-box" : "red-box";
        }
        return "red-box";
      }

      else if (category === "rarity") {
        return cat[category] === answerCat[category] ? "green-box" : "red-box";
      }

      else if (category === "standingRange") {
        const catRange = parseInt(cat[category]) || 0;
        const answerRange = parseInt(answerCat[category]) || 0;

        if (catRange === answerRange) return "green-box";

        const diff = Math.abs(catRange - answerRange);
        if (diff > 150) return catRange > answerRange ? "double-down" : "double-up";
        return catRange > answerRange ? "single-down" : "single-up";
      }

      else if (category === "speed") {
        const catSpeed = parseInt(cat[category]) || 0;
        const answerSpeed = parseInt(answerCat[category]) || 0;

        if (catSpeed === answerSpeed) return "green-box";

        const diff = Math.abs(catSpeed - answerSpeed);
        if (diff > 20) return catSpeed > answerSpeed ? "double-down" : "double-up";
        return catSpeed > answerSpeed ? "single-down" : "single-up";
      }

      else if (category === "traits" || category === "abilities" || category === "attackType") {
        const normalizeValues = (str) => {
          if (!str) return [];
          return str
            .toLowerCase()
            .split(" ")
            .filter(v => v && v !== 'x');
        };

        const catValues = normalizeValues(cat[category]);
        const answerValues = normalizeValues(answerCat[category]);
        const commonElements = catValues.filter(value => answerValues.includes(value));

        if (commonElements.length === catValues.length &&
          commonElements.length === answerValues.length) {
          return "green-box";
        }
        return commonElements.length > 0 ? "yellow-box" : "red-box";
      }

      else if (category === "cost") {
        const catValue = parseFloat(cat[category].replace(/[^\d.-]/g, ""));
        const answerValue = parseFloat(answerCat[category].replace(/[^\d.-]/g, ""));

        if (catValue === answerValue) return "green-box";
        if (isNaN(catValue) || isNaN(answerValue)) return "red-box";

        if (Math.abs(catValue - answerValue) > 1500) {
          return catValue > answerValue ? "double-down" : "double-up";
        } else {
          return catValue > answerValue ? "single-down" : "single-up";
        }
      }

      else if (category === "version") {
        const parseVersion = (v) => {
          const parts = v.replace(/^V/, '').split('.').map(Number);
          return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
          };
        };

        const catVer = parseVersion(cat[category]);
        const ansVer = parseVersion(answerCat[category]);

        if (cat[category] === answerCat[category]) return "green-box";

        if (catVer.major !== ansVer.major) {
          const diff = catVer.major - ansVer.major;
          return Math.abs(diff) >= 5 ?
            (diff > 0 ? "double-down" : "double-up") :
            (diff > 0 ? "single-down" : "single-up");
        }

        if (catVer.minor !== ansVer.minor) {
          const diff = catVer.minor - ansVer.minor;
          return diff > 0 ? "single-down" : "single-up";
        }

        return "single-up";
      }

      return "red-box";
    });
  }

  checkGuess(cat) {
    this.attempts++;

    const safeName = Security.sanitizeInput(cat.name);
    this.selectedCats.push(safeName);

    if (this.attempts >= 5 && !this.hintAvailable) {
      this.hintAvailable = true;
    }

    // Save state based on mode
    if (this.mode === 'infinite') {
      Security.storage.set('infinite_selectedCats', this.selectedCats);
      Security.storage.set('infinite_attempts', this.attempts);
      Security.storage.set('infinite_hintAvailable', this.hintAvailable);
    } else {
      Security.storage.set('selectedCats', this.selectedCats);
      Security.storage.set('attempts', this.attempts);
      Security.storage.set('hintAvailable', this.hintAvailable);
    }

    return cat.name === this.answer.name;
  }

  resetInfiniteGame() {
    if (this.mode !== 'infinite') return false;

    Security.storage.remove('infinite_selectedCats');
    Security.storage.remove('infinite_attempts');
    Security.storage.remove('infinite_hintAvailable');
    Security.storage.remove('infinite_currentAnswer');

    this.selectedCats = [];
    this.attempts = 0;
    this.hintAvailable = false;
    this.answer = this.generateRandomAnswer();

    Security.storage.set('infinite_selectedCats', this.selectedCats);
    Security.storage.set('infinite_attempts', this.attempts);
    Security.storage.set('infinite_hintAvailable', this.hintAvailable);
    Security.storage.set('infinite_currentAnswer', JSON.stringify(this.answer));

    return true;
  }

  resetGameState() {
    if (this.mode === 'infinite') {
      this.resetInfiniteGame();
      return;
    }

    this.selectedCats = [];
    this.attempts = 0;
    this.hintAvailable = false;

    ['selectedCats', 'attempts', 'hintAvailable'].forEach(key => {
      Security.storage.remove(key);
    });
  }

  getHint() {
    return this.hintAvailable ? this.answer.source : null;
  }

  getYesterdaysAnswer() {
    if (this.mode === 'infinite') {
      return this.getPlaceholderCat();
    }
    return this.yesterdaysAnswer;
  }

  getTodaysDateKey() {
    return this.currentGameDay;
  }

  isInfiniteMode() {
    return this.mode === 'infinite';
  }
}