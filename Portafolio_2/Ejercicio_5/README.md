# Ejercicio 5: Estrategia de Caché Dinámica con Fallback a IndexedDB / Network-First

Este ejercicio implementa una arquitectura avanzada de resiliencia y disponibilidad para Aplicaciones Web Progresivas (PWA), combinando el consumo de servicios REST remotos con estrategias de almacenamiento en caché dinámica y fallback local automático mediante **IndexedDB**.

---

## 📋 Objetivos Cumplidos

1. **Consumo de API REST Remota con `fetch`**:
   - Peticiones asíncronas no cacheadas (`cache: 'no-cache'`) a APIs REST públicas en vivo:
     - Catálogo de productos con imágenes y precios (**DummyJSON API**).
     - Publicaciones de blog (**JSONPlaceholder API**).
   - Control de latencia y manejo de tiempos de espera (*timeout* con `AbortController`).

2. **Implementación de la Estrategia Network-First**:
   - **Paso 1 (Red)**: La aplicación intenta obtener los datos más recientes desde el servidor remoto.
   - **Paso 2 (Persistencia)**: Si la respuesta es exitosa (`response.ok`), guarda automáticamente una copia completa del JSON y su marca de tiempo en el Object Store `api_cache` de **IndexedDB**.
   - **Paso 3 (Renderizado en línea)**: Muestra el banner verde indicador de **DATOS EN VIVO DESDE LA RED**.

3. **Fallback Automático a IndexedDB**:
   - **Paso 4 (Detección de fallo)**: Si el dispositivo se queda sin red (físicamente o simulado) o la petición falla:
   - **Paso 5 (Recuperación local)**: La aplicación intercepta el error y consulta inmediatamente el último estado almacenado en IndexedDB con `apiCacheDB.getCachedResponse(endpoint)`.
   - **Paso 6 (Renderizado sin conexión)**: Renderiza automáticamente los datos locales sin romper la interfaz y activa el banner naranja indicando **MODO OFFLINE / FALLBACK A INDEXEDDB**, mostrando la fecha y hora exacta del respaldo.

4. **Herramientas de Evaluación y Simulación**:
   - Interruptor (*switch*) interactivo para **Simular Modo Desconectado** sin necesidad de desactivar el Wi-Fi del ordenador.
   - Botón para vaciar la caché de IndexedDB y evaluar el comportamiento ante un estado sin datos previos.
   - Service Worker que precachea el Application Shell para que la página cargue y recargue completamente desconectada.

---

## 🛠️ Tecnologías Empleadas

- **Fetch API** y **AbortController** para consumo remoto.
- **IndexedDB API**: Almacenamiento no relacional estructurado de respuestas JSON completas y marcas de tiempo.
- **Service Worker & Cache API**: Precaching de los recursos estáticos del Application Shell.
- **Performance API**: Medición de latencia en milisegundos (`performance.now()`).

---

## 🚀 Cómo Probar el Ejercicio

1. Levanta el servidor local:
   ```bash
   python3 -m http.server 8000
   ```
2. Abre la URL `http://localhost:8000/Portafolio_2/Ejercicio_5/`.
3. Al cargar, verás el banner verde: **DATOS EN VIVO DESDE LA RED**, con productos renderizados y el tiempo de respuesta en milisegundos.
4. Activa el interruptor **"Simular Sin Red"** en la barra superior (o desactiva la conexión a internet de tu equipo):
   - El banner cambiará de inmediato a color ámbar: **MODO OFFLINE / FALLBACK A INDEXEDDB**.
   - Los productos continuarán visibles y utilizables, indicando la fecha y hora exacta en que fueron respaldados localmente en IndexedDB.
5. Haz clic en **"🔄 Actualizar Datos (Fetch)"** con el modo sin red activo: la aplicación intentará la red, detectará la desconexión y aplicará el fallback a IndexedDB de manera transparente.
6. Desactiva el interruptor y vuelve a presionar el botón: la aplicación volverá automáticamente a tomar los datos frescos de la red.
