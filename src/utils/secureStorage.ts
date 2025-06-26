
// Utilitaires pour un stockage sécurisé des données sensibles
const STORAGE_PREFIX = 'school_mgmt_';
const VERSION = '1.0';

export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const secureData = {
        version: VERSION,
        timestamp: Date.now(),
        data: value
      };
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(secureData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  },

  getItem: (key: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Vérifier la version et l'âge des données
      if (parsed.version !== VERSION) {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return null;
      }
      
      // Expirer les données après 30 jours
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (parsed.timestamp < thirtyDaysAgo) {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};
