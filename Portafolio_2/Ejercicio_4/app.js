/**
 * Portafolio 2 - Ejercicio 4: Persistencia de Datos Asíncrona con IndexedDB
 * Controlador de la interfaz CRUD y enlace con la capa db.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM References
  const networkStatusBadge = document.getElementById('networkStatusBadge');
  const networkStatusText = document.getElementById('networkStatusText');
  const totalCountBadge = document.getElementById('totalCountBadge');
  const storageQuotaText = document.getElementById('storageQuotaText');

  const recordForm = document.getElementById('recordForm');
  const recordId = document.getElementById('recordId');
  const inpTitulo = document.getElementById('inpTitulo');
  const selCategoria = document.getElementById('selCategoria');
  const selPrioridad = document.getElementById('selPrioridad');
  const selEstado = document.getElementById('selEstado');
  const inpFecha = document.getElementById('inpFecha');
  const inpDescripcion = document.getElementById('inpDescripcion');

  const formTitle = document.getElementById('formTitle');
  const formIcon = document.getElementById('formIcon');
  const editingBadge = document.getElementById('editingBadge');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const btnCancelEdit = document.getElementById('btnCancelEdit');

  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');
  const filterEstado = document.getElementById('filterEstado');
  const tableBody = document.getElementById('tableBody');

  const btnLoadDemo = document.getElementById('btnLoadDemo');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnClearAll = document.getElementById('btnClearAll');

  const dbAlert = document.getElementById('dbAlert');
  const dbAlertMsg = document.getElementById('dbAlertMsg');

  // Establecer fecha de hoy por defecto en el input
  inpFecha.value = new Date().toISOString().split('T')[0];

  // =========================================================================
  // 1. INICIALIZACIÓN DE LA BASE DE DATOS Y ESTADO DE RED
  // =========================================================================

  try {
    await window.dbManager.open();
    showAlert('Base de datos IndexedDB conectada y lista para operaciones sin conexión.', 'success');
    await refreshRecords();
    await updateStorageEstimate();
  } catch (error) {
    showAlert(`Error al abrir IndexedDB: ${error.message}`, 'danger');
  }

  // Detector de conectividad de red (Online / Offline)
  function updateNetworkStatus() {
    if (navigator.onLine) {
      networkStatusBadge.className = 'badge badge-granted';
      networkStatusText.textContent = 'En línea (Online)';
    } else {
      networkStatusBadge.className = 'badge badge-warning';
      networkStatusText.textContent = 'Sin conexión (Offline - Modo Local)';
      showAlert('Modo Offline detectado: IndexedDB continúa funcionando con normalidad.', 'warning');
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  /**
   * Consulta la cuota estimada de almacenamiento local del navegador
   */
  async function updateStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
        storageQuotaText.textContent = `Uso Local: ${usedMB} MB de ~${quotaMB} MB disponibles`;
      } catch (e) {
        storageQuotaText.textContent = 'Almacenamiento: Ilimitado local';
      }
    }
  }

  // =========================================================================
  // 2. CONSULTAR Y RENDERIZAR REGISTROS (Read)
  // =========================================================================

  async function refreshRecords() {
    const query = searchInput.value;
    const cat = filterCategory.value;
    const est = filterEstado.value;

    const records = await window.dbManager.search(query, cat, est);
    const totalCount = await window.dbManager.count();
    totalCountBadge.textContent = totalCount;

    renderTable(records);
    await updateStorageEstimate();
  }

  function renderTable(records) {
    tableBody.innerHTML = '';

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2.5rem;">
            No se encontraron registros en IndexedDB que coincidan con la búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    records.forEach(item => {
      const tr = document.createElement('tr');

      // Clases para badges
      const prioClass = item.prioridad === 'Alta' 
        ? 'badge-prioridad-alta' 
        : item.prioridad === 'Media' 
          ? 'badge-prioridad-media' 
          : 'badge-prioridad-baja';

      const estadoClass = item.estado === 'Completada' 
        ? 'badge-granted' 
        : item.estado === 'En Progreso' 
          ? 'badge-prompt' 
          : 'badge-secondary';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">#${item.id}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(item.titulo)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(item.descripcion || 'Sin descripción adicional')}
          </div>
        </td>
        <td>
          <span class="badge badge-info" style="font-size: 0.75rem;">${escapeHtml(item.categoria)}</span>
        </td>
        <td>
          <span class="table-badge ${prioClass}">${escapeHtml(item.prioridad)}</span>
        </td>
        <td>
          <button class="badge ${estadoClass}" style="cursor: pointer; border: none;" onclick="window.toggleEstado(${item.id})" title="Clic para alternar estado">
            ${escapeHtml(item.estado)}
          </button>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">
          ${item.fecha || '--'}
        </td>
        <td style="text-align: right;">
          <div class="btn-group" style="justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="window.editRecord(${item.id})" title="Modificar">
              ✏️
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteRecord(${item.id})" title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // =========================================================================
  // 3. INSERTAR Y ACTUALIZAR (Create & Update)
  // =========================================================================

  recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEdit = Boolean(recordId.value);
    const itemData = {
      titulo: inpTitulo.value.trim(),
      categoria: selCategoria.value,
      prioridad: selPrioridad.value,
      estado: selEstado.value,
      fecha: inpFecha.value,
      descripcion: inpDescripcion.value.trim()
    };

    try {
      if (isEdit) {
        itemData.id = Number(recordId.value);
        await window.dbManager.update(itemData);
        showAlert(`Registro #${itemData.id} actualizado exitosamente en IndexedDB.`, 'success');
        resetForm();
      } else {
        const newId = await window.dbManager.add(itemData);
        showAlert(`Nuevo registro #${newId} insertado con éxito en IndexedDB.`, 'success');
        resetForm();
      }

      await refreshRecords();
    } catch (error) {
      console.error('Error al guardar registro:', error);
      showAlert(`Fallo en la transacción: ${error.message}`, 'danger');
    }
  });

  // =========================================================================
  // 4. EDICIÓN, ELIMINACIÓN Y ACCIONES GLOBALES
  // =========================================================================

  window.editRecord = async (id) => {
    try {
      const record = await window.dbManager.getById(id);
      if (!record) return;

      recordId.value = record.id;
      inpTitulo.value = record.titulo;
      selCategoria.value = record.categoria;
      selPrioridad.value = record.prioridad;
      selEstado.value = record.estado;
      inpFecha.value = record.fecha || '';
      inpDescripcion.value = record.descripcion || '';

      formTitle.textContent = `Editar Registro #${record.id}`;
      formIcon.textContent = '✏️';
      editingBadge.style.display = 'inline-flex';
      btnSubmitForm.textContent = '💾 Actualizar Cambios en IndexedDB';
      btnSubmitForm.className = 'btn btn-success';
      btnCancelEdit.style.display = 'block';

      inpTitulo.focus();
    } catch (error) {
      showAlert(`Error al cargar registro para edición: ${error.message}`, 'danger');
    }
  };

  btnCancelEdit.addEventListener('click', resetForm);

  function resetForm() {
    recordId.value = '';
    recordForm.reset();
    inpFecha.value = new Date().toISOString().split('T')[0];
    formTitle.textContent = 'Nuevo Registro Local';
    formIcon.textContent = '➕';
    editingBadge.style.display = 'none';
    btnSubmitForm.textContent = '💾 Guardar en IndexedDB';
    btnSubmitForm.className = 'btn btn-primary';
    btnCancelEdit.style.display = 'none';
  }

  window.deleteRecord = async (id) => {
    if (confirm(`¿Estás seguro de eliminar el registro #${id} de IndexedDB?`)) {
      try {
        await window.dbManager.delete(id);
        showAlert(`Registro #${id} eliminado correctamente.`, 'info');
        if (recordId.value === String(id)) resetForm();
        await refreshRecords();
      } catch (error) {
        showAlert(`Error al eliminar: ${error.message}`, 'danger');
      }
    }
  };

  window.toggleEstado = async (id) => {
    try {
      const record = await window.dbManager.getById(id);
      if (!record) return;

      if (record.estado === 'Pendiente') record.estado = 'En Progreso';
      else if (record.estado === 'En Progreso') record.estado = 'Completada';
      else record.estado = 'Pendiente';

      await window.dbManager.update(record);
      await refreshRecords();
    } catch (e) {
      console.error(e);
    }
  };

  // Cargar Demos
  btnLoadDemo.addEventListener('click', async () => {
    const demos = [
      { titulo: 'Configurar Service Worker con ciclo de vida', categoria: 'PWA', prioridad: 'Alta', estado: 'Completada', fecha: '2026-11-10', descripcion: 'Implementar eventos install, activate y fetch con estrategia de caché.' },
      { titulo: 'Integrar Permissions API y GPS', categoria: 'Hardware', prioridad: 'Alta', estado: 'Completada', fecha: '2026-11-11', descripcion: 'Verificación de navigator.permissions.query y mapa interactivo Leaflet.' },
      { titulo: 'Captura de video con getUserMedia', categoria: 'Hardware', prioridad: 'Media', estado: 'En Progreso', fecha: '2026-11-12', descripcion: 'Transmisión a elemento <video> y congelamiento de fotograma en <canvas>.' },
      { titulo: 'Persistencia offline con Object Store', categoria: 'Bases de Datos', prioridad: 'Alta', estado: 'En Progreso', fecha: '2026-11-13', descripcion: 'Desarrollo de CRUD completo con transacciones y promesas nativas.' },
      { titulo: 'Estrategia Network-First con fallback local', categoria: 'PWA', prioridad: 'Media', estado: 'Pendiente', fecha: '2026-11-14', descripcion: 'Consumir REST API y respaldar última respuesta en IndexedDB.' }
    ];

    for (const demo of demos) {
      await window.dbManager.add(demo);
    }

    showAlert('¡5 registros de demostración insertados con éxito!', 'success');
    await refreshRecords();
  });

  // Vaciar Base de Datos
  btnClearAll.addEventListener('click', async () => {
    if (confirm('⚠️ ¿Deseas vaciar completamente el Object Store de IndexedDB? Esta acción borrará todos los registros locales.')) {
      await window.dbManager.clear();
      resetForm();
      showAlert('Object Store vaciado completamente.', 'info');
      await refreshRecords();
    }
  });

  // Exportar a JSON
  btnExportJSON.addEventListener('click', async () => {
    const records = await window.dbManager.getAll();
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `indexeddb-backup-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Copia de seguridad en JSON descargada.', 'success');
  });

  // Filtros reactivos
  searchInput.addEventListener('input', refreshRecords);
  filterCategory.addEventListener('change', refreshRecords);
  filterEstado.addEventListener('change', refreshRecords);

  function showAlert(msg, type = 'info') {
    dbAlert.style.display = 'flex';
    dbAlert.className = `alert alert-${type}`;
    dbAlertMsg.textContent = msg;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
