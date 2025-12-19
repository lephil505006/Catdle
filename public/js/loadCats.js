import { Security } from './security.js';

export async function loadCatData() {
  try {
    const response = await fetch('public/data/BattleCatsDatabase.xlsm');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load data`);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.some(type => contentType.includes(type))) {
      console.warn('Unexpected content type:', contentType);
    }
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      throw new Error('Data file too large');
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error('Data file too large');
    }
    
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Invalid Excel file: No sheets found');
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (!worksheet) {
      throw new Error('Invalid Excel file: First sheet is empty');
    }
    
    const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

    return jsonData.map(cat => {
      const getValue = (keys) => {
        for (const key of keys) {
          if (cat[key] !== undefined && cat[key] !== null) {
            if (key === 'img' || key === 'Image') {
              return String(cat[key]).replace(/[<>"]/g, '').trim();
            }
            return Security.sanitizeInput(String(cat[key]));
          }
        }
        return null;
      };

      const rawName = getValue(['name', 'Name']);
      const safeName = rawName || 'Unknown';
      
      const rawImg = getValue(['img', 'Image']);
      let safeImg;
      
      if (rawImg && (rawImg.startsWith('images/') || rawImg.startsWith('data:'))) {
        safeImg = 'public/' + rawImg;
      } else {
        safeImg = `public/images/cats/${formatImageName(safeName)}.webp`;
      }

      return {
        unitId: parseInt(getValue(['UID', 'Unit ID', 'unitId'])) || 0,
        name: safeName,
        img: safeImg,
        rarity: getValue(['rarity', 'Rarity']) || 'Normal',
        form: getValue(['form', 'Form']) || 'Normal Form',
        role: getValue(['role', 'Role']) || '',
        traits: parseField(getValue(['traits', 'Traits'])),
        attackType: parseField(getValue(['attack type', 'Attack Type'])),
        abilities: parseField(getValue(['abilities', 'Abilities'])),
        cost: formatCost(getValue(['cost', 'Cost'])),
        version: formatVersion(getValue(['version', 'Version'])),
        source: getValue(['source', 'Source']) || 'Unknown'
      };
    });

  } catch (error) {
    console.error("Error loading cat data:", error);
    
    return [
      {
        unitId: 1,
        name: 'Cat',
        img: 'images/cats/Cat.webp',
        rarity: 'Normal',
        form: 'Normal Form',
        role: 'Meatshield',
        traits: 'X',
        attackType: 'Single Attack',
        abilities: 'X',
        cost: '75¢',
        version: 'V1.0',
        source: 'Starting Unit'
      }
    ];
  }
}

function parseField(value) {
  if (!value || value === 'X' || value === 'x') return '';
  return String(value).trim();
}

function formatCost(value) {
  if (!value) return '0¢';
  const num = String(value).replace(/[^\d]/g, '');
  return num ? `${num}¢` : '0¢';
}

function formatVersion(value) {
  if (!value) return 'V1.0';
  const strValue = String(value);
  return strValue.startsWith('V') ? strValue : `V${strValue}`;
}

function formatImageName(name) {
    if (!name) return 'unknown';
    
    // Handle IDI variants
    if (name.includes("Idi:N")) {
        name = name.replace(/Idi:N/, 'Idi-N');
    }
    
    let formattedName = name.replace(/\s/g, '');
    
    return formattedName;
}