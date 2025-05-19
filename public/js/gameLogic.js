export class GameLogic {
  constructor(catsData) {
    this.cats = catsData;
    this.selectedCats = [];
    this.answer = this.getRandomCat();
    this.attempts = 0;
    this.hintAvailable = false;
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
      // Handle form comparisons
      if (category === "form") {
        const validForms = [
          "Normal Form",
          "Evolved Form",
          "True Form",
          "Ultra Form",
        ];
        if (
          validForms.includes(cat[category]) &&
          validForms.includes(answerCat[category])
        ) {
          return cat[category] === answerCat[category]
            ? "green-box"
            : "red-box";
        }
      }
      // Exact match for rarity
      else if (category === "rarity") {
        return cat[category] === answerCat[category] ? "green-box" : "red-box";
      }
      // Special handling for roles with partial matching
      else if (category === "role") {
        const catRoles = cat[category].split(/\s*,\s*|\s+/);
        const answerRoles = answerCat[category].split(/\s*,\s*|\s+/);
        
        if (cat[category] === answerCat[category]) {
          return "green-box";
        }
        
        const commonRoles = catRoles.filter(role => answerRoles.includes(role));
        if (commonRoles.length > 0) {
          return "yellow-box";
        }
        
        return "red-box";
      }
      // Numerical comparisons for cost and version
      else if (category === "cost" || category === "version") {
        const catValue = parseFloat(cat[category].replace(/[^\d.-]/g, ""));
        const answerValue = parseFloat(
          answerCat[category].replace(/[^\d.-]/g, "")
        );

        if (catValue === answerValue) {
          return "green-box";
        }

        let arrowClass = "";
        if (!isNaN(catValue) && !isNaN(answerValue)) {
          if (category === "cost") {
            if (Math.abs(catValue - answerValue) > 1500) {
              arrowClass = catValue > answerValue ? "double-down" : "double-up";
            } else {
              arrowClass = catValue > answerValue ? "single-down" : "single-up";
            }
          } else if (category === "version") {
            if (Math.abs(catValue - answerValue) >= 5) {
              arrowClass = catValue > answerValue ? "double-down" : "double-up";
            } else {
              arrowClass = catValue > answerValue ? "single-down" : "single-up";
            }
          }
        }
        return arrowClass || "red-box";
      }
      // Partial matching for traits and abilities
      else if (category === "abilities" || category === "traits") {
        const catValue = cat[category] || "";
        const answerValue = answerCat[category] || "";
        const catValues = catValue.split(" ");
        const answerValues = answerValue.split(" ");
        const commonElements = catValues.filter((value) =>
          answerValues.includes(value)
        );

        if (commonElements.length > 0) {
          if (
            commonElements.length === catValues.length &&
            commonElements.length === answerValues.length
          ) {
            return "green-box";
          } else {
            return "yellow-box";
          }
        }
      }
      // Default case for other categories
      else {
        const catValue = cat[category] || "";
        const answerValue = answerCat[category] || "";
        const catValues = catValue.split(" ");
        const answerValues = answerValue.split(" ");
        const commonElements = catValues.filter((value) =>
          answerValues.includes(value)
        );

        if (
          commonElements.length === catValues.length &&
          commonElements.length === answerValues.length
        ) {
          return "green-box";
        } else if (commonElements.length > 0) {
          return "yellow-box";
        }
      }
      return "red-box";
    });
  }

  checkGuess(cat) {
    this.attempts++;
    this.selectedCats.push(cat.name);
    
    // Check if hint should be available (after 5 attempts)
    if (this.attempts >= 5 && !this.hintAvailable) {
      this.hintAvailable = true;
    }
    
    return cat.name === this.answer.name;
  }

  getHint() {
    if (this.hintAvailable) {
      return this.answer.source;
    }
    return null;
  }
}