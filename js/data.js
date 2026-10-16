/**
 * data.js — Carga de datos desde archivos JSON (SPEC-002 R6)
 * Estructura: /data/{id-alumno}/profile.json + projects.json
 * Índice:     /data/index.json
 */

const Data = (() => {

  const DATA_BASE = 'data';

  /**
   * Fetch con manejo de errores.
   * @param {string} url
   * @returns {Promise<object>}
   */
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al cargar ${url}`);
    }
    try {
      return await res.json();
    } catch (e) {
      throw new Error(`JSON malformado en ${url}: ${e.message}`);
    }
  }

  /**
   * Carga el índice de alumnos.
   * @returns {Promise<string[]>} lista de ids de alumno
   */
  async function cargarIndice() {
    const data = await fetchJSON(`${DATA_BASE}/index.json`);
    if (!Array.isArray(data.alumnos)) {
      throw new Error('data/index.json: falta el array "alumnos".');
    }
    return data.alumnos;
  }

  /**
   * Carga el perfil de un alumno.
   * @param {string} idAlumno
   * @returns {Promise<{datos: object, validacion: object}>}
   */
  async function cargarPerfil(idAlumno) {
    const url = `${DATA_BASE}/${idAlumno}/profile.json`;
    const datos = await fetchJSON(url);
    const validacion = Validate.validarProfile(datos);
    return { datos, validacion };
  }

  /**
   * Carga los proyectos de un alumno.
   * @param {string} idAlumno
   * @returns {Promise<{datos: object, validacion: object, proyectos: Array}>}
   */
  async function cargarProyectos(idAlumno) {
    const url = `${DATA_BASE}/${idAlumno}/projects.json`;
    const datos = await fetchJSON(url);
    const validacion = Validate.validarProjects(datos);
    const proyectos = Validate.ordenarPorFecha(validacion.proyectos || []);
    return { datos, validacion, proyectos };
  }

  /**
   * Carga el portfolio completo de un alumno (perfil + proyectos).
   * @param {string} idAlumno
   * @returns {Promise<{perfil: object, proyectos: Array, errores: string[]}>}
   */
  async function cargarPortfolio(idAlumno) {
    const errores = [];
    let perfil = null;
    let proyectos = [];

    try {
      const resPerfil = await cargarPerfil(idAlumno);
      if (resPerfil.validacion.valido) {
        perfil = resPerfil.datos.perfil;
      } else {
        errores.push(...resPerfil.validacion.errores.map(e => `[profile.json] ${e}`));
        perfil = resPerfil.datos.perfil || null;
      }
    } catch (e) {
      errores.push(`[profile.json] ${e.message}`);
    }

    try {
      const resProy = await cargarProyectos(idAlumno);
      proyectos = resProy.proyectos;
      if (!resProy.validacion.valido) {
        errores.push(...resProy.validacion.errores.map(e => `[projects.json] ${e}`));
      }
    } catch (e) {
      errores.push(`[projects.json] ${e.message}`);
    }

    return { perfil, proyectos, errores };
  }

  /**
   * Carga resúmenes de todos los alumnos para la lista principal.
   * @returns {Promise<Array<{id: string, nombre: string, titular: string, foto: string, errores: string[]}>>}
   */
  async function cargarResumenAlumnos() {
    const ids = await cargarIndice();
    const resultados = await Promise.allSettled(
      ids.map(async (id) => {
        const { perfil, errores } = await cargarPortfolio(id);
        if (!perfil) {
          return { id, nombre: id, titular: 'Error al cargar perfil', foto: '', errores };
        }
        return {
          id,
          nombre: perfil.nombre || id,
          titular: perfil.titular || '',
          foto: `${DATA_BASE}/${id}/${perfil.foto || ''}`,
          errores
        };
      })
    );
    return resultados
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
  }

  /**
   * Resuelve la ruta de un asset relativo a la carpeta del alumno.
   * @param {string} idAlumno
   * @param {string} rutaRelativa — ej. "assets/project-01.jpg"
   * @returns {string}
   */
  function resolverAsset(idAlumno, rutaRelativa) {
    if (!rutaRelativa) return '';
    // Si ya es una URL absoluta, devolverla tal cual
    if (/^https?:\/\//i.test(rutaRelativa)) return rutaRelativa;
    return `${DATA_BASE}/${idAlumno}/${rutaRelativa}`;
  }

  return {
    cargarIndice,
    cargarPerfil,
    cargarProyectos,
    cargarPortfolio,
    cargarResumenAlumnos,
    resolverAsset
  };

})();
