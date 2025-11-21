import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import { loadCatData } from './loadCats.js';

document.addEventListener("DOMContentLoaded", async () => {
  const cats = await loadCatData();
  const game = new GameLogic(cats);
  const ui = new UIHandlers(game);

  ui.displayYesterdaysAnswer();

  document.getElementById("headers").style.display = "none";
});