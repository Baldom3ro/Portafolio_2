# Ejercicio 1: Consulta de Permisos y Geolocalización

Este ejercicio implementa capacidades avanzadas de una Aplicación Web Progresiva (PWA) para interactuar con hardware del cliente y consultar el sistema de seguridad y permisos del navegador.

---

## 📋 Objetivos Cumplidos

1. **Permissions API (`navigator.permissions.query`)**:
   - Consulta explícita del estado del permiso de geolocalización (`{ name: 'geolocation' }`).
   - Gestión de los tres estados posibles: `granted` (concedido), `prompt` (pregunta al usuario) y `denied` (denegado).
   - Detección reactiva de cambios mediante el evento `permissionStatus.onchange`.
   - Consulta complementaria de otros permisos de hardware (cámara, notificaciones, portapapeles).

2. **Geolocation API (`navigator.geolocation.getCurrentPosition`)**:
   - Solicitud de coordenadas satelitales al hardware con soporte de alta precisión (`enableHighAccuracy: true`, `timeout: 12000`).
   - Manejo exhaustivo de errores: `PERMISSION_DENIED`, `POSITION_UNAVAILABLE` y `TIMEOUT`.
   - Modo de seguimiento continuo (`watchPosition` y `clearWatch`).

3. **Despliegue de Datos y Mapa Interactivo**:
   - Despliegue numérico y telemétrico: Latitud, Longitud, Precisión ($\pm$ metros), Altitud, Velocidad y Timestamp.
   - Integración con la librería de mapas **Leaflet.js** y teselas de **OpenStreetMap**.
   - Marcador interactivo centrado en la ubicación exacta del usuario, con popup de información y círculo de precisión geodésica.
   - Opciones para copiar coordenadas y abrir en mapa satelital externo.

---

## 🛠️ Tecnologías y Web APIs Empleadas

- **JavaScript ES6+** (Asíncrono, Arrow Functions, Destructuring).
- **Permissions API**: `navigator.permissions.query()`, `PermissionStatus.state`, `PermissionStatus.onchange`.
- **Geolocation API**: `navigator.geolocation.getCurrentPosition()`, `navigator.geolocation.watchPosition()`, `navigator.geolocation.clearWatch()`.
- **Leaflet 1.9.4**: Renderizado vectorial y rasterizado de OpenStreetMap sin costo de tokens ni claves API.
- **HTML5 & CSS3 Moderno**: Variables CSS personalizadas, Flexbox, CSS Grid y diseño responsivo adaptado a dispositivos móviles.

---

## 🚀 Cómo Probar el Ejercicio

1. Levanta un servidor local en la raíz del proyecto o abre la carpeta con una extensión como *Live Server* en VS Code:
   ```bash
   npx serve .
   # o
   python3 -m http.server 8000
   ```
2. Abre tu navegador en `http://localhost:8000/Portafolio_2/Ejercicio_1/`.
3. Haz clic en **"Obtener Ubicación Actual"** y acepta el diálogo de permisos del navegador.
4. Observa cómo el badge de permisos cambia a verde (`granted`) y el mapa se centra instantáneamente en tu posición.
5. Haz clic en el icono del candado en la barra de direcciones de tu navegador para revocar el permiso y nota cómo el detector `onchange` actualiza la UI automáticamente a `denied`.

