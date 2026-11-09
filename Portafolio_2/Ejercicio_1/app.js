/**
 * Portafolio 2 - Ejercicio 1: Consulta de Permisos y Geolocalización
 * Implementación de Permissions API (navigator.permissions.query)
 * y Geolocation API (navigator.geolocation.getCurrentPosition / watchPosition)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const permBadge = document.getElementById('permBadge');
  const permText = document.getElementById('permText');
  const btnRefreshPerm = document.getElementById('btnRefreshPerm');
  const permCamera = document.getElementById('permCamera');
  const permNotifications = document.getElementById('permNotifications');
  const permClipboard = document.getElementById('permClipboard');

  const btnGetLocation = document.getElementById('btnGetLocation');
  const btnWatchLocation = document.getElementById('btnWatchLocation');
  const btnStopWatch = document.getElementById('btnStopWatch');
  const chkHighAccuracy = document.getElementById('chkHighAccuracy');

  const valLat = document.getElementById('valLat');
  const valLng = document.getElementById('valLng');
  const valAccuracy = document.getElementById('valAccuracy');
  const valAltitude = document.getElementById('valAltitude');
  const valSpeed = document.getElementById('valSpeed');
  const valTimestamp = document.getElementById('valTimestamp');

  const btnCopyCoords = document.getElementById('btnCopyCoords');
  const btnRecenter = document.getElementById('btnRecenter');
  const btnExternalMap = document.getElementById('btnExternalMap');

  const statusAlert = document.getElementById('statusAlert');
  const statusAlertMsg = document.getElementById('statusAlertMsg');

  const mapPlaceholder = document.getElementById('mapPlaceholder');
  const leafletMapDiv = document.getElementById('leafletMap');

  // Application State
  let map = null;
  let marker = null;
  let accuracyCircle = null;
  let currentCoords = null;
  let watchId = null;

  // =========================================================================
  // 1. GESTIÓN DE PERMISOS (Permissions API)
  // =========================================================================

  /**
   * Actualiza el badge visual según el estado del permiso
   */
  function updatePermissionUI(state) {
    permBadge.classList.remove('badge-granted', 'badge-prompt', 'badge-denied');

    switch (state) {
      case 'granted':
        permBadge.classList.add('badge-granted');
        permText.textContent = 'Concedido (granted)';
        showAlert('Permiso de geolocalización concedido. Puedes obtener tu posición.', 'success');
        break;
      case 'prompt':
        permBadge.classList.add('badge-prompt');
        permText.textContent = 'Preguntar al usuario (prompt)';
        showAlert('El navegador solicitará permiso cuando intentes obtener la ubicación.', 'warning');
        break;
      case 'denied':
        permBadge.classList.add('badge-denied');
        permText.textContent = 'Denegado (denied)';
        showAlert('El acceso a la ubicación fue bloqueado. Habilítalo en la configuración del navegador (candado en la barra de URL).', 'danger');
        break;
      default:
        permText.textContent = state;
    }
  }

  /**
   * Consulta el permiso de Geolocalización y añade listener de cambio de estado
   */
  async function checkGeolocationPermission() {
    if (!('permissions' in navigator)) {
      permText.textContent = 'Permissions API no soportada';
      permBadge.className = 'badge badge-warning';
      return;
    }

    try {
      // Consulta explícita a la Permissions API
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      updatePermissionUI(permissionStatus.state);

      // Listener para detectar cambios en vivo (ej. si el usuario revoca permisos en el candado)
      permissionStatus.onchange = () => {
        console.log(`[Permissions API] El estado cambió a: ${permissionStatus.state}`);
        updatePermissionUI(permissionStatus.state);
      };
    } catch (error) {
      console.warn('Error al consultar permiso de geolocalización:', error);
      permText.textContent = 'No soportado o restringido';
    }
  }

  /**
   * Consulta permisos complementarios para demostración
   */
  async function checkAuxiliaryPermissions() {
    if (!('permissions' in navigator)) return;

    const check = async (name, element) => {
      try {
        const res = await navigator.permissions.query({ name });
        element.textContent = res.state;
        element.className = `badge ${res.state === 'granted' ? 'badge-granted' : res.state === 'prompt' ? 'badge-prompt' : 'badge-denied'}`;
      } catch (e) {
        element.textContent = 'N/A';
        element.className = 'badge badge-secondary';
      }
    };

    check('camera', permCamera);
    check('notifications', permNotifications);
    check('clipboard-read', permClipboard);
  }

  // =========================================================================
  // 2. ACCESO AL GPS Y OBTENCIÓN DE COORDENADAS (Geolocation API)
  // =========================================================================

  /**
   * Opciones para la captura de geolocalización
   */
  function getGeoOptions() {
    return {
      enableHighAccuracy: chkHighAccuracy.checked,
      timeout: 12000,      // Tiempo máximo de espera (ms)
      maximumAge: 0        // No usar datos cacheados antiguos
    };
  }

  /**
   * Solicita la posición única actual mediante navigator.geolocation.getCurrentPosition
   */
  function requestCurrentPosition() {
    if (!('geolocation' in navigator)) {
      showAlert('Tu navegador no soporta la API de Geolocalización.', 'danger');
      return;
    }

    showAlert('Solicitando coordenadas satelitales al dispositivo...', 'info');
    btnGetLocation.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        btnGetLocation.disabled = false;
        handleGeoSuccess(position);
        checkGeolocationPermission(); // Actualiza el badge a 'granted'
      },
      (error) => {
        btnGetLocation.disabled = false;
        handleGeoError(error);
        checkGeolocationPermission();
      },
      getGeoOptions()
    );
  }

  /**
   * Inicia seguimiento continuo con watchPosition
   */
  function startWatchPosition() {
    if (!('geolocation' in navigator)) {
      showAlert('Geolocalización no soportada.', 'danger');
      return;
    }

    if (watchId !== null) return;

    btnWatchLocation.style.display = 'none';
    btnStopWatch.style.display = 'inline-flex';
    showAlert('Seguimiento continuo de ubicación activado (watchPosition).', 'info');

    watchId = navigator.geolocation.watchPosition(
      (pos) => handleGeoSuccess(pos, true),
      (err) => handleGeoError(err),
      getGeoOptions()
    );
  }

  /**
   * Detiene el seguimiento continuo
   */
  function stopWatchPosition() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      btnWatchLocation.style.display = 'inline-flex';
      btnStopWatch.style.display = 'none';
      showAlert('Seguimiento continuo detenido.', 'info');
    }
  }

  /**
   * Callback exitoso: Procesa y despliega las coordenadas
   */
  function handleGeoSuccess(position, isWatch = false) {
    const coords = position.coords;
    currentCoords = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy
    };

    // 1. Despliegue de datos en las tarjetas numéricas
    valLat.textContent = coords.latitude.toFixed(6) + '°';
    valLng.textContent = coords.longitude.toFixed(6) + '°';
    valAccuracy.textContent = `± ${Math.round(coords.accuracy)} m`;
    valAltitude.textContent = coords.altitude !== null ? `${coords.altitude.toFixed(1)} m` : 'No disponible';
    valSpeed.textContent = coords.speed !== null ? `${(coords.speed * 3.6).toFixed(1)} km/h` : '0 km/h';

    const fecha = new Date(position.timestamp);
    valTimestamp.textContent = fecha.toLocaleTimeString() + ` (${fecha.toLocaleDateString()})`;

    // Habilitar botones de acción
    btnCopyCoords.disabled = false;
    btnRecenter.disabled = false;
    btnExternalMap.style.display = 'inline-flex';
    btnExternalMap.href = `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=16/${coords.latitude}/${coords.longitude}`;

    // 2. Renderizar mapa interactivo
    renderMap(coords.latitude, coords.longitude, coords.accuracy);

    showAlert(
      `¡Ubicación obtenida con éxito! ${isWatch ? '(Actualización en vivo)' : ''} Precisión: ±${Math.round(coords.accuracy)}m`,
      'success'
    );
  }

  /**
   * Callback de error: Interpreta los códigos de error del GPS
   */
  function handleGeoError(error) {
    let mensaje = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        mensaje = 'Acceso denegado: El usuario rechazó la solicitud de geolocalización.';
        break;
      case error.POSITION_UNAVAILABLE:
        mensaje = 'Posición no disponible: El hardware o la red no pudieron determinar la ubicación.';
        break;
      case error.TIMEOUT:
        mensaje = 'Tiempo de espera agotado: Tardó demasiado en responder el GPS.';
        break;
      default:
        mensaje = `Error desconocido (${error.message || 'Error de GPS'}).`;
        break;
    }
    showAlert(mensaje, 'danger');
  }

  // =========================================================================
  // 3. RENDERIZADO DEL MAPA INTERACTIVO (Leaflet)
  // =========================================================================

  function renderMap(lat, lng, accuracy) {
    // Si es la primera vez, ocultar placeholder y mostrar contenedor
    if (mapPlaceholder) {
      mapPlaceholder.style.display = 'none';
      leafletMapDiv.style.display = 'block';
    }

    if (!map) {
      // Inicializar Leaflet map
      map = L.map('leafletMap').setView([lat, lng], 16);

      // Capa de teselas de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Marcador en la posición
      marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <strong style="color: #2563eb;">📍 Estás aquí</strong><br>
          Lat: ${lat.toFixed(5)}<br>
          Lng: ${lng.toFixed(5)}<br>
          <small>Precisión: ±${Math.round(accuracy)}m</small>
        </div>
      `).openPopup();

      // Círculo visual de precisión
      accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15
      }).addTo(map);

    } else {
      // Actualizar posición existente
      map.setView([lat, lng], 16);
      marker.setLatLng([lat, lng]);
      marker.setPopupContent(`
        <div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <strong style="color: #2563eb;">📍 Estás aquí</strong><br>
          Lat: ${lat.toFixed(5)}<br>
          Lng: ${lng.toFixed(5)}<br>
          <small>Precisión: ±${Math.round(accuracy)}m</small>
        </div>
      `);
      if (accuracyCircle) {
        accuracyCircle.setLatLng([lat, lng]);
        accuracyCircle.setRadius(accuracy);
      }
    }

    // Forzar recalculo de dimensiones por si el contenedor cambió de display
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  // =========================================================================
  // 4. ACCIONES DE INTERFAZ & UTILIDADES
  // =========================================================================

  function showAlert(msg, type = 'info') {
    statusAlert.style.display = 'flex';
    statusAlert.className = `alert alert-${type}`;
    statusAlertMsg.textContent = msg;
  }

  // Copiar coordenadas al portapapeles
  btnCopyCoords.addEventListener('click', async () => {
    if (!currentCoords) return;
    const text = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btnCopyCoords.innerHTML;
      btnCopyCoords.innerHTML = '✅ ¡Copiado!';
      setTimeout(() => { btnCopyCoords.innerHTML = originalText; }, 2000);
    } catch (e) {
      alert(`Coordenadas: ${text}`);
    }
  });

  // Centrar mapa
  btnRecenter.addEventListener('click', () => {
    if (map && currentCoords) {
      map.setView([currentCoords.lat, currentCoords.lng], 16);
      if (marker) marker.openPopup();
    }
  });

  // Listeners principales
  btnGetLocation.addEventListener('click', requestCurrentPosition);
  btnWatchLocation.addEventListener('click', startWatchPosition);
  btnStopWatch.addEventListener('click', stopWatchPosition);
  btnRefreshPerm.addEventListener('click', () => {
    checkGeolocationPermission();
    checkAuxiliaryPermissions();
  });

  // Inicialización inmediata
  checkGeolocationPermission();
  checkAuxiliaryPermissions();
});
