/**
 * app.js — Router y lógica principal (SPEC-002)
 * Hash routing: #/ lista, #/alumno/{id} detalle, #/alumno/{id}/pagina/{n}, #/subir
 */

const App = (() => {

  const appEl = () => document.getElementById('app');

  // ── Router ─────────────────────────────────────────────────────

  function obtenerRuta() {
    const hash = window.location.hash || '#/';
    return hash.replace(/^#/, '');
  }

  async function navegar() {
    const ruta = obtenerRuta();
    const app = appEl();

    // Mostrar loading
    app.innerHTML = UI.renderCargando();

    try {
      // #/ — Lista de portfolios
      if (ruta === '/' || ruta === '') {
        await mostrarLista();
        return;
      }

      // #/subir — Formulario de subida
      if (ruta === '/subir') {
        mostrarSubida();
        return;
      }

      // #/alumno/{id} o #/alumno/{id}/pagina/{n}
      const matchAlumno = ruta.match(/^\/alumno\/([a-z0-9\-]+)(?:\/pagina\/(\d+))?$/);
      if (matchAlumno) {
        const idAlumno = matchAlumno[1];
        const pagina = parseInt(matchAlumno[2] || '1', 10);
        await mostrarDetalle(idAlumno, pagina);
        return;
      }

      // Ruta no encontrada
      app.innerHTML = UI.renderError('Página no encontrada.');

    } catch (e) {
      console.error('Error de navegación:', e);
      app.innerHTML = UI.renderError(`Error inesperado: ${e.message}`);
    }
  }

  // ── Vistas ─────────────────────────────────────────────────────

  async function mostrarLista() {
    const app = appEl();
    try {
      const alumnos = await Data.cargarResumenAlumnos();
      app.innerHTML = UI.renderLista(alumnos);

      // Actualizar título
      document.title = 'Portfolios — Lista';

      // Actualizar barra superior
      actualizarBarraSuperior(null);
    } catch (e) {
      app.innerHTML = UI.renderError(`Error al cargar la lista de portfolios: ${e.message}`);
    }
  }

  async function mostrarDetalle(idAlumno, pagina) {
    const app = appEl();
    try {
      const { perfil, proyectos, errores } = await Data.cargarPortfolio(idAlumno);
      app.innerHTML = UI.renderDetalle(idAlumno, perfil, proyectos, errores, pagina);

      // Actualizar título
      document.title = perfil
        ? `${perfil.nombre} — Portfolio`
        : `Portfolio — ${idAlumno}`;

      // Actualizar barra superior
      actualizarBarraSuperior(perfil);

      // Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      app.innerHTML = UI.renderError(`Error al cargar el portfolio: ${e.message}`);
    }
  }

  function mostrarSubida() {
    const app = appEl();
    app.innerHTML = UI.renderSubida();
    document.title = 'Subir portfolio';
    actualizarBarraSuperior(null);

    // Configurar formulario
    const form = document.getElementById('form-subida');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await procesarSubida();
    });
  }

  // ── Subida de archivos (R8, flujo 7.2) ─────────────────────────

  async function procesarSubida() {
    const resultadoEl = document.getElementById('resultado-validacion');
    const inputId = document.getElementById('input-id');
    const inputProfile = document.getElementById('input-profile');
    const inputProjects = document.getElementById('input-projects');

    const idAlumno = inputId.value.trim().toLowerCase();

    // Validar ID
    if (!idAlumno || !/^[a-z0-9\-]+$/.test(idAlumno)) {
      resultadoEl.innerHTML = `<div class="alerta alerta--error" role="alert">
        El identificador de alumno no es válido. Usa solo letras minúsculas, números y guiones.
      </div>`;
      inputId.focus();
      return;
    }

    // Validar que se seleccionaron archivos
    if (!inputProfile.files.length || !inputProjects.files.length) {
      resultadoEl.innerHTML = `<div class="alerta alerta--error" role="alert">
        Selecciona ambos archivos: profile.json y projects.json.
      </div>`;
      return;
    }

    resultadoEl.innerHTML = UI.renderCargando();

    try {
      // Leer archivos
      const [profileText, projectsText] = await Promise.all([
        leerArchivo(inputProfile.files[0]),
        leerArchivo(inputProjects.files[0])
      ]);

      // Parsear JSON
      let profileData, projectsData;

      try {
        profileData = JSON.parse(profileText);
      } catch (e) {
        resultadoEl.innerHTML = `<div class="alerta alerta--error" role="alert">
          <strong>profile.json:</strong> JSON malformado — ${esc(e.message)}
        </div>`;
        return;
      }

      try {
        projectsData = JSON.parse(projectsText);
      } catch (e) {
        resultadoEl.innerHTML = `<div class="alerta alerta--error" role="alert">
          <strong>projects.json:</strong> JSON malformado — ${esc(e.message)}
        </div>`;
        return;
      }

      // Validar
      const perfilRes = { datos: profileData, validacion: Validate.validarProfile(profileData) };
      const proyectosRes = { datos: projectsData, validacion: Validate.validarProjects(projectsData), proyectos: [] };
      proyectosRes.proyectos = Validate.ordenarPorFecha(proyectosRes.validacion.proyectos || []);

      // Mostrar resultado
      resultadoEl.innerHTML = UI.renderResultadoValidacion(idAlumno, perfilRes, proyectosRes);

    } catch (e) {
      resultadoEl.innerHTML = `<div class="alerta alerta--error" role="alert">
        Error al procesar los archivos: ${esc(e.message)}
      </div>`;
    }
  }

  function leerArchivo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Error al leer ${file.name}`));
      reader.readAsText(file);
    });
  }

  function esc(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // ── Barra superior ─────────────────────────────────────────────

  function actualizarBarraSuperior(perfil) {
    const identidad = document.getElementById('barra-identidad');
    if (!identidad) return;

    if (perfil) {
      identidad.innerHTML = `
        <img src="${Data.resolverAsset(obtenerIdDeRuta(), perfil.foto)}" alt="" class="barra__foto" aria-hidden="true">
        <span class="barra__nombre">${UI.esc(perfil.nombre)}</span>`;
      identidad.classList.add('barra__identidad--visible');
    } else {
      identidad.innerHTML = '';
      identidad.classList.remove('barra__identidad--visible');
    }
  }

  function obtenerIdDeRuta() {
    const ruta = obtenerRuta();
    const match = ruta.match(/^\/alumno\/([a-z0-9\-]+)/);
    return match ? match[1] : '';
  }

  // ── Init ───────────────────────────────────────────────────────

  function init() {
    window.addEventListener('hashchange', navegar);
    navegar();
  }

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { navegar };

})();
