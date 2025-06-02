export class GameLogic {
  constructor(catsData) {
    this.cats = catsData;
    this.selectedCats = [];
    // this.answer = this.cats.find(cat => cat.name === "Sashimi Cat"); //For testing purposes
    this.answer = this.getRandomCat(); // Uncomment for normal operation
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
        if (validForms.includes(cat[category]) && validForms.includes(answerCat[category])) {
          return cat[category] === answerCat[category] ? "green-box" : "red-box";
        }
        return "red-box";
      }
      
      // Exact match for rarity and attackType
      else if (category === "rarity" || category === "attackType") {
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
        return commonRoles.length > 0 ? "yellow-box" : "red-box";
      }
      
      // Partial matching for traits and abilities
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
      
      // Cost comparison
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
      
      // Version comparison
      else if (category === "version") {
        if (cat[category] === answerCat[category]) return "green-box";
        
        const catVer = cat[category].replace(/^V/, '').split('.').map(Number);
        const ansVer = answerCat[category].replace(/^V/, '').split('.').map(Number);

        // Major version first
        if (catVer[0] !== ansVer[0]) {
          const diff = catVer[0] - ansVer[0];
          return Math.abs(diff) >= 5 ? 
            (diff > 0 ? "double-down" : "double-up") :
            (diff > 0 ? "single-down" : "single-up");
        }

        // Same major version - check minor
        if (catVer[1] !== ansVer[1]) {
          const diff = (catVer[1] || 0) - (ansVer[1] || 0);
          return Math.abs(diff) >= 5 ? 
            (diff > 0 ? "double-down" : "double-up") :
            (diff > 0 ? "single-down" : "single-up");
        }

        // Same major.minor but different patch (e.g., 2.0 vs 2.0.9)
        // Show single-up arrow since patch version is higher
        return "single-up"; 
      }
      
      // Fallback
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
}