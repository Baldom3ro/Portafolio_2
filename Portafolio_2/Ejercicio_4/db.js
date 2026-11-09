/**
 * db.js - Capa de persistencia asíncrona con IndexedDB nativo
 * Implementación orientada a objetos con Promesas para operaciones CRUD completas.
 */

class DatabaseManager {
  constructor(dbName = 'PortfolioPWA_DB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.storeName = 'registros';
    this.db = null;
  }

  /**
   * Abre o crea la base de datos y define el Object Store e Índices
   */
  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      // Evento de creación o actualización de esquema
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`[IndexedDB] Creando o actualizando Object Store '${this.storeName}' (versión ${this.version})...`);

        if (!db.objectStoreNames.contains(this.storeName)) {
          // Creación del Object Store con clave primaria auto-incremental
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Creación de índices para búsquedas optimizadas
          store.createIndex('index_titulo', 'titulo', { unique: false });
          store.createIndex('index_categoria', 'categoria', { unique: false });
          store.createIndex('index_fecha', 'fecha', { unique: false });
          store.createIndex('index_estado', 'estado', { unique: false });
          store.createIndex('index_prioridad', 'prioridad', { unique: false });

          console.log(`[IndexedDB] Object Store e índices creados exitosamente.`);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log(`[IndexedDB] Conexión abierta con éxito a '${this.dbName}'.`);
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Error al abrir la base de datos:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Obtiene una transacción y el Object Store asociado
   */
  async getStore(mode = 'readonly') {
    const db = await this.open();
    const transaction = db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  /**
   * INSERTAR (Create): Guarda un nuevo registro
   */
  async add(item) {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      // Si no trae fecha, añadir la actual
      const record = {
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
      };

      const request = store.add(record);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Registro insertado con ID: ${request.result}`);
        resolve(request.result); // Retorna el nuevo ID generado
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * CONSULTAR TODOS (Read All): Retorna todos los registros
   */
  async getAll() {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * CONSULTAR POR ID (Read One): Busca un registro específico
   */
  async getById(id) {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(Number(id));

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * MODIFICAR (Update): Actualiza un registro existente mediante put
   */
  async update(item) {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const record = {
        ...item,
        id: Number(item.id),
        updatedAt: new Date().toISOString()
      };

      const request = store.put(record);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Registro ID ${record.id} actualizado.`);
        resolve(record.id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * ELIMINAR (Delete): Elimina un registro por su ID
   */
  async delete(id) {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(Number(id));

      request.onsuccess = () => {
        console.log(`[IndexedDB] Registro ID ${id} eliminado.`);
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * VACIAR (Clear): Elimina todos los registros del store
   */
  async clear() {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[IndexedDB] Object Store vaciado completamente.');
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * CONTAR REGISTROS
   */
  async count() {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * BÚSQUEDA Y FILTRADO AVANZADO (en memoria o por índices)
   */
  async search(query = '', categoria = 'todas', estado = 'todos') {
    const all = await this.getAll();
    const q = query.toLowerCase().trim();

    return all.filter(item => {
      const matchQuery = !q ||
        (item.titulo && item.titulo.toLowerCase().includes(q)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q));

      const matchCat = categoria === 'todas' || item.categoria === categoria;
      const matchEstado = estado === 'todos' || item.estado === estado;

      return matchQuery && matchCat && matchEstado;
    });
  }
}

// Exportar instancia global
window.dbManager = new DatabaseManager();

