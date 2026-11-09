# Ejercicio 4: Persistencia de Datos Asíncrona con IndexedDB

Este ejercicio implementa almacenamiento estructurado y transaccional del lado del cliente utilizando la **IndexedDB Web API**, permitiendo que la Aplicación Web Progresiva opere y persista datos sin depender de una conexión a internet.

---

## 📋 Objetivos Cumplidos

1. **Apertura y Esquema de Base de Datos (`indexedDB.open`)**:
   - Creación de la base de datos `PortfolioPWA_DB` en su versión `1`.
   - Implementación del ciclo de esquema en el evento `onupgradeneeded`.
   - Creación del Object Store `registros` con clave primaria auto-incremental (`keyPath: 'id', autoIncrement: true`).
   - Configuración de índices estructurados: `index_titulo`, `index_categoria`, `index_fecha`, `index_estado` e `index_prioridad`.

2. **Operaciones Transaccionales CRUD Asíncronas**:
   - **Insertar (Create)**: `store.add(record)` dentro de una transacción `readwrite`.
   - **Consultar (Read)**: `store.getAll()` y `store.get(id)` dentro de una transacción `readonly`.
   - **Modificar (Update)**: `store.put(record)` con actualización de campos y metadatos.
   - **Eliminar (Delete)**: `store.delete(id)` y vaciado masivo con `store.clear()`.
   - Mapeo completo a Promesas nativas de JavaScript (`async/await`) en una clase modular `DatabaseManager`.

3. **Interfaz de Usuario y Resiliencia Offline**:
   - Formulario reactivo para alta y edición con validación de campos.
   - Tabla interactiva con ordenamiento, filtrado en vivo por texto, categoría y estado.
   - Cambio rápido de estado de registros con un solo clic.
   - Detección en tiempo real del estado de red (`online` / `offline`).
   - Botón de carga de 5 registros de demostración (*seeds*).
   - Exportación de la base de datos a formato JSON descargable.
   - Estimación de cuota de almacenamiento consumida (`navigator.storage.estimate()`).

---

## 🛠️ Tecnologías Empleadas

- **IndexedDB API**: `IDBDatabase`, `IDBTransaction`, `IDBObjectStore`, `IDBIndex`, `IDBRequest`.
- **Storage API**: `navigator.storage.estimate()` para telemetría de cuota en disco.
- **Network Information**: Detección de conectividad con `navigator.onLine` y eventos de ventana.
- **JavaScript Moderno (ES6+)**: Clases, Promesas, Async/Await y manipulación del DOM.

---

## 🚀 Cómo Probar el Ejercicio

1. Levanta un servidor local:
   ```bash
   python3 -m http.server 8000
   ```
2. Accede a `http://localhost:8000/Portafolio_2/Ejercicio_4/`.
3. Haz clic en **"⚡ Cargar Demos"** para poblar el almacén con 5 actividades de muestra.
4. Inserta un nuevo registro desde el formulario lateral y verifica su adición inmediata en la tabla.
5. Edita o elimina cualquier registro y observa la persistencia.
6. **Prueba Offline**: Desconecta tu conexión Wi-Fi / cable de red o activa el modo "Offline" en las herramientas de desarrollador (*F12 > Network > Offline*).
7. Recarga la página: todos los registros seguirán intactos y podrás continuar agregando, modificando y eliminando datos sin ningún error ni necesidad de conexión a internet.
