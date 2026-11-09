/**
 * db.js - Capa IndexedDB para Respaldo y Fallback de la Estrategia Network-First
 */

class ApiCacheDB {
  constructor(dbName = 'NetworkFirst_DB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.storeName = 'api_cache';
    this.db = null;
  }

  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`[IndexedDB Cache] Creando Object Store '${this.storeName}'...`);
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'endpoint' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async getStore(mode = 'readonly') {
    const db = await this.open();
    const tx = db.transaction(this.storeName, mode);
    return tx.objectStore(this.storeName);
  }

  /**
   * Guarda una copia local del JSON recibido de la red
   */
  async saveApiResponse(endpoint, payload, metadata = {}) {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const record = {
        endpoint,
        payload,
        timestamp: new Date().toISOString(),
        itemCount: Array.isArray(payload) ? payload.length : (payload.products ? payload.products.length : 1),
        ...metadata
      };

      const request = store.put(record);
      request.onsuccess = () => {
        console.log(`[IndexedDB Cache] Respuesta guardada localmente para ${endpoint}`);
        resolve(record);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Recupera la última respuesta guardada en caso de caída de red (Fallback)
   */
  async getCachedResponse(endpoint) {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(endpoint);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vacía la caché de IndexedDB para probar estados vacíos
   */
  async clearCache() {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

window.apiCacheDB = new ApiCacheDB();

