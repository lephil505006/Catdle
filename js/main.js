import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import { loadCatData } from './loadCats.js';

function getGameMode() {
    const hash = window.location.hash;

    if (hash === '#infinite') return 'infinite';
    if (hash === '#custom') return 'custom';
    if (hash === '' || hash === '#') return 'daily';

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'infinite') {
        window.location.hash = 'infinite';
        return 'infinite';
    }
    if (urlParams.get('mode') === 'custom') {
        window.location.hash = 'custom';
        return 'custom';
    }

    return 'daily';
}

function updateUIMode(mode) {
    const body = document.body;
    const modeSelect = document.getElementById('mode-select');
    const instructionElement = document.getElementById('game-instruction');
    const searchButton = document.getElementById('search-button');

    body.classList.remove('daily-mode', 'infinite-mode', 'custom-mode');
    body.classList.add(`${mode}-mode`);

    if (modeSelect) {
        modeSelect.value = mode;
    }

    if (instructionElement) {
        const texts = {
            'daily': "Guess The Daily Battle Cat's unit!",
            'infinite': "Battle Cats Infinite Mode - Endless Units!",
            'custom': "Custom Mode - Select a Unit for the answer!"
        };
        instructionElement.textContent = texts[mode] || texts.daily;
    }
}

window.addEventListener('hashchange', () => {
    console.log('Hash changed to:', window.location.hash);
    window.location.reload();
});

document.addEventListener("DOMContentLoaded", async () => {
    const mode = getGameMode();
    updateUIMode(mode);

    const cats = await loadCatData();
    const game = new GameLogic(cats, mode);
    const ui = new UIHandlers(game);

    if (ui.updateModeDropdown) {
        ui.updateModeDropdown(mode);
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

            const lastGuess = savedNames[savedNames.length - 1];
            const isGameWon = (lastGuess === game.getAnswer().name);

            if (isGameWon) {
                ui.showGameRestartUI();
            } else {
                ui.showGamePlayUI();
            }

        }, 100);
    } else {
        document.getElementById("headers").style.display = "none";
        if (mode === 'infinite') {
            ui.showGamePlayUI();
        }
    }
});