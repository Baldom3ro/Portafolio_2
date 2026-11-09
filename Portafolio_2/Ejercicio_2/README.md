# Ejercicio 2: Captura de Medios con Cámara Web/Móvil

Este ejercicio implementa las capacidades multimedia de una Aplicación Web Progresiva (PWA) para interactuar directamente con el hardware óptico (cámaras web, cámaras integradas de laptops y sensores fotográficos móviles).

---

## 📋 Objetivos Cumplidos

1. **Acceso al Hardware Óptico (`navigator.mediaDevices.getUserMedia`)**:
   - Petición de permisos de video al usuario mediante `getUserMedia({ video: constraints, audio: false })`.
   - Soporte para alternar lentes entre cámara frontal (`facingMode: 'user'`) y cámara trasera/entorno (`facingMode: 'environment'`).
   - Detección y enumeración dinámica de dispositivos de entrada de video (`navigator.mediaDevices.enumerateDevices`).
   - Liberación explícita de hardware al detener los tracks con `track.stop()`.

2. **Renderizado del Flujo en Vivo (`<video>`)**:
   - Conexión del `MediaStream` al atributo `srcObject` del elemento `<video autoplay playsinline muted>`.
   - Efecto espejo (*mirroring*) opcional para cámaras frontales.
   - Extracción de telemetría de hardware en tiempo real: resolución efectiva, tasa de cuadros (*frameRate*), relación de aspecto y etiqueta del dispositivo.

3. **Captura de Fotogramas Estáticos (`<canvas>`)**:
   - Congelamiento instantáneo del fotograma sobre un elemento `<canvas>` usando la API 2D: `ctx.drawImage(video, 0, 0, width, height)`.
   - Aplicación de filtros gráficos nativos en tiempo de renderizado: Escala de Grises, Sepia, Inversión, Alto Contraste y Desenfoque.
   - Exportación y descarga directa del fotograma como archivo PNG con `canvas.toDataURL('image/png')`.
   - Historial y galería en miniatura de las fotografías capturadas durante la sesión.

---

## 🛠️ Tecnologías Empleadas

- **Media Capture and Streams API**: `navigator.mediaDevices.getUserMedia`, `MediaStreamTrack`, `enumerateDevices`.
- **HTML5 Canvas 2D Context**: `CanvasRenderingContext2D.drawImage()`, `ctx.filter`, `HTMLCanvasElement.toDataURL()`.
- **HTML5 `<video>` & `<canvas>` elements**.
- **JavaScript Asíncrono (Async/Await & Promises)**.

---

## 🚀 Cómo Probar el Ejercicio

1. Inicia un servidor local en el puerto deseado:
   ```bash
   python3 -m http.server 8000
   ```
2. Navega a `http://localhost:8000/Portafolio_2/Ejercicio_2/`.
3. Haz clic en **"▶️ Iniciar Cámara"** y acepta el permiso en la ventana emergente del navegador.
4. Observa el video en vivo y la telemetría de resolución en la columna izquierda.
5. Haz clic en **"📸 Capturar Fotografía al Canvas"** para congelar el fotograma actual.
6. Selecciona cualquier filtro fotográfico (ej. *Sepia* o *Blanco y Negro*) y haz clic en **"💾 Descargar PNG"** para guardar la foto localmente.
7. Presiona **"⏹️ Detener Cámara"** para verificar que el hardware se apague correctamente (el led indicador de la cámara se apagará).

