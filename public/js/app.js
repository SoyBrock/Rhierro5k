
document.addEventListener('DOMContentLoaded', () => {
  
  // Leomar: Variables globales de control de estado.
  let addedFincas = [];
  let currentStep = 1;
  let validatedTempFileName = null;
  let validatedIronDataUrl = null; // Reniel: Para previsualizar en el paso final
  
  // Configuración del Lienzo (Canvas)
  const canvas = document.getElementById('iron-canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Leomar: Inicialización de servicios y vistas al cargar el DOM.
  initCanvas();
  loadStates();
  loadDashboardStats();
  loadProducersList();

  // Reniel: Navegación principal mediante pestañas (tabs).
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-target');
      
      // Leomar: Activar el botón de la pestaña activa.
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Reniel: Mostrar el panel correspondiente.
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(targetTab).classList.add('active');

      // Leomar: Acciones adicionales según la pestaña seleccionada.
      if (targetTab === 'tab-dashboard') {
        loadDashboardStats();
      } else if (targetTab === 'tab-list') {
        loadProducersList();
      }
    });
  });

  // Reniel: Acceso directo desde el dashboard.
  document.querySelector('.btn-banner-go').addEventListener('click', () => {
    document.querySelector('[data-target="tab-register"]').click();
  });

  // Leomar: Cargar catálogo de Estados para el registro de fincas.
  async function loadStates() {
    try {
      const response = await fetch('/api/producers/states');
      if (response.ok) {
        const states = await response.json();
        const select = document.getElementById('estado_id');
        states.forEach(state => {
          const opt = document.createElement('option');
          opt.value = state.id;
          opt.textContent = `${state.codigo} - ${state.nombre}`;
          select.appendChild(opt);
        });
      }
    } catch (error) {
      console.error('Error cargando estados:', error);
    }
  }

  // Reniel: Elementos DOM de la división político-territorial.
  const selectEstado = document.getElementById('estado_id');
  const selectMunicipio = document.getElementById('finca-municipio');
  const selectParroquia = document.getElementById('finca-parroquia');

  // Leomar: Evento dependiente para refrescar Municipios.
  selectEstado.addEventListener('change', () => {
    loadMunicipalities(selectEstado.value);
  });

  // Reniel: Evento dependiente para refrescar Parroquias.
  selectMunicipio.addEventListener('change', () => {
    loadParishes(selectMunicipio.value);
  });

  // Leomar: Consumir API de municipios asociados al estado.
  async function loadMunicipalities(stateId) {
    if (!stateId) {
      selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione un municipio...</option>';
      selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
      return;
    }
    try {
      const response = await fetch(`/api/producers/states/${stateId}/municipalities`);
      if (response.ok) {
        const municipalities = await response.json();
        selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione un municipio...</option>';
        selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
        municipalities.forEach(mun => {
          const opt = document.createElement('option');
          opt.value = mun.id;
          opt.textContent = mun.nombre;
          selectMunicipio.appendChild(opt);
        });
      }
    } catch (error) {
      console.error('Error cargando municipios:', error);
    }
  }

  // Reniel: Consumir API de parroquias asociadas al municipio.
  async function loadParishes(municipalityId) {
    if (!municipalityId) {
      selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
      return;
    }
    try {
      const response = await fetch(`/api/producers/municipalities/${municipalityId}/parishes`);
      if (response.ok) {
        const parishes = await response.json();
        selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
        parishes.forEach(parr => {
          const opt = document.createElement('option');
          opt.value = parr.id;
          opt.textContent = parr.nombre;
          selectParroquia.appendChild(opt);
        });
      }
    } catch (error) {
      console.error('Error cargando parroquias:', error);
    }
  }

  // Leomar: Consumir API de agregados para estadísticas.
  async function loadDashboardStats() {
    try {
      const response = await fetch('/api/producers/stats');
      if (response.ok) {
        const stats = await response.json();
        document.getElementById('stat-producers').textContent = stats.totalProductores;
        document.getElementById('stat-farms').textContent = stats.totalFincas;
        document.getElementById('stat-active-irons').textContent = stats.hierrosActivos;
        document.getElementById('stat-top-state').textContent = stats.topState;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  // Reniel: Listado reactivo de productores con búsqueda.
  async function loadProducersList(searchQuery = '') {
    try {
      const url = searchQuery ? `/api/producers?search=${encodeURIComponent(searchQuery)}` : '/api/producers';
      const response = await fetch(url);
      
      if (response.ok) {
        const producers = await response.json();
        const container = document.getElementById('producers-container');
        container.innerHTML = '';

        if (producers.length === 0) {
          container.innerHTML = `
            <div class="stat-card" style="justify-content: center; padding: 3rem; color: var(--text-muted);">
              <p>No se encontraron productores registrados.</p>
            </div>
          `;
          return;
        }

        producers.forEach(p => {
          const card = document.createElement('div');
          card.className = 'producer-card';
          
          // Leomar: Generar HTML para las fincas anidadas.
          let fincasHtml = '';
          p.fincas.forEach(f => {
            fincasHtml += `
              <div class="finca-mini-card">
                <div>
                  <div class="f-name">${escapeHtml(f.nombre)}</div>
                  <div class="f-loc">${escapeHtml(f.municipio)}, ${escapeHtml(f.parroquia)}, ${escapeHtml(f.sector)}</div>
                </div>
                <div class="f-size">${Number(f.superficie).toFixed(1)} Ha</div>
              </div>
            `;
          });

          card.innerHTML = `
            <div class="card-header-main">
              <div class="prod-intro">
                <div class="prod-avatar">${escapeHtml(p.nombre[0].toUpperCase())}</div>
                <div class="prod-title-group">
                  <h3>${escapeHtml(p.nombre)}</h3>
                  <div class="prod-meta-subtitle">
                    Cédula/RIF: <span class="ced">${escapeHtml(p.cedula)}</span> | Teléfono: ${escapeHtml(p.telefono)}
                  </div>
                </div>
              </div>
              <div class="card-header-right">
                <span class="status-badge ${p.hierro_estatus === 'activo' ? 'active' : 'inactive'}">
                  ${escapeHtml(p.hierro_estatus || 'inactivo')}
                </span>
                <div class="prod-iron-mini" title="Ver hierro completo">
                  <img src="/${p.hierro_imagen_url}" alt="Hierro">
                </div>
              </div>
            </div>
            
            <div class="prod-expand-content">
              <div class="prod-detail-group">
                <h4>Detalles de Contacto y Ubicación</h4>
                <div class="grid-2col" style="margin-bottom: 1.2rem;">
                  <div class="p-detail-item">
                    <span class="label">Correo Electrónico</span>
                    <span class="val">${escapeHtml(p.email)}</span>
                  </div>
                  <div class="p-detail-item">
                    <span class="label">Estado de Registro</span>
                    <span class="val">${escapeHtml(p.estado_nombre)} (Código: ${escapeHtml(p.estado_codigo)})</span>
                  </div>
                </div>
                
                <h4>Fincas Registradas (${p.fincas.length})</h4>
                <div class="prod-fincas-grid">
                  ${fincasHtml}
                </div>
              </div>
              
              <div class="prod-iron-large-section">
                <span class="marca-label">Diseño de Hierro Registrado</span>
                <div class="prod-iron-large-preview">
                  <img src="/${p.hierro_imagen_url}" alt="Hierro">
                </div>
                <div class="iron-code">${escapeHtml(p.hierro_codigo)}</div>
                <div class="marca-label">Marca: ${escapeHtml(p.marca_nombre)}</div>
              </div>
            </div>
          `;
          container.appendChild(card);
        });
      }
    } catch (error) {
      console.error('Error cargando productores:', error);
    }
  }

  // Reniel: Búsqueda con debounce para evitar saturar la base de datos.
  let searchTimeout;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadProducersList(e.target.value);
    }, 300);
  });

