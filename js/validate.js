/**
 * validate.js — Validación de portfolios (SPEC-002 R8, AC5)
 * Valida profile.json y projects.json de un alumno.
 */

const Validate = (() => {

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const URL_RE = /^https?:\/\/.+/i;
  const FECHA_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  function esEmailValido(email) {
    return typeof email === 'string' && EMAIL_RE.test(email);
  }

  function esUrlValida(url) {
    return typeof url === 'string' && URL_RE.test(url);
  }

  function esFechaValida(fecha) {
    if (typeof fecha !== 'string') return false;
    const m = FECHA_RE.exec(fecha);
    if (!m) return false;
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    if (mo < 1 || mo > 12) return false;
    if (d < 1 || d > 31) return false;
    // Validar días por mes
    const diasMes = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d <= diasMes[mo - 1];
  }

  /**
   * Valida un objeto profile.json
   * @param {object} data — contenido parseado del JSON
   * @returns {{ valido: boolean, errores: string[] }}
   */
  function validarProfile(data) {
    const errores = [];

    if (!data || typeof data !== 'object') {
      errores.push('El JSON no es un objeto válido.');
      return { valido: false, errores };
    }

    const p = data.perfil;
    if (!p || typeof p !== 'object') {
      errores.push('Falta el objeto "perfil".');
      return { valido: false, errores };
    }

    // Campos obligatorios de texto
    const camposTexto = ['nombre', 'titular', 'claim', 'presentacion', 'disponibilidad', 'ubicacion', 'foto'];
    for (const campo of camposTexto) {
      if (!p[campo] || typeof p[campo] !== 'string' || p[campo].trim() === '') {
        errores.push(`Campo obligatorio vacío o ausente: perfil.${campo}`);
      }
    }

    // Arrays de texto
    if (!Array.isArray(p.sobreMi) || p.sobreMi.length === 0) {
      errores.push('Campo obligatorio: perfil.sobreMi debe ser un array con al menos un elemento.');
    }
    if (!Array.isArray(p.ahora)) {
      errores.push('Campo perfil.ahora debe ser un array.');
    }

    // Stack
    if (!p.stack || typeof p.stack !== 'object') {
      errores.push('Falta el objeto perfil.stack.');
    } else {
      for (const cat of ['Lenguajes', 'Frameworks', 'Herramientas']) {
        if (!Array.isArray(p.stack[cat])) {
          errores.push(`perfil.stack.${cat} debe ser un array.`);
        }
      }
    }

    // Contacto
    if (!esEmailValido(p.correo)) {
      errores.push('perfil.correo no es un email válido.');
    }
    if (!esUrlValida(p.github)) {
      errores.push('perfil.github no es una URL válida.');
    }
    if (!esUrlValida(p.linkedin)) {
      errores.push('perfil.linkedin no es una URL válida.');
    }

    return { valido: errores.length === 0, errores };
  }

  /**
   * Valida un objeto projects.json
   * Asigna ids autoincrementales a proyectos sin id o con id duplicado.
   * @param {object} data — contenido parseado del JSON
   * @returns {{ valido: boolean, errores: string[], proyectos: Array }}
   */
  function validarProjects(data) {
    const errores = [];

    if (!data || typeof data !== 'object') {
      errores.push('El JSON no es un objeto válido.');
      return { valido: false, errores, proyectos: [] };
    }

    if (!Array.isArray(data.proyectos)) {
      errores.push('Falta el array "proyectos".');
      return { valido: false, errores, proyectos: [] };
    }

    const proyectos = data.proyectos;

    if (proyectos.length > 100) {
      errores.push(`Límite máximo alcanzado: ${proyectos.length} proyectos (máximo 100).`);
    }

    // Asignar ids autoincrementales donde falten o estén duplicados
    const idsUsados = new Set();
    let siguienteId = 1;

    const proyectosNormalizados = proyectos.map((proj, idx) => {
      const p = { ...proj };
      const etiqueta = `proyectos[${idx}]`;

      // ID: único y autoincrementable
      let id = String(p.id || '').trim();
      if (!id || idsUsados.has(id)) {
        // Buscar siguiente id disponible
        while (idsUsados.has(String(siguienteId))) siguienteId++;
        id = String(siguienteId);
        siguienteId++;
      }
      idsUsados.add(id);
      p.id = id;

      // Campos obligatorios
      if (!p.nombre || typeof p.nombre !== 'string' || p.nombre.trim() === '') {
        errores.push(`${etiqueta}: falta campo obligatorio "nombre".`);
      }
      if (!p.descripcion || typeof p.descripcion !== 'string' || p.descripcion.trim() === '') {
        errores.push(`${etiqueta}: falta campo obligatorio "descripcion".`);
      }
      if (!p.imagen || typeof p.imagen !== 'string' || p.imagen.trim() === '') {
        errores.push(`${etiqueta}: falta campo obligatorio "imagen".`);
      }
      if (!p.enlace || typeof p.enlace !== 'string' || p.enlace.trim() === '') {
        errores.push(`${etiqueta}: falta campo obligatorio "enlace" (repositorio).`);
      } else if (!esUrlValida(p.enlace)) {
        errores.push(`${etiqueta}: "enlace" no es una URL válida.`);
      }

      // Tecnologías: array
      if (!Array.isArray(p.tecnologias)) {
        // Intentar convertir string único a array
        if (typeof p.tecnologia === 'string' && p.tecnologia.trim() !== '') {
          p.tecnologias = [p.tecnologia];
        } else {
          p.tecnologias = [];
        }
      }

      // Fecha
      if (!p.fecha || !esFechaValida(p.fecha)) {
        errores.push(`${etiqueta}: "fecha" debe tener formato dd/mm/yyyy. Valor: "${p.fecha || '(vacío)'}"`);
      }

      return p;
    });

    return { valido: errores.length === 0, errores, proyectos: proyectosNormalizados };
  }

  /**
   * Parsea una fecha dd/mm/yyyy a objeto Date para comparación.
   * @param {string} fecha
   * @returns {Date|null}
   */
  function parseFecha(fecha) {
    const m = FECHA_RE.exec(fecha);
    if (!m) return null;
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }

  /**
   * Ordena proyectos por fecha descendente (más reciente primero).
   * @param {Array} proyectos
   * @returns {Array}
   */
  function ordenarPorFecha(proyectos) {
    return [...proyectos].sort((a, b) => {
      const fa = parseFecha(a.fecha);
      const fb = parseFecha(b.fecha);
      if (!fa && !fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;
      return fb - fa;
    });
  }

  /**
   * Trunca una descripción a maxLen caracteres añadiendo "..." si excede.
   * @param {string} texto
   * @param {number} maxLen
   * @returns {string}
   */
  function truncar(texto, maxLen = 200) {
    if (!texto || texto.length <= maxLen) return texto || '';
    return texto.substring(0, maxLen) + '...';
  }

  // API pública
  return {
    validarProfile,
    validarProjects,
    ordenarPorFecha,
    truncar,
    esFechaValida,
    esUrlValida,
    esEmailValida,
    parseFecha
  };

})();
