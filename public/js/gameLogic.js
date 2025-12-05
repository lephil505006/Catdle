import { DailyLogic } from './dailyLogic.js';
import { Security } from './security.js';

export class GameLogic {
  constructor(catsData) {
    this.cats = catsData;
    this.dailyLogic = new DailyLogic(catsData);
    
    this.selectedCats = this.loadValidatedState('selectedCats', []);
    this.attempts = this.loadValidatedState('attempts', 0);
    this.hintAvailable = this.loadValidatedState('hintAvailable', false);
    
    this.todayKey = this.dailyLogic.getTodayKey();
    Security.storage.set('game_date', this.todayKey, 24 * 60 * 60 * 1000);
    
    this.answer = this.dailyLogic.getTodaysAnswer();
    this.yesterdaysAnswer = this.dailyLogic.getYesterdaysAnswer();
    
    const answerHash = Security.hashAnswer(this.answer.unitId, this.todayKey);
    Security.storage.set('answer_hash', answerHash, 24 * 60 * 60 * 1000);
  }

  loadValidatedState(key, defaultValue) {
    const stored = Security.storage.get(key);
    
    if (stored === null) return defaultValue;
    
    switch(key) {
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

  validateAnswerIntegrity(cat) {
    const storedHash = Security.storage.get('answer_hash');
    if (!storedHash) return true;
    
    const expectedHash = Security.hashAnswer(cat.unitId, this.todayKey);
    return storedHash === expectedHash;
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
      "role",
      "traits",
      "attackType",
      "abilities",
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

      else if (category === "attackType") {
        const catAttacks = (cat[category] || "").split(" ");
        const answerAttacks = (answerCat[category] || "").split(" ");

        if (cat[category] === answerCat[category]) {
          return "green-box";
        }

        const commonAttacks = catAttacks.filter(attack => answerAttacks.includes(attack));
        if (commonAttacks.length > 0) {
          return "yellow-box";
        }

        return "red-box";
      }

      else if (category === "role") {
        const normalizeRoles = (roles) => {
          return roles.split(/\s*,\s*|\s+/)
            .sort()
            .join(' ');
        };

        const catRoles = normalizeRoles(cat[category]);
        const answerRoles = normalizeRoles(answerCat[category]);

        if (catRoles === answerRoles) {
          return "green-box";
        }

        const catRoleArray = catRoles.split(' ');
        const answerRoleArray = answerRoles.split(' ');
        const commonRoles = catRoleArray.filter(role => answerRoleArray.includes(role));

        return commonRoles.length > 0 ? "yellow-box" : "red-box";
      }

      else if (category === "traits" || category === "abilities") {
        const catValues = (cat[category] || "").split(" ");
        const answerValues = (answerCat[category] || "").split(" ");
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

        let arrowClass = "";
        if (Math.abs(catValue - answerValue) > 1500) {
          arrowClass = catValue > answerValue ? "double-down" : "double-up";
        } else {
          arrowClass = catValue > answerValue ? "single-down" : "single-up";
        }
        return arrowClass;
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
    if (!this.validateAnswerIntegrity(cat)) {
        console.warn('Answer validation failed - attempting to recover');
        
        const storedHash = Security.storage.get('answer_hash');
        console.log('Stored hash:', storedHash, 'Today key:', this.todayKey);
        
        const newHash = Security.hashAnswer(this.answer.unitId, this.todayKey);
        Security.storage.set('answer_hash', newHash, 24 * 60 * 60 * 1000);
        
        if (!this.validateAnswerIntegrity(cat)) {
            console.warn('Validation disabled for this session');
        }
    }
    
    this.attempts++;
    Security.storage.set('attempts', this.attempts);
    
    const safeName = Security.sanitizeInput(cat.name);
    this.selectedCats.push(safeName);
    Security.storage.set('selectedCats', this.selectedCats);

    if (this.attempts >= 5 && !this.hintAvailable) {
        this.hintAvailable = true;
        Security.storage.set('hintAvailable', this.hintAvailable);
    }

    return cat.name === this.answer.name;
}

  resetGameState() {
    this.selectedCats = [];
    this.attempts = 0;
    this.hintAvailable = false;
    
    // Clear all game-related storage
    ['selectedCats', 'attempts', 'hintAvailable', 'answer_hash', 'game_date'].forEach(key => {
      Security.storage.remove(key);
    });
    
    // Reload answer
    this.answer = this.dailyLogic.getTodaysAnswer();
    const answerHash = Security.hashAnswer(this.answer.unitId, this.todayKey);
    Security.storage.set('answer_hash', answerHash, 24 * 60 * 60 * 1000);
  }

  getHint() {
    return this.hintAvailable ? this.answer.source : null;
  }

  getYesterdaysAnswer() {
    return this.yesterdaysAnswer;
  }

  getTodaysDateKey() {
    return this.dailyLogic.todayKey;
  }
}