function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const brushSlider = document.getElementById('brush-size');
    ctx.lineWidth = brushSlider.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000'; // Trazo negro

    brushSlider.addEventListener('input', (e) => {
      ctx.lineWidth = e.target.value;
    });

    // Leomar: Escuchadores de eventos para dibujo libre con ratón.
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Reniel: Adaptación para dispositivos móviles y tablets.
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
      e.preventDefault();
    });
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      draw({ clientX: touch.clientX, clientY: touch.clientY });
      e.preventDefault();
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Leomar: Limpiar lienzo y restaurar fondo blanco.
    document.getElementById('btn-clear-canvas').addEventListener('click', clearCanvas);
  }

  function startDrawing(e) {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    // Reniel: Dibujar un punto inicial para clics sencillos.
    ctx.beginPath();
    ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.beginPath();
    
    // Leomar: Si el lienzo cambia, invalidar validación previa.
    invalidateStep3();
  }

  function draw(e) {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    lastX = coords.x;
    lastY = coords.y;
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    invalidateStep3();
  }
  
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('hierro-file-input');
  const filePreviewArea = document.getElementById('file-preview-area');
  const filePreviewImg = document.getElementById('file-preview-img');
  const btnRemoveFile = document.getElementById('btn-remove-file');

  // Reniel: Habilitar clic en el área para seleccionar archivo.
  dropzone.addEventListener('click', () => fileInput.click());

  // Leomar: Soporte para arrastrar archivos directamente.
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  function handleImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, JPEG o PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      filePreviewImg.src = e.target.result;
      dropzone.style.display = 'none';
      filePreviewArea.style.display = 'flex';
      invalidateStep3();
    };
    reader.readAsDataURL(file);
  }

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    filePreviewImg.src = '';
    filePreviewArea.style.display = 'none';
    dropzone.style.display = 'flex';
    invalidateStep3();
  });

  // Reniel: Forzar re-validación al cambiar o borrar el diseño.
  function invalidateStep3() {
    validatedTempFileName = null;
    validatedIronDataUrl = null;
    document.getElementById('btn-goto-step4').disabled = true;
    document.getElementById('similarity-quick-status').innerHTML = '';
  }


  // Leomar y Reniel: ADMINISTRADOR DE FINCAS (PASO 2)
  
  const btnAddFinca = document.getElementById('btn-add-finca');
  const fincasTableBody = document.querySelector('#fincas-table tbody');
  const fincasCountLabel = document.getElementById('fincas-count');

  btnAddFinca.addEventListener('click', () => {
    const nombre = document.getElementById('finca-nombre').value.trim();
    const superficieVal = document.getElementById('finca-superficie').value;
    
    const municipioVal = selectMunicipio.value;
    const parroquiaVal = selectParroquia.value;
    const sector = document.getElementById('finca-sector').value.trim();

    // Reniel: Validación de obligatoriedad de datos de fincas.
    if (!nombre || !superficieVal || !municipioVal || !parroquiaVal || !sector) {
      alert('Debe rellenar todos los campos de la finca para agregarla.');
      return;
    }

    const superficie = parseFloat(superficieVal);
    if (isNaN(superficie) || superficie <= 0) {
      alert('La superficie debe ser un número positivo mayor que 0.');
      return;
    }

    const municipio = selectMunicipio.options[selectMunicipio.selectedIndex].text;
    const parroquia = selectParroquia.options[selectParroquia.selectedIndex].text;

    // Leomar: Almacenamiento local temporal del listado.
    const finca = { nombre, superficie, municipio, parroquia, sector };
    addedFincas.push(finca);
    
    // Reniel: Limpiar formulario tras inserción exitosa.
    document.getElementById('finca-nombre').value = '';
    document.getElementById('finca-superficie').value = '';
    selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione un municipio...</option>';
    selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
    // Leomar: Cargar de nuevo municipios del estado seleccionado.
    if (selectEstado.value) {
      loadMunicipalities(selectEstado.value);
    }
    document.getElementById('finca-sector').value = '';

    renderFincasTable();
  });

  function renderFincasTable() {
    fincasTableBody.innerHTML = '';
    fincasCountLabel.textContent = addedFincas.length;

    if (addedFincas.length === 0) {
      fincasTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4" class="text-center">No ha agregado ninguna finca aún. Complete los campos anteriores para añadir.</td>
        </tr>
      `;
      return;
    }

    addedFincas.forEach((f, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHtml(f.nombre)}</strong></td>
        <td>${f.superficie.toFixed(1)} Ha</td>
        <td>${escapeHtml(f.municipio)}, ${escapeHtml(f.parroquia)}, ${escapeHtml(f.sector)}</td>
        <td class="text-center">
          <button type="button" class="btn-danger-sm" data-index="${index}">Eliminar</button>
        </td>
      `;
      
      // Reniel: Remoción dinámica del array temporal.
      row.querySelector('.btn-danger-sm').addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        addedFincas.splice(idx, 1);
        renderFincasTable();
      });

      fincasTableBody.appendChild(row);
    });
  }


  // Leomar y Reniel: MOTOR DE COMPROBACIÓN DE SIMILITUD (PASO 3)
  
  const btnCheckSimilarity = document.getElementById('btn-check-similarity');
  const similarityQuickStatus = document.getElementById('similarity-quick-status');

  btnCheckSimilarity.addEventListener('click', async () => {
    let fileBlob = null;
    let isFromCanvas = false;

    if (fileInput.files.length > 0) {
      fileBlob = fileInput.files[0];
    } else {
      isFromCanvas = true;
      fileBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }

    if (!fileBlob) {
      alert('Debe cargar un archivo o realizar un dibujo de su hierro para poder validarlo.');
      return;
    }

    const formData = new FormData();
    formData.append('hierro', fileBlob, isFromCanvas ? 'dibujo.png' : fileInput.files[0].name);

    btnCheckSimilarity.disabled = true;
    similarityQuickStatus.innerHTML = `<span class="status-loading">Analizando trazo y dimensiones...</span>`;

    try {
      const response = await fetch('/api/irons/validate', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        similarityQuickStatus.innerHTML = `<span class="status-warn">❌ ${escapeHtml(data.error || 'Error de validación')}</span>`;
        return;
      }

      if (data.accepted) {
        similarityQuickStatus.innerHTML = `<span class="status-ok">✔ Hierro aceptado (${data.similarityScore}% de similitud). No hay colisiones.</span>`;
        validatedTempFileName = data.tempFileName;
        
        if (isFromCanvas) {
          validatedIronDataUrl = canvas.toDataURL();
        } else {
          validatedIronDataUrl = filePreviewImg.src;
        }

        document.getElementById('btn-goto-step4').disabled = false;
      } else {
        similarityQuickStatus.innerHTML = `<span class="status-warn">⚠ Conflicto detectado (${data.similarityScore}% similitud). Registro bloqueado.</span>`;
        showSimilarityModal(data, isFromCanvas);
      }

    } catch (error) {
      console.error('Error al comprobar similitud:', error);
      similarityQuickStatus.innerHTML = `<span class="status-warn">❌ Error al conectar con el motor de validación.</span>`;
    } finally {
      btnCheckSimilarity.disabled = false;
    }
  });

  // Leomar y Reniel: MODAL DE DETALLE DE SIMILITUD (SUGERENCIAS Y OVERLAY)
  
  const modal = document.getElementById('similarity-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCloseModalFooter = document.getElementById('btn-close-modal-footer');

  function showSimilarityModal(data, isFromCanvas) {
    document.getElementById('modal-similarity-score').textContent = `${data.similarityScore}%`;
    document.getElementById('modal-similarity-threshold').textContent = `${data.threshold}%`;

    if (isFromCanvas) {
      document.getElementById('modal-img-proposed').src = canvas.toDataURL();
    } else {
      document.getElementById('modal-img-proposed').src = filePreviewImg.src;
    }

    document.getElementById('modal-img-conflict').src = `/${data.conflict.imagenUrl}`;
    document.getElementById('modal-conflict-producer').textContent = `Productor: ${data.conflict.productor}`;
    document.getElementById('modal-conflict-brand').textContent = `Marca: ${data.conflict.marca}`;
    document.getElementById('modal-conflict-code').textContent = `Código: ${data.conflict.codigo}`;
    document.getElementById('modal-img-diff').src = data.conflict.diffImage;

    const sugList = document.getElementById('modal-suggestions-list');
    sugList.innerHTML = '';
    data.conflict.consejos.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      sugList.appendChild(li);
    });

    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  [btnCloseModal, btnCloseModalFooter].forEach(btn => {
    btn.addEventListener('click', closeModal);
  });


  // Leomar: Flujo de validaciones y pasos del asistente wizard.
  
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-next'));
      if (validateStep(currentStep)) {
        if (targetStep === 4) {
          prepareSummaryStep();
        }
        changeStep(targetStep);
      }
    });
  });

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-prev'));
      changeStep(targetStep);
    });
  });

  function changeStep(step) {
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${step}`).classList.add('active');

    document.querySelectorAll('.w-step').forEach((s, idx) => {
      const sNum = idx + 1;
      s.classList.remove('active', 'completed');
      if (sNum === step) {
        s.classList.add('active');
      } else if (sNum < step) {
        s.classList.add('completed');
      }
    });

    document.querySelectorAll('.step-line').forEach((line, idx) => {
      const lineNum = idx + 1;
      line.classList.remove('filled');
      if (lineNum < step) {
        line.classList.add('filled');
      }
    });

    currentStep = step;
  }

  function validateStep(step) {
    if (step === 1) {
      const cedula = document.getElementById('cedula').value.trim();
      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email = document.getElementById('email').value.trim();
      const estadoId = document.getElementById('estado_id').value;

      if (!cedula || !nombre || !telefono || !email || !estadoId) {
        alert('Por favor complete todos los datos personales obligatorios.');
        return false;
      }
      return true;
    }
    
    if (step === 2) {
      if (addedFincas.length === 0) {
        alert('Debe registrar al menos una finca para continuar.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const marca = document.getElementById('marca_nombre').value.trim();
      if (!marca) {
        alert('Debe ingresar el nombre de la marca comercial.');
        return false;
      }
      if (!validatedTempFileName) {
        alert('Debe validar el diseño de su hierro antes de avanzar.');
        return false;
      }
      return true;
    }

    return true;
  }

  function prepareSummaryStep() {
    document.getElementById('sum-nombre').textContent = document.getElementById('nombre').value;
    document.getElementById('sum-cedula').textContent = document.getElementById('cedula').value;
    document.getElementById('sum-telefono').textContent = document.getElementById('telefono').value;
    document.getElementById('sum-email').textContent = document.getElementById('email').value;
    
    const selectEstado = document.getElementById('estado_id');
    const estadoNombre = selectEstado.options[selectEstado.selectedIndex].textContent;
    document.getElementById('sum-estado').textContent = estadoNombre;
    
    document.getElementById('sum-marca-nombre').textContent = document.getElementById('marca_nombre').value;
    document.getElementById('sum-iron-img').src = validatedIronDataUrl;

    const estadoCode = estadoNombre.split(' - ')[0];
    const cantFincas = addedFincas.length;
    document.getElementById('sum-hierro-codigo').textContent = `${estadoCode}-${cantFincas}-[ID]-ACT`;

    const list = document.getElementById('sum-fincas-list');
    list.innerHTML = '';
    addedFincas.forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(f.nombre)}</strong> - ${f.superficie} Ha (${escapeHtml(f.municipio)}, ${escapeHtml(f.sector)})`;
      list.appendChild(li);
    });
  }


  // Reniel: Manejador para el envío final de toda la estructura de datos.
  
  const form = document.getElementById('register-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-submit-registration');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando Registro...';

    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const estado_id = document.getElementById('estado_id').value;
    const marca_nombre = document.getElementById('marca_nombre').value.trim();

    const payload = {
      cedula,
      nombre,
      telefono,
      email,
      estado_id,
      marca_nombre,
      fincas: JSON.stringify(addedFincas),
      tempFileName: validatedTempFileName
    };

    try {
      const response = await fetch('/api/producers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`¡Registro completado! Productor registrado con éxito.\nCódigo de Hierro asignado: ${result.hierroCodigo}`);
        
        form.reset();
        clearCanvas();
        addedFincas = [];
        renderFincasTable();
        invalidateStep3();
        selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione un municipio...</option>';
        selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione una parroquia...</option>';
        
        changeStep(1);
        document.querySelector('[data-target="tab-dashboard"]').click();
      } else {
        alert(`Error: ${result.error || 'No se pudo guardar el registro.'}`);
      }
    } catch (error) {
      console.error('Error al registrar productor:', error);
      alert('Error en el servidor al enviar los datos de registro.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Finalizar Registro';
    }
  });


  // Leomar: Helpers para prevención de inyección de código (escape).
  
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

});
