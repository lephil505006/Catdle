import { DailyLogic } from './dailyLogic.js';

export class GameLogic {
  constructor(catsData) {
    this.cats = catsData;
    this.dailyLogic = new DailyLogic(catsData); //Daily answer
    this.selectedCats = [];
    //this.answer = this.cats.find(cat => cat.name === "Iz the Dancer"); //For testing purposes
    //this.answer = this.getRandomCat(); // Uncomment for normal operation
    this.attempts = 0;
    this.hintAvailable = false;

    this.answer = this.dailyLogic.getTodaysAnswer();
    this.yesterdaysAnswer = this.dailyLogic.getYesterdaysAnswer();

    console.log("Today's answer:", this.answer.name);
    console.log("Yesterday's answer:", this.yesterdaysAnswer.name);
  }

  getRandomCat() {
    return this.cats[Math.floor(Math.random() * this.cats.length)];
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
    this.attempts++;
    this.selectedCats.push(cat.name);

    if (this.attempts >= 5 && !this.hintAvailable) {
      this.hintAvailable = true;
    }

    return cat.name === this.answer.name;
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