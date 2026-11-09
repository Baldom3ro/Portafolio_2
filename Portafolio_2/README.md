# Portafolio de Ejercicios 2: Capacidades Avanzadas en Aplicaciones Web Progresivas (PWA)

Este repositorio contiene la solución completa a los 5 ejercicios prácticos individuales orientados a dotar a una Aplicación Web Progresiva de capacidades avanzadas de hardware, gestión explícita de permisos, persistencia transaccional y resiliencia offline.

Repositorio oficial: [https://github.com/Baldom3ro/Portafolio_2.git](https://github.com/Baldom3ro/Portafolio_2.git)

---

## 📁 Estructura del Proyecto

```text
Portafolio_2/
├── index.html                   # Portal y panel interactivo con acceso a los 5 ejercicios
├── styles.css                   # Sistema de diseño moderno compartido
│
├── Ejercicio_1/                 # Ejercicio 1: Consulta de Permisos y Geolocalización
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── README.md
│
├── Ejercicio_2/                 # Ejercicio 2: Captura de Medios con Cámara Web/Móvil
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── README.md
│
├── Ejercicio_3/                 # Ejercicio 3: Notificaciones Push Locales desde Service Worker
│   ├── index.html
│   ├── app.js
│   ├── sw.js                   # Service Worker para disparo y control de notificaciones
│   ├── icon.svg                # Icono vectorial de notificación
│   ├── icon-192.png            # Icono PNG 192x192
│   ├── styles.css
│   └── README.md
│
├── Ejercicio_4/                 # Ejercicio 4: Persistencia Asíncrona con IndexedDB
│   ├── index.html
│   ├── db.js                   # Módulo transaccional con Promesas para IndexedDB
│   ├── app.js                  # Interfaz CRUD completa (Insertar, Consultar, Editar, Eliminar)
│   ├── styles.css
│   └── README.md
│
└── Ejercicio_5/                 # Ejercicio 5: Estrategia de Caché Dinámica con Fallback
    ├── index.html
    ├── sw.js                   # Service Worker para caching del Application Shell
    ├── db.js                   # Capa IndexedDB para respaldo de respuestas JSON
    ├── app.js                  # Lógica Network-First con Fallback automático a IndexedDB
    ├── styles.css
    └── README.md
```

---

## 🚀 Resumen de los Ejercicios Desarrollados

### 📍 Ejercicio 1: Consulta de Permisos y Geolocalización
- **Permissions API**: Verificación en tiempo real del estado del permiso (`navigator.permissions.query({ name: 'geolocation' })`). Detección reactiva de cambios en vivo mediante el evento `permissionStatus.onchange`.
- **Geolocation API**: Solicitud de coordenadas precisas con `navigator.geolocation.getCurrentPosition` (y seguimiento continuo con `watchPosition`).
- **Mapa Interactivo**: Integración con la librería **Leaflet.js** y teselas de **OpenStreetMap** con marcador de posición, círculo de precisión geodésica, copia de coordenadas y telemetría completa.

### 📷 Ejercicio 2: Captura de Medios con Cámara Web/Móvil
- **MediaStream API**: Acceso directo al hardware de video mediante `navigator.mediaDevices.getUserMedia` con enumeración de cámaras conectadas (`enumerateDevices`) y selector para alternar lentes frontal (`user`) y trasera (`environment`).
- **Flujo en Vivo**: Renderizado directo en elemento HTML5 `<video>` con efecto espejo opcional y liberación adecuada de hardware (`track.stop()`).
- **Captura en Canvas**: Congelamiento del fotograma sobre `<canvas>` con `drawImage()`, aplicación de filtros fotográficos nativos (B&N, Sepia, Invertir, Alto Contraste) y descarga en archivo PNG.

### 🔔 Ejercicio 3: Notificaciones Push Locales desde el Service Worker
- **Notification API**: Solicitud explícita de permisos al usuario (`Notification.requestPermission()`).
- **Service Worker Lifecycle**: Registro de `sw.js` con `skipWaiting()` y `clients.claim()`.
- **Notificaciones Enriquecidas**: Disparo mediante `self.registration.showNotification()` con título, cuerpo multilínea, icono, patrón de vibración hápica, tag de agrupación y botones de acción interactivos.
- **Manejo de Clics**: Intercepción del evento `notificationclick` para enfocar la pestaña activa o abrir la ventana.

### 🗄️ Ejercicio 4: Persistencia de Datos Asíncrona con IndexedDB
- **Base de Datos Transaccional**: Creación de la base de datos `PortfolioPWA_DB` con Object Store `registros` e índices para `categoria`, `fecha`, `prioridad` y `estado`.
- **CRUD Asíncrono Completo**: Implementación nativa con Promesas para **Insertar** (`add`), **Consultar** (`getAll`/`get`), **Actualizar** (`put`) y **Eliminar** (`delete`/`clear`).
- **Operatividad 100% Offline**: Funciona completamente sin internet, con buscador en tiempo real, cambio de estado ágil, carga de registros de prueba y exportación a JSON.

### 🔄 Ejercicio 5: Estrategia de Caché Dinámica con Fallback a IndexedDB / Network-First
- **Consumo REST**: Peticiones remotas mediante `fetch()` a APIs en vivo (DummyJSON y JSONPlaceholder).
- **Network-First**: Si hay red, consume los datos en vivo del servidor y almacena automáticamente una copia del JSON en **IndexedDB**.
- **Fallback Automático**: Si el dispositivo se queda sin red (físicamente o usando el simulador integrado), la interfaz recupera y renderiza al instante el último JSON almacenado en IndexedDB, mostrando un banner indicador de estado con la fecha y hora del respaldo.

---

## 🛠️ Cómo Ejecutar el Proyecto

1. Clona el repositorio o sitúate en la carpeta raíz del proyecto:
   ```bash
   git clone https://github.com/Baldom3ro/Portafolio_2.git
   cd Portafolio_2
   ```

2. Inicia un servidor web local (los Service Workers y las Web APIs requieren contexto seguro `http://localhost` o `https://`):
   ```bash
   # Opción con Python 3:
   python3 -m http.server 8000

   # Opción con Node.js npx:
   npx serve .
   ```

3. Abre en tu navegador preferido:
   ```text
   http://localhost:8000/
   # o directamente:
   http://localhost:8000/Portafolio_2/
   ```

4. Explora el panel interactivo y navega entre los 5 ejercicios prácticos.

