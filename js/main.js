import { GameLogic } from './gameLogic.js';
import { UIHandlers } from './uiHandlers.js';
import { loadCatData } from './loadCats.js';

function getGameMode() {
    const hash = window.location.hash;
    if (hash === '#infinite') return 'infinite';
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'infinite') {
        window.location.hash = 'infinite';
        return 'infinite';
    }
    
    return 'daily';
}

function updateUIMode(mode) {
    const body = document.body;
    const modeButton = document.getElementById('mode-toggle');
    const instructionElement = document.getElementById('game-instruction');

    if (mode === 'infinite') {
        body.classList.add('infinite-mode');
        
        if (window.location.hash !== '#infinite') {
            const cleanUrl = window.location.pathname + '#infinite';
            window.history.replaceState({}, '', cleanUrl);
        }
        

        if (instructionElement) {
            instructionElement.textContent = "Battle Cats Infinite Mode - Endless Units!";
        }
    } else {
        body.classList.remove('infinite-mode');
        
        if (window.location.hash) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
        
        if (instructionElement) {
            instructionElement.textContent = "Guess The Daily Battle Cat's unit!";
        }
    }

    if (modeButton) {
        modeButton.onclick = () => {
            const currentMode = getGameMode();
            if (currentMode === 'daily') {
                window.location.href = window.location.pathname + '#infinite';
            } else {
                window.location.href = window.location.pathname;
            }
        };
    }
}

window.addEventListener('hashchange', () => {
    window.location.reload();
});

document.addEventListener("DOMContentLoaded", async () => {
    const mode = getGameMode();
    updateUIMode(mode);

    const cats = await loadCatData();
    const game = new GameLogic(cats, mode);
    const ui = new UIHandlers(game);

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

        }, 100);

    } else {
        document.getElementById("headers").style.display = "none";
    }
});