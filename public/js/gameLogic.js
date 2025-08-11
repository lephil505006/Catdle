export class GameLogic {
  constructor(catsData) {
    this.cats = catsData;
    this.selectedCats = [];
    //this.answer = this.cats.find(cat => cat.name === "Iz the Dancer"); //For testing purposes
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
      else if (category === "rarity") {
        return cat[category] === answerCat[category] ? "green-box" : "red-box";
      }

        else if (category === "attackType") {
        const catAttacks = (cat[category] || "").split(" ");
        const answerAttacks = (answerCat[category] || "").split(" ");
        
        // Exact match
        if (cat[category] === answerCat[category]) {
          return "green-box";
        }
        
        // Partial match (any shared attack types)
        const commonAttacks = catAttacks.filter(attack => answerAttacks.includes(attack));
        if (commonAttacks.length > 0) {
          return "yellow-box";
        }
        
        return "red-box";
      }
      
      // Special handling for roles with partial matching
      else if (category === "role") {
          const normalizeRoles = (roles) => {
              return roles.split(/\s*,\s*|\s+/)
                        .sort() // Sort alphabetically for consistent comparison
                        .join(' '); // Rejoin with single spaces
          };
          
          const catRoles = normalizeRoles(cat[category]);
          const answerRoles = normalizeRoles(answerCat[category]);
          
          // Exact match (order doesn't matter)
          if (catRoles === answerRoles) {
              return "green-box";
          }
          
          // Check for partial matches
          const catRoleArray = catRoles.split(' ');
          const answerRoleArray = answerRoles.split(' ');
          const commonRoles = catRoleArray.filter(role => answerRoleArray.includes(role));
          
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
      // Remove V prefix and split into components
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

      // Exact match (including patch)
      if (cat[category] === answerCat[category]) return "green-box";

      // Major version difference
      if (catVer.major !== ansVer.major) {
          const diff = catVer.major - ansVer.major;
          return Math.abs(diff) >= 5 ? 
              (diff > 0 ? "double-down" : "double-up") :
              (diff > 0 ? "single-down" : "single-up");
      }

      // Same major version - check minor
      if (catVer.minor !== ansVer.minor) {
          const diff = catVer.minor - ansVer.minor;
          // For minor versions, only use single arrows regardless of difference
          return diff > 0 ? "single-down" : "single-up";
      }

      // Same major.minor but different patch
      return "single-up"; // Newer patch is slightly higher
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