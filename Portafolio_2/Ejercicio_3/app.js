/**
 * Portafolio 2 - Ejercicio 3: Notificaciones Push Locales desde el Service Worker
 * Implementación de Notification.requestPermission, navigator.serviceWorker.ready
 * y self.registration.showNotification.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const swBadge = document.getElementById('swBadge');
  const swBadgeText = document.getElementById('swBadgeText');
  const permBadge = document.getElementById('permBadge');
  const permBadgeText = document.getElementById('permBadgeText');
  const btnRequestPermission = document.getElementById('btnRequestPermission');

  const notifForm = document.getElementById('notifForm');
  const inpTitle = document.getElementById('inpTitle');
  const inpBody = document.getElementById('inpBody');
  const selIcon = document.getElementById('selIcon');
  const inpVibration = document.getElementById('inpVibration');
  const inpTag = document.getElementById('inpTag');
  const selDelay = document.getElementById('selDelay');
  const chkActions = document.getElementById('chkActions');
  const chkRenotify = document.getElementById('chkRenotify');
  const btnSendViaSW = document.getElementById('btnSendViaSW');

  const previewIcon = document.getElementById('previewIcon');
  const previewTitle = document.getElementById('previewTitle');
  const previewBody = document.getElementById('previewBody');
  const previewActions = document.getElementById('previewActions');

  const notifAlert = document.getElementById('notifAlert');
  const notifAlertMsg = document.getElementById('notifAlertMsg');

  const presetRecordatorio = document.getElementById('presetRecordatorio');
  const presetAlerta = document.getElementById('presetAlerta');
  const presetMensaje = document.getElementById('presetMensaje');

  // Application State
  let swRegistration = null;

  // =========================================================================
  // 1. REGISTRO DEL SERVICE WORKER (sw.js)
  // =========================================================================

  async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      swBadge.className = 'badge badge-denied';
      swBadgeText.textContent = 'No soportado';
      showAlert('Este navegador no soporta Service Workers.', 'danger');
      return;
    }

    try {
      // Registrar el Service Worker del ejercicio actual
      swRegistration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('[App] Service Worker registrado exitosamente con scope:', swRegistration.scope);

      // Esperar a que esté completamente activo
      await navigator.serviceWorker.ready;
      swBadge.className = 'badge badge-granted';
      swBadgeText.textContent = 'Activo & Listo';

      // Escuchar mensajes provenientes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_SENT') {
          console.log('[App] Confirmación recibida del Service Worker: Notificación emitida.');
        }
      });

    } catch (err) {
      console.error('[App] Error al registrar Service Worker:', err);
      swBadge.className = 'badge badge-denied';
      swBadgeText.textContent = 'Error al registrar';
      showAlert(`Fallo al registrar Service Worker: ${err.message}`, 'danger');
    }
  }

  // =========================================================================
  // 2. GESTIÓN DE PERMISOS DE NOTIFICACIÓN
  // =========================================================================

  function updatePermissionUI() {
    if (!('Notification' in window)) {
      permBadge.className = 'badge badge-denied';
      permBadgeText.textContent = 'No soportada';
      btnRequestPermission.disabled = true;
      showAlert('Notification API no es soportada por este navegador.', 'danger');
      return;
    }

    const permission = Notification.permission;
    permBadgeText.textContent = permission;
    permBadge.classList.remove('badge-granted', 'badge-prompt', 'badge-denied');

    if (permission === 'granted') {
      permBadge.classList.add('badge-granted');
      btnRequestPermission.disabled = true;
      btnRequestPermission.innerHTML = '✅ Permiso Concedido';
      showAlert('Permiso de notificaciones concedido. Puedes enviar notificaciones personalizadas.', 'success');
    } else if (permission === 'denied') {
      permBadge.classList.add('badge-denied');
      showAlert('Las notificaciones están bloqueadas. Habilítalas en los ajustes del sitio (candado de la URL).', 'danger');
    } else {
      permBadge.classList.add('badge-prompt');
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      updatePermissionUI();
      if (permission === 'granted') {
        showAlert('¡Permiso concedido exitosamente! Ahora puedes disparar notificaciones.', 'success');
      } else if (permission === 'denied') {
        showAlert('El usuario denegó los permisos de notificación.', 'warning');
      }
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      showAlert(`Error al solicitar permiso: ${error.message}`, 'danger');
    }
  }

  // =========================================================================
  // 3. DISPARO DE NOTIFICACIÓN MEDIANTE EL SERVICE WORKER
  // =========================================================================

  async function handleNotificationSubmit(e) {
    e.preventDefault();

    if (!('Notification' in window)) {
      showAlert('Este navegador no soporta la API de Notificaciones.', 'danger');
      return;
    }

    if (Notification.permission !== 'granted') {
      showAlert('Primero debes solicitar y conceder el permiso de notificación.', 'warning');
      await requestNotificationPermission();
      if (Notification.permission !== 'granted') return;
    }

    if (!swRegistration) {
      try {
        swRegistration = await navigator.serviceWorker.ready;
      } catch (err) {
        showAlert('El Service Worker no está activo todavía.', 'danger');
        return;
      }
    }

    // Parsear patrón de vibración (ej: "200, 100, 200" -> [200, 100, 200])
    const vibrationArr = inpVibration.value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));

    // Construcción del objeto de opciones avanzadas
    const notifOptions = {
      body: inpBody.value,
      icon: selIcon.value,
      badge: './icon.svg',
      vibrate: vibrationArr.length > 0 ? vibrationArr : [200, 100, 200],
      tag: inpTag.value.trim() || 'pwa-notif',
      renotify: chkRenotify.checked,
      data: {
        timestamp: Date.now(),
        origen: 'Ejercicio 3 - Portafolio 2'
      }
    };

    // Acciones interactivas (Action Buttons)
    if (chkActions.checked) {
      notifOptions.actions = [
        { action: 'explore', title: '🔍 Ver Detalles' },
        { action: 'dismiss', title: '✖️ Descartar' }
      ];
    }

    const title = inpTitle.value;
    const delay = parseInt(selDelay.value, 10) || 0;

    if (delay > 0) {
      showAlert(`Notificación programada para dispararse en ${delay / 1000} segundos. Puedes minimizar esta ventana para probarla...`, 'info');
      btnSendViaSW.disabled = true;

      setTimeout(async () => {
        await executeShowNotification(title, notifOptions);
        btnSendViaSW.disabled = false;
      }, delay);
    } else {
      await executeShowNotification(title, notifOptions);
    }
  }

  /**
   * Ejecuta el disparo de la notificación a través del Service Worker
   */
  async function executeShowNotification(title, options) {
    try {
      // 1. Método principal directo a través del registro del SW:
      await swRegistration.showNotification(title, options);

      // 2. Método complementario de comunicación con postMessage al SW:
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options
        });
      }

      showAlert('¡Notificación local enviada y ejecutada por el Service Worker!', 'success');
    } catch (error) {
      console.error('Error al ejecutar showNotification:', error);
      showAlert(`Fallo al emitir la notificación: ${error.message}`, 'danger');
    }
  }

  // =========================================================================
  // 4. VISTA PREVIA REACTIVA (MOCKUP EN VIVO) & PLANTILLAS
  // =========================================================================

  function updateMockup() {
    previewTitle.textContent = inpTitle.value || 'Título';
    previewBody.textContent = inpBody.value || 'Mensaje de la notificación';
    previewIcon.src = selIcon.value;
    previewActions.style.display = chkActions.checked ? 'flex' : 'none';
  }

  inpTitle.addEventListener('input', updateMockup);
  inpBody.addEventListener('input', updateMockup);
  selIcon.addEventListener('change', updateMockup);
  chkActions.addEventListener('change', updateMockup);

  // Plantillas Rápidas
  presetRecordatorio.addEventListener('click', () => {
    inpTitle.value = '⏰ Recordatorio de Entrega';
    inpBody.value = 'El Portafolio de Ejercicios 2 de PWA debe ser entregado hoy antes de la fecha límite.';
    inpVibration.value = '200, 100, 200, 100, 400';
    inpTag.value = 'recordatorio-tarea';
    updateMockup();
  });

  presetAlerta.addEventListener('click', () => {
    inpTitle.value = '⚠️ Alerta de Almacenamiento';
    inpBody.value = 'La caché dinámica ha guardado nuevos datos locales para uso sin conexión.';
    inpVibration.value = '100, 50, 100, 50, 100';
    inpTag.value = 'alerta-sistema';
    updateMockup();
  });

  presetMensaje.addEventListener('click', () => {
    inpTitle.value = '💬 Nuevo Mensaje Recibido';
    inpBody.value = 'Profesor: Excelente implementación del Service Worker y notificaciones locales.';
    inpVibration.value = '300, 100, 300';
    inpTag.value = 'mensaje-chat';
    updateMockup();
  });

  function showAlert(msg, type = 'info') {
    notifAlert.style.display = 'flex';
    notifAlert.className = `alert alert-${type}`;
    notifAlertMsg.textContent = msg;
  }

  // Event Listeners Principales
  btnRequestPermission.addEventListener('click', requestNotificationPermission);
  notifForm.addEventListener('submit', handleNotificationSubmit);

  // Inicialización
  initServiceWorker();
  updatePermissionUI();
  updateMockup();
});

