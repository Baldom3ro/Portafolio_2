/**
 * Portafolio 2 - Ejercicio 2: Captura de Medios con Cámara Web/Móvil
 * Implementación de Media Capture and Streams API (navigator.mediaDevices.getUserMedia)
 * y HTML5 Canvas 2D API (ctx.drawImage, toDataURL).
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const videoFeed = document.getElementById('videoFeed');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const liveIndicators = document.getElementById('liveIndicators');
  const streamBadge = document.getElementById('streamBadge');
  const streamBadgeText = document.getElementById('streamBadgeText');

  const cameraSelect = document.getElementById('cameraSelect');
  const chkMirror = document.getElementById('chkMirror');
  const chkHD = document.getElementById('chkHD');

  const btnStartCamera = document.getElementById('btnStartCamera');
  const btnStopCamera = document.getElementById('btnStopCamera');
  const btnSwitchFacing = document.getElementById('btnSwitchFacing');
  const btnCapturePhoto = document.getElementById('btnCapturePhoto');

  const photoCanvas = document.getElementById('photoCanvas');
  const canvasPlaceholder = document.getElementById('canvasPlaceholder');
  const btnDownloadPhoto = document.getElementById('btnDownloadPhoto');

  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryContainer = document.getElementById('galleryContainer');
  const galleryCount = document.getElementById('galleryCount');
  const btnClearGallery = document.getElementById('btnClearGallery');
  const emptyGalleryMsg = document.getElementById('emptyGalleryMsg');

  const valRes = document.getElementById('valRes');
  const valFps = document.getElementById('valFps');
  const valAspect = document.getElementById('valAspect');
  const valFacing = document.getElementById('valFacing');

  const cameraAlert = document.getElementById('cameraAlert');
  const cameraAlertMsg = document.getElementById('cameraAlertMsg');

  // Application State
  let currentStream = null;
  let activeFacingMode = 'user'; // 'user' (frontal) o 'environment' (trasera)
  let activeFilter = 'none';
  let captures = [];

  // =========================================================================
  // 1. GESTIÓN DEL FLUJO DE CÁMARA (getUserMedia)
  // =========================================================================

  /**
   * Solicita acceso al hardware de video y enlaza el flujo al <video>
   */
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showAlert('La API navigator.mediaDevices.getUserMedia no es soportada por este navegador.', 'danger');
      return;
    }

    // Detener flujo previo si existe
    stopCameraTracks();

    showAlert('Solicitando acceso a la cámara...', 'info');

    // Configuración de restricciones (Constraints)
    const constraints = {
      audio: false,
      video: {
        facingMode: activeFacingMode,
        width: chkHD.checked ? { ideal: 1920, min: 1280 } : { ideal: 640 },
        height: chkHD.checked ? { ideal: 1080, min: 720 } : { ideal: 480 }
      }
    };

    // Si se seleccionó un dispositivo específico en el desplegable
    if (cameraSelect.value) {
      delete constraints.video.facingMode;
      constraints.video.deviceId = { exact: cameraSelect.value };
    }

    try {
      // LLAMADA CLAVE A LA WEB API
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Renderizar flujo en el elemento <video>
      videoFeed.srcObject = currentStream;
      videoPlaceholder.style.display = 'none';
      videoFeed.style.display = 'block';
      liveIndicators.style.display = 'flex';

      // Actualizar estado visual
      streamBadge.className = 'badge badge-granted';
      streamBadgeText.textContent = 'Cámara Activa';

      btnStartCamera.disabled = true;
      btnStopCamera.disabled = false;
      btnCapturePhoto.disabled = false;

      applyMirrorEffect();

      // Al cargarse los metadatos del video, leer propiedades del hardware
      videoFeed.onloadedmetadata = () => {
        updateHardwareTelemetry();
      };

      // Enumerar cámaras disponibles para el selector
      await populateCameraDevices();

      showAlert('¡Cámara conectada exitosamente! Flujo de video transmitiendo.', 'success');

    } catch (error) {
      console.error('Error al acceder a getUserMedia:', error);
      handleCameraError(error);
    }
  }

  /**
   * Detiene todos los tracks activos y libera el hardware de la cámara
   */
  function stopCameraTracks() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log(`[MediaTrack] Pista detenida: ${track.kind} (${track.label})`);
      });
      currentStream = null;
    }

    if (videoFeed.srcObject) {
      videoFeed.srcObject = null;
    }

    videoFeed.style.display = 'none';
    videoPlaceholder.style.display = 'flex';
    liveIndicators.style.display = 'none';

    streamBadge.className = 'badge badge-denied';
    streamBadgeText.textContent = 'Cámara Inactiva';

    btnStartCamera.disabled = false;
    btnStopCamera.disabled = true;
    btnCapturePhoto.disabled = true;

    valRes.textContent = '-- x --';
    valFps.textContent = '-- fps';
    valAspect.textContent = '--';
    valFacing.textContent = '--';
  }

  /**
   * Alterna entre cámara frontal y trasera
   */
  function switchFacingMode() {
    activeFacingMode = activeFacingMode === 'user' ? 'environment' : 'user';
    cameraSelect.value = ''; // Limpiar ID fijo para permitir cambio de lente
    showAlert(`Cambiando al modo: ${activeFacingMode === 'user' ? 'Frontal' : 'Trasera / Entorno'}`, 'info');
    startCamera();
  }

  /**
   * Aplica o remueve el efecto espejo si es cámara frontal
   */
  function applyMirrorEffect() {
    if (chkMirror.checked && activeFacingMode === 'user') {
      videoFeed.classList.add('mirror');
    } else {
      videoFeed.classList.remove('mirror');
    }
  }

  /**
   * Llena el <select> con las cámaras detectadas en el sistema
   */
  async function populateCameraDevices() {
    if (!navigator.mediaDevices.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      cameraSelect.innerHTML = '';
      if (videoDevices.length === 0) {
        cameraSelect.innerHTML = '<option value="">Cámara por defecto</option>';
        return;
      }

      videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Cámara ${index + 1} (${device.deviceId.slice(0, 8)}...)`;
        cameraSelect.appendChild(option);
      });

      // Seleccionar el dispositivo activo si se conoce
      if (currentStream) {
        const activeTrack = currentStream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings();
          if (settings.deviceId) {
            cameraSelect.value = settings.deviceId;
          }
        }
      }
    } catch (e) {
      console.warn('Error al enumerar dispositivos:', e);
    }
  }

  /**
   * Extrae resolución y propiedades reales del track de video
   */
  function updateHardwareTelemetry() {
    if (!currentStream) return;
    const track = currentStream.getVideoTracks()[0];
    if (!track) return;

    const settings = track.getSettings();
    const width = settings.width || videoFeed.videoWidth || '--';
    const height = settings.height || videoFeed.videoHeight || '--';

    valRes.textContent = `${width} x ${height}`;
    valFps.textContent = settings.frameRate ? `${Math.round(settings.frameRate)} fps` : '30 fps';

    if (width && height && typeof width === 'number') {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height);
      valAspect.textContent = `${width / divisor}:${height / divisor}`;
    } else {
      valAspect.textContent = 'Auto';
    }

    valFacing.textContent = settings.facingMode || activeFacingMode;
  }

  /**
   * Manejador de excepciones comunes de getUserMedia
   */
  function handleCameraError(error) {
    let msg = '';
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        msg = 'Permiso denegado: El usuario o el navegador bloquearon el acceso a la cámara.';
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        msg = 'No se encontró hardware de cámara conectado al dispositivo.';
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        msg = 'La cámara ya está siendo utilizada por otra aplicación o pestaña del sistema.';
        break;
      case 'OverconstrainedError':
        msg = 'Las restricciones de resolución o lente no pueden ser satisfechas por este dispositivo.';
        break;
      default:
        msg = `Error de cámara (${error.name}): ${error.message}`;
    }
    showAlert(msg, 'danger');
    stopCameraTracks();
  }

  // =========================================================================
  // 2. CAPTURA DE FOTOGRAFÍA ESTÁTICA EN CANVAS (HTML5 Canvas 2D)
  // =========================================================================

  /**
   * Captura el fotograma actual del <video> y lo plasma en el <canvas>
   */
  function capturePhoto() {
    if (!currentStream || !videoFeed.videoWidth) {
      showAlert('No hay un flujo de video disponible para capturar.', 'warning');
      return;
    }

    const width = videoFeed.videoWidth;
    const height = videoFeed.videoHeight;

    // Asignar resolución real del fotograma al elemento canvas
    photoCanvas.width = width;
    photoCanvas.height = height;

    const ctx = photoCanvas.getContext('2d');

    // Guardar estado del contexto
    ctx.save();

    // Si está en modo espejo y es cámara frontal, invertir horizontalmente en el canvas
    if (chkMirror.checked && activeFacingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    // Aplicar filtro seleccionado
    ctx.filter = activeFilter;

    // DIBUJAR FOTOGRAMA DEL VIDEO EN EL CANVAS
    ctx.drawImage(videoFeed, 0, 0, width, height);

    // Restaurar contexto
    ctx.restore();

    // Mostrar canvas y ocultar placeholder
    canvasPlaceholder.style.display = 'none';
    photoCanvas.style.display = 'block';
    btnDownloadPhoto.disabled = false;

    // Generar Data URL para galería
    const dataUrl = photoCanvas.toDataURL('image/png');
    addPhotoToGallery(dataUrl);

    showAlert('¡Fotografía capturada con éxito en el elemento Canvas!', 'success');
  }

  /**
   * Descarga la imagen actual del canvas en archivo PNG
   */
  function downloadPhoto() {
    const dataUrl = photoCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `pwa-captura-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  }

  // =========================================================================
  // 3. GALERÍA Y FILTROS
  // =========================================================================

  function addPhotoToGallery(dataUrl) {
    if (emptyGalleryMsg) emptyGalleryMsg.style.display = 'none';
    btnClearGallery.style.display = 'inline-block';

    const timestamp = new Date().toLocaleTimeString();
    captures.unshift({ id: Date.now(), dataUrl, timestamp });
    galleryCount.textContent = captures.length;

    renderGallery();
  }

  function renderGallery() {
    galleryContainer.innerHTML = '';

    if (captures.length === 0) {
      galleryContainer.innerHTML = `
        <p id="emptyGalleryMsg" style="color: var(--text-dim); font-size: 0.85rem; grid-column: 1 / -1; text-align: center; padding: 1rem;">
          No hay capturas recientes en esta sesión.
        </p>
      `;
      btnClearGallery.style.display = 'none';
      return;
    }

    captures.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.innerHTML = `
        <img src="${item.dataUrl}" alt="Captura ${item.timestamp}">
        <div class="gallery-item-actions">
          <button class="gallery-btn" title="Descargar" onclick="window.downloadFromGallery('${item.dataUrl}')">💾</button>
          <button class="gallery-btn" title="Eliminar" onclick="window.deleteFromGallery(${item.id})">🗑️</button>
        </div>
      `;
      galleryContainer.appendChild(el);
    });
  }

  window.downloadFromGallery = (dataUrl) => {
    const link = document.createElement('a');
    link.download = `captura-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  window.deleteFromGallery = (id) => {
    captures = captures.filter(c => c.id !== id);
    galleryCount.textContent = captures.length;
    renderGallery();
  };

  btnClearGallery.addEventListener('click', () => {
    captures = [];
    galleryCount.textContent = '0';
    renderGallery();
  });

  // Filtros
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      // Si ya hay foto en el canvas, volver a dibujar con el nuevo filtro
      if (photoCanvas.style.display !== 'none' && currentStream) {
        capturePhoto();
      }
    });
  });

  // =========================================================================
  // 4. LISTENERS DE EVENTOS
  // =========================================================================

  btnStartCamera.addEventListener('click', startCamera);
  btnStopCamera.addEventListener('click', () => {
    stopCameraTracks();
    showAlert('Cámara apagada y recursos liberados.', 'info');
  });

  btnSwitchFacing.addEventListener('click', switchFacingMode);
  btnCapturePhoto.addEventListener('click', capturePhoto);
  btnDownloadPhoto.addEventListener('click', downloadPhoto);

  chkMirror.addEventListener('change', applyMirrorEffect);
  cameraSelect.addEventListener('change', () => {
    if (currentStream) startCamera();
  });

  function showAlert(msg, type = 'info') {
    cameraAlert.style.display = 'flex';
    cameraAlert.className = `alert alert-${type}`;
    cameraAlertMsg.textContent = msg;
  }
});

