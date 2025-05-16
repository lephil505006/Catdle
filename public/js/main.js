import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import cats from './catsData.js';

document.addEventListener("DOMContentLoaded", () => {
  const game = new GameLogic(cats);
  const ui = new UIHandlers(game);
  
  // Initial setup
  document.getElementById("headers").style.display = "none";
});