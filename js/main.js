import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import { loadCatData } from './loadCats.js';

function getGameMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mode') === 'infinite' ? 'infinite' : 'daily';
}

function updateUIMode(mode) {
    const body = document.body;
    const modeButton = document.getElementById('mode-toggle');

    if (mode === 'infinite') {
        body.classList.add('infinite-mode');
        if (!window.location.search.includes('mode=infinite')) {
            window.history.pushState({}, '', '?mode=infinite');
        }
    } else {
        body.classList.remove('infinite-mode');
        if (window.location.search.includes('mode=infinite')) {
            window.history.pushState({}, '', 'index.html');
        }
    }

    if (modeButton) {
        modeButton.onclick = () => {
            const currentMode = getGameMode();
            if (currentMode === 'daily') {
                window.location.href = '?mode=infinite';
            } else {
                window.location.href = 'index.html';
            }
        };
    }
}

window.addEventListener('popstate', () => {
    const mode = getGameMode();
    updateUIMode(mode);
});

document.addEventListener("DOMContentLoaded", async () => {
    const mode = getGameMode();
    updateUIMode(mode);

    const cats = await loadCatData();
    const game = new GameLogic(cats, mode);
    const ui = new UIHandlers(game);

    const instructionElement = document.getElementById('game-instruction');
    if (instructionElement) {
        instructionElement.textContent = mode === 'infinite'
            ? "Battle Cats Infinite Mode - Endless Units!"
            : "Guess The Daily Battle Cat's unit!";
    }

    if (mode === 'daily') {
        ui.displayYesterdaysAnswer();
    }

    const savedNames = game.getSelectedCats();

    if (savedNames && savedNames.length > 0) {
        setTimeout(() => {
            const headers = document.getElementById("headers");
            if (headers) {
                headers.style.display = "flex";
            }

            // Display guesses from previous session if within same day
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