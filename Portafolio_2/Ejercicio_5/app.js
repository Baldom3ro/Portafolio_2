/**
 * Portafolio 2 - Ejercicio 5: Estrategia de Caché Dinámica con Fallback a IndexedDB
 * Implementación de la estrategia Network-First para consumo de APIs REST
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM References
  const selEndpoint = document.getElementById('selEndpoint');
  const btnFetchData = document.getElementById('btnFetchData');
  const chkSimulateOffline = document.getElementById('chkSimulateOffline');
  const btnClearCache = document.getElementById('btnClearCache');

  const originBanner = document.getElementById('originBanner');
  const bannerIcon = document.getElementById('bannerIcon');
  const bannerTitle = document.getElementById('bannerTitle');
  const bannerDesc = document.getElementById('bannerDesc');
  const sourcePill = document.getElementById('sourcePill');

  const valSource = document.getElementById('valSource');
  const valLatency = document.getElementById('valLatency');
  const valItemCount = document.getElementById('valItemCount');
  const valLastSaved = document.getElementById('valLastSaved');
  const itemsTimestampBadge = document.getElementById('itemsTimestampBadge');
  const itemsContainer = document.getElementById('itemsContainer');

  // =========================================================================
  // 1. INICIALIZACIÓN DE SERVICE WORKER E INDEXEDDB
  // =========================================================================

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('[Ejercicio 5] Service Worker registrado para Application Shell.');
    }).catch(err => console.warn('SW error:', err));
  }

  try {
    await window.apiCacheDB.open();
    console.log('[Ejercicio 5] Base de datos de fallback IndexedDB lista.');
  } catch (e) {
    console.error('Error al abrir DB:', e);
  }

  // =========================================================================
  // 2. ESTRATEGIA NETWORK-FIRST CON FALLBACK A INDEXEDDB
  // =========================================================================

  async function executeNetworkFirst() {
    const endpoint = selEndpoint.value;
    const isOfflineSimulated = chkSimulateOffline.checked;
    const startTime = performance.now();

    itemsContainer.innerHTML = `
      <p style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 3rem;">
        ⏳ Consultando datos (Estrategia Network-First en curso)...
      </p>
    `;

    // PASO 1: INTENTO DESDE LA RED (NETWORK)
    try {
      if (isOfflineSimulated) {
        throw new Error('Simulación de red desconectada activa (Offline Toggle activado).');
      }

      if (!navigator.onLine) {
        throw new Error('Dispositivo sin conexión a internet física.');
      }

      // Consumo de la API REST mediante fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const response = await fetch(endpoint, {
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error en el servidor remoto: HTTP ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Math.round(performance.now() - startTime);

      // PASO 2: RESPALDO AUTOMÁTICO EN INDEXEDDB
      const savedRecord = await window.apiCacheDB.saveApiResponse(endpoint, data, { latencyMs });

      // PASO 3: RENDERIZADO EXITOSO DESDE LA RED
      setOriginUI('NETWORK', latencyMs, savedRecord.timestamp);
      renderItems(data);

    } catch (networkError) {
      console.warn(`[Network-First Fallback] Red no disponible (${networkError.message}). Consultando IndexedDB...`);

      // PASO 4: FALLBACK AUTOMÁTICO A INDEXEDDB
      try {
        const cachedRecord = await window.apiCacheDB.getCachedResponse(endpoint);
        const latencyMs = Math.round(performance.now() - startTime);

        if (cachedRecord && cachedRecord.payload) {
          // Renderizar los datos recuperados de la caché local
          setOriginUI('FALLBACK', latencyMs, cachedRecord.timestamp);
          renderItems(cachedRecord.payload);
        } else {
          // No hay datos en red NI en caché local
          setOriginUI('EMPTY', latencyMs, null);
          renderEmptyState('Sin conexión a la red y sin respaldo previo en IndexedDB para este endpoint.');
        }
      } catch (dbError) {
        setOriginUI('ERROR', 0, null);
        renderEmptyState(`Error crítico al leer IndexedDB: ${dbError.message}`);
      }
    }
  }

  // =========================================================================
  // 3. ACTUALIZACIÓN VISUAL DEL ORIGEN DE LOS DATOS
  // =========================================================================

  function setOriginUI(origin, latencyMs, timestamp) {
    originBanner.classList.remove('banner-network', 'banner-fallback', 'banner-error');
    sourcePill.classList.remove('badge-granted', 'badge-prompt', 'badge-denied');

    const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString() : '--';
    const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString() : '';

    if (origin === 'NETWORK') {
      originBanner.classList.add('banner-network');
      bannerIcon.textContent = '🟢';
      bannerTitle.textContent = 'DATOS EN VIVO DESDE LA RED (ONLINE)';
      bannerDesc.textContent = 'Petición fetch() completada exitosamente. Se sincronizó y guardó una copia fresca en IndexedDB.';

      sourcePill.classList.add('badge-granted');
      sourcePill.textContent = 'ONLINE • RED';

      valSource.textContent = 'RED EN VIVO';
      valSource.style.color = '#4ade80';

      valLatency.textContent = `${latencyMs} ms`;
      valLastSaved.textContent = `${formattedTime} (${formattedDate})`;
      itemsTimestampBadge.textContent = `En vivo: ${formattedTime}`;

    } else if (origin === 'FALLBACK') {
      originBanner.classList.add('banner-fallback');
      bannerIcon.textContent = '🟠';
      bannerTitle.textContent = 'MODO OFFLINE / FALLBACK A INDEXEDDB';
      bannerDesc.textContent = `La red no respondió. La interfaz recuperó y renderizó automáticamente el último JSON respaldado localmente.`;

      sourcePill.classList.add('badge-prompt');
      sourcePill.textContent = 'OFFLINE • INDEXEDDB';

      valSource.textContent = 'FALLBACK IDB';
      valSource.style.color = '#fbbf24';

      valLatency.textContent = `${latencyMs} ms (Local)`;
      valLastSaved.textContent = `${formattedTime} (${formattedDate})`;
      itemsTimestampBadge.textContent = `Respaldado: ${formattedTime}`;

    } else {
      originBanner.classList.add('banner-error');
      bannerIcon.textContent = '🔴';
      bannerTitle.textContent = 'SIN DATOS DISPONIBLES';
      bannerDesc.textContent = 'No fue posible conectar con el servidor remoto y no existe ningún respaldo previo en IndexedDB.';

      sourcePill.classList.add('badge-denied');
      sourcePill.textContent = 'ERROR • SIN DATOS';

      valSource.textContent = 'NINGUNO';
      valSource.style.color = '#f87171';
      valLatency.textContent = '--';
      valItemCount.textContent = '0';
    }
  }

  // =========================================================================
  // 4. RENDERIZADO POLIMÓRFICO DE CONTENIDO (Productos / Publicaciones)
  // =========================================================================

  function renderItems(data) {
    itemsContainer.innerHTML = '';

    // Manejo de respuesta de DummyJSON (data.products)
    if (data.products && Array.isArray(data.products)) {
      valItemCount.textContent = data.products.length;

      data.products.forEach(prod => {
        const card = document.createElement('article');
        card.className = 'item-card';
        card.innerHTML = `
          <img class="item-thumb" src="${prod.thumbnail || 'https://via.placeholder.com/300x160?text=Sin+Imagen'}" alt="${prod.title}" loading="lazy">
          <div class="item-body">
            <span class="item-category">${prod.category || 'General'}</span>
            <h4 class="item-title">${escapeHtml(prod.title)}</h4>
            <p class="item-desc">${escapeHtml(prod.description)}</p>
            <div class="item-footer">
              <span class="item-price">$${prod.price.toFixed(2)}</span>
              <span class="item-rating">⭐ ${prod.rating || '4.5'}</span>
            </div>
          </div>
        `;
        itemsContainer.appendChild(card);
      });
      return;
    }

    // Manejo de respuesta de JSONPlaceholder (array de posts)
    if (Array.isArray(data)) {
      valItemCount.textContent = data.length;

      data.forEach(post => {
        const card = document.createElement('article');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-body">
            <span class="item-category">Post #${post.id}</span>
            <h4 class="item-title">${escapeHtml(post.title)}</h4>
            <p class="item-desc">${escapeHtml(post.body)}</p>
            <div class="item-footer">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Usuario ID: ${post.userId}</span>
              <span class="badge badge-info" style="font-size: 0.75rem;">JSONPlaceholder</span>
            </div>
          </div>
        `;
        itemsContainer.appendChild(card);
      });
      return;
    }

    renderEmptyState('Formato de datos no reconocido.');
  }

  function renderEmptyState(message) {
    itemsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(15,23,42,0.4); border-radius: var(--radius-md); border: 1px dashed var(--border);">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">📭</span>
        <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">${message}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 450px; margin: 0 auto 1rem;">
          Conéctate a la red o desactiva la simulación offline para realizar una primera sincronización y almacenar datos en IndexedDB.
        </p>
        <button onclick="document.getElementById('btnFetchData').click()" class="btn btn-primary btn-sm">
          Intentar Nuevamente
        </button>
      </div>
    `;
  }

  // =========================================================================
  // 5. EVENT LISTENERS
  // =========================================================================

  btnFetchData.addEventListener('click', executeNetworkFirst);
  selEndpoint.addEventListener('change', executeNetworkFirst);

  chkSimulateOffline.addEventListener('change', () => {
    if (chkSimulateOffline.checked) {
      console.log('[Simulador] Modo sin red activado manualmente.');
    } else {
      console.log('[Simulador] Modo sin red desactivado.');
    }
    // Reejecutar para que el usuario vea el cambio de origen inmediatamente
    executeNetworkFirst();
  });

  btnClearCache.addEventListener('click', async () => {
    if (confirm('¿Vaciar la caché de respuestas en IndexedDB?')) {
      await window.apiCacheDB.clearCache();
      valLastSaved.textContent = 'Caché vacía';
      alert('Caché de IndexedDB vaciada.');
    }
  });

  window.addEventListener('online', () => {
    console.log('[Red] Conexión física restablecida.');
    if (!chkSimulateOffline.checked) executeNetworkFirst();
  });

  window.addEventListener('offline', () => {
    console.log('[Red] Se perdió la conexión a internet física.');
    executeNetworkFirst();
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Ejecución inicial automática
  executeNetworkFirst();
});

