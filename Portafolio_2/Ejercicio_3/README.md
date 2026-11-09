# Ejercicio 3: Notificaciones Push Locales desde el Service Worker

Este ejercicio demuestra la integración entre la **API de Notificaciones**, la **API de Service Workers** y las capacidades nativas del sistema operativo en una Aplicación Web Progresiva.

---

## 📋 Objetivos Cumplidos

1. **Solicitud de Permisos (`Notification.requestPermission`)**:
   - Verificación del estado de permisos: `default`, `granted` y `denied`.
   - Diálogo explícito para solicitar autorización del usuario.
   - Manejo de interfaz adaptativa según la decisión del usuario.

2. **Registro y Ciclo de Vida del Service Worker (`sw.js`)**:
   - Registro con `navigator.serviceWorker.register('./sw.js')`.
   - Control inmediato del ciclo de vida con `skipWaiting()` y `clients.claim()`.
   - Recepción de mensajes en segundo plano (`message` event) entre la aplicación y el SW.

3. **Disparo de Notificaciones Personalizadas (`self.registration.showNotification`)**:
   - Notificaciones con parámetros completos:
     - **Título**: Encabezado destacado.
     - **Cuerpo (`body`)**: Mensaje informativo multilínea.
     - **Icono (`icon`)**: Vectorial SVG o mapa de bits PNG optimizado.
     - **Vibración (`vibrate`)**: Patrones de pulsos hápicos (ej. `[200, 100, 200]`).
     - **Tag & Renotify**: Identificador para agrupar o reemplazar notificaciones previas.
     - **Acciones interactivas (`actions`)**: Botones ejecutables desde la bandeja del sistema (*"Ver Detalles"* y *"Descartar"*).
   - Programación con retardo (temporizador en segundo plano) para probar la recepción fuera de la pestaña activa.

4. **Gestión de Eventos en Segundo Plano**:
   - Captura del evento `notificationclick` en `sw.js`.
   - Enfoque automático de la pestaña existente (`client.focus()`) o apertura de la aplicación (`clients.openWindow('./')`).
   - Cierre controlado de la notificación con `event.notification.close()`.

---

## 🛠️ Tecnologías Empleadas

- **Notification Web API**: `Notification.permission`, `Notification.requestPermission()`.
- **Service Worker API**: `ServiceWorkerRegistration.showNotification()`, `self.registration`, `clients.matchAll()`.
- **Vibration API**: Propiedad `vibrate` con matrices de milisegundos.
- **HTML5 & Modern CSS**: Simulador / Mockup en tiempo real del aspecto de la notificación en el sistema operativo.

---

## 🚀 Cómo Probar el Ejercicio

1. Levanta un servidor local:
   ```bash
   python3 -m http.server 8000
   ```
2. Accede a `http://localhost:8000/Portafolio_2/Ejercicio_3/`.
3. Haz clic en **"🛡️ Solicitar Permiso de Notificación"** y presiona **Permitir** en el cuadro de diálogo.
4. Elige una plantilla rápida (por ejemplo *Recordatorio PWA*) o personaliza el título y cuerpo.
5. Selecciona el retardo **"En 3 segundos"** o **"En 5 segundos"**.
6. Haz clic en **"🚀 Disparar Notificación con Service Worker"**.
7. Cambia inmediatamente a otra pestaña o minimiza tu navegador: verás cómo la notificación nativa se dispara en la bandeja de tu sistema operativo con su icono y botones de acción.
8. Al hacer clic sobre la notificación, el Service Worker te llevará de vuelta a la aplicación enfocarla.

