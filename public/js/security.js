export class Security {
  static escapeHTML(str) {
    if (str === null || str === undefined) return '';
    
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

static sanitizeInput(input, maxLength = 100) {
    if (typeof input !== 'string') return '';
    
    let sanitized = input
      .slice(0, maxLength)
      .replace(/[<>"]/g, '') 
      .trim();
    
    return sanitized;
}

  static validateExternalUrl(url, allowedDomains = ['forms.gle', 'docs.google.com']) {
    try {
      const parsed = new URL(url);
      const isAllowed = allowedDomains.some(domain => 
        parsed.hostname.endsWith(domain)
      );
      return isAllowed ? url : null;
    } catch {
      return null;
    }
  }

  static storage = {
    prefix: 'catdle_',
    
    set(key, value, ttl = null) {
      try {
        const item = {
          value: value,
          timestamp: Date.now(),
          ttl: ttl
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
      } catch (e) {
        console.warn('Storage set failed:', e);
      }
    },
    
    get(key) {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        
        if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
          this.remove(key);
          return null;
        }
        
        return parsed.value;
      } catch (e) {
        console.warn('Storage get failed:', e);
        this.remove(key);
        return null;
      }
    },
    
    remove(key) {
      localStorage.removeItem(this.prefix + key);
    },
    
    clearAll() {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  };

static hashAnswer(unitId, seed) {
    const combined = `${String(unitId)}|${String(seed)}`;
    
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const hashStr = Math.abs(hash).toString(36).slice(0, 20);
    return hashStr;
}
}