/**
 * Service Worker para Ejercicio 3: Notificaciones Push Locales
 * Gestiona el ciclo de vida del SW, la recepción de mensajes y el despliegue
 * de notificaciones mediante self.registration.showNotification.
 */

const SW_VERSION = 'v1.0.0';

// Evento Install: activa inmediatamente el nuevo Service Worker
self.addEventListener('install', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Instalando y saltando espera (skipWaiting)...`);
  self.skipWaiting();
});

// Evento Activate: toma control inmediato de todas las pestañas abiertas
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Activado. Tomando control de clientes (claim)...`);
  event.waitUntil(self.clients.claim());
});

// Evento Message: Recibe la instrucción desde el hilo principal (app.js)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido desde app.js:', event.data);

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;

    // Disparo explícito de la notificación desde el registro del Service Worker
    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('[Service Worker] self.registration.showNotification ejecutado exitosamente.');
          // Notificar de vuelta al cliente si es necesario
          if (event.source) {
            event.source.postMessage({ type: 'NOTIFICATION_SENT', success: true });
          }
        })
        .catch((err) => {
          console.error('[Service Worker] Error al mostrar notificación:', err);
        })
    );
  }
});

// Evento notificationclick: Maneja la interacción cuando el usuario hace clic en la notificación o sus botones
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  console.log(`[Service Worker] Clic en notificación: Acción "${action || 'cuerpo_notificacion'}"`);

  // Cerrar la notificación
  notification.close();

  if (action === 'dismiss') {
    console.log('[Service Worker] Notificación descartada por el usuario.');
    return;
  }

  // Acción por defecto o 'explore': Enfocar pestaña existente o abrir una nueva
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta de este origen, enfocarla
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

// Evento notificationclose: Registra cuando el usuario descarta manualmente la notificación
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificación cerrada por el usuario:', event.notification.tag);
});

