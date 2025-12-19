import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import { loadCatData } from './loadCats.js';

document.addEventListener("DOMContentLoaded", async () => {
  const cats = await loadCatData();
  const game = new GameLogic(cats);
  const ui = new UIHandlers(game);

  ui.displayYesterdaysAnswer();

  const savedNames = game.getSelectedCats ? game.getSelectedCats() : [];
  
  if (savedNames && savedNames.length > 0) {
    
    setTimeout(() => {
      const headers = document.getElementById("headers");
      if (headers) {
        headers.style.display = "flex";
      }
      
      savedNames.forEach(catName => {
        const cat = cats.find(c => c.name === catName);
        if (cat) {
          ui.displayCatDetails(cat);
        }
      });
      
      game.attempts = savedNames.length;
      if (game.attempts >= 5) {
        game.hintAvailable = true;
      }
      
      ui.updateHintDisplay();
      
    }, 100);
    
  } else {
    document.getElementById("headers").style.display = "none";
  }
});