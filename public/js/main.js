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

async function testExcelLoad() {
  try {
    console.log('=== TESTING EXCEL LOAD FROM GITHUB PAGES ===');
    const testResponse = await fetch('data/BattleCatsDatabase.xlsm');
    console.log('1. Response status:', testResponse.status);
    console.log('2. Content-Type:', testResponse.headers.get('content-type'));
    
    if (testResponse.ok) {
      const buffer = await testResponse.arrayBuffer();
      console.log('3. File size:', buffer.byteLength, 'bytes');
      
      if (window.XLSX) {
        console.log('4. XLSX library loaded, attempting to parse...');

        const workbook = window.XLSX.read(buffer, { type: 'array' });
        console.log('5. Workbook parsed! Sheet names:', workbook.SheetNames);
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '',
          raw: false,
          range: 10
        });
        
        console.log('6. First few rows:', jsonData.slice(0, 3));
        console.log('✅ EXCEL LOAD SUCCESSFUL! Website will work.');
        
      } else {
        console.error('❌ XLSX library not found');
      }
    } else {
      console.error('❌ Failed to fetch Excel file');
    }
  } catch (error) {
    console.error('❌ Excel test failed:', error);
    console.error('Error stack:', error.stack);
    
    console.warn('⚠️ Excel parsing failed. Consider converting to JSON.');
  }
}
testExcelLoad();