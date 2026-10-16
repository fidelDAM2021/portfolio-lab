/**
 * ui.js — Renderizado de componentes (SPEC-002, DESIGN-001)
 * Genera el HTML de lista, detalle, proyectos, paginación y subida.
 */

const UI = (() => {

  const PROYECTOS_POR_PAGINA = 10;

  // ── Helpers ──────────────────────────────────────────────────────

  function esc(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function placeholderImagen(alt) {
    return `<div class="img-placeholder" role="img" aria-label="${esc(alt || 'Imagen no disponible')}">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    </div>`;
  }

  function imgConFallback(src, alt, clase) {
    if (!src) return placeholderImagen(alt);
    return `<img src="${esc(src)}" alt="${esc(alt)}" class="${esc(clase || '')}" loading="lazy"
      onerror="this.outerHTML=this.dataset.placeholder?this.dataset.placeholder:''"
      data-placeholder='${placeholderImagen(alt).replace(/'/g, "&#39;")}'>`;
  }

  // ── Lista de alumnos (R2) ────────────────────────────────────────

  function renderLista(alumnos) {
    if (!alumnos || alumnos.length === 0) {
      return `<div class="estado-vacio">
        <p>No hay portfolios disponibles.</p>
      </div>`;
    }

    const items = alumnos.map(a => {
      const erroresHtml = a.errores && a.errores.length > 0
        ? `<div class="alerta alerta--error" role="alert">
             <strong>Error en los datos:</strong>
             <ul>${a.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
           </div>`
        : '';

      return `
        <li class="tarjeta-alumno" data-id="${esc(a.id)}">
          <a href="#/alumno/${esc(a.id)}" class="tarjeta-alumno__enlace">
            <div class="tarjeta-alumno__foto">
              ${imgConFallback(a.foto, `Foto de ${a.nombre}`, 'tarjeta-alumno__img')}
            </div>
            <div class="tarjeta-alumno__info">
              <h2 class="tarjeta-alumno__nombre">${esc(a.nombre)}</h2>
              <p class="tarjeta-alumno__titular">${esc(a.titular)}</p>
            </div>
          </a>
          ${erroresHtml}
        </li>`;
    }).join('');

    return `
      <section class="seccion seccion--lista" aria-label="Lista de portfolios">
        <h1 class="seccion__titulo">Portfolios</h1>
        <ul class="lista-alumnos" role="list">
          ${items}
        </ul>
      </section>`;
  }

  // ── Detalle de portfolio (R3) ────────────────────────────────────

  function renderDetalle(idAlumno, perfil, proyectos, errores, pagina) {
    pagina = pagina || 1;

    if (!perfil) {
      return `<div class="estado-vacio">
        <p>No se pudo cargar el portfolio de <strong>${esc(idAlumno)}</strong>.</p>
        ${errores.length > 0 ? `<div class="alerta alerta--error" role="alert"><ul>${errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
        <a href="#/" class="btn btn--secundario">&larr; Volver a la lista</a>
      </div>`;
    }

    const erroresHtml = errores.length > 0
      ? `<div class="alerta alerta--aviso" role="alert">
           <strong>Avisos en los datos:</strong>
           <ul>${errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
         </div>`
      : '';

    // Header del perfil
    const fotoSrc = Data.resolverAsset(idAlumno, perfil.foto);
    const headerHtml = `
      <header class="perfil-header">
        <div class="perfil-header__foto">
          ${imgConFallback(fotoSrc, `Foto de ${perfil.nombre}`, 'perfil-header__img')}
        </div>
        <div class="perfil-header__info">
          <h1 class="perfil-header__nombre">${esc(perfil.nombre)}</h1>
          <p class="perfil-header__titular">${esc(perfil.titular)}</p>
          <p class="perfil-header__claim">${esc(perfil.claim)}</p>
          <div class="perfil-header__meta">
            <span class="pildora">
              <span class="pildora__punto" aria-hidden="true"></span>
              ${esc(perfil.disponibilidad)}
            </span>
            <span class="perfil-header__ubicacion">${esc(perfil.ubicacion)}</span>
          </div>
        </div>
      </header>`;

    // Presentación
    const presentacionHtml = perfil.presentacion
      ? `<p class="perfil-presentacion">${esc(perfil.presentacion)}</p>`
      : '';

    // Sobre mí
    const sobreMiHtml = Array.isArray(perfil.sobreMi) && perfil.sobreMi.length > 0
      ? `<section class="seccion" aria-label="Sobre mí">
           <h2 class="seccion__titulo">Sobre mí</h2>
           ${perfil.sobreMi.map(p => `<p class="texto-corrido">${esc(p)}</p>`).join('')}
         </section>`
      : '';

    // Ahora
    const ahoraHtml = Array.isArray(perfil.ahora) && perfil.ahora.length > 0
      ? `<section class="seccion" aria-label="Ahora">
           <h2 class="seccion__titulo">Ahora</h2>
           <ul class="lista-ahora">
             ${perfil.ahora.map(a => `<li>${esc(a)}</li>`).join('')}
           </ul>
         </section>`
      : '';

    // Stack
    let stackHtml = '';
    if (perfil.stack && typeof perfil.stack === 'object') {
      const categorias = Object.entries(perfil.stack)
        .filter(([, items]) => Array.isArray(items) && items.length > 0)
        .map(([cat, items]) => `
          <div class="stack-categoria">
            <h3 class="stack-categoria__titulo">${esc(cat)}</h3>
            <div class="stack-categoria__chips">
              ${items.map(t => `<span class="chip">${esc(t)}</span>`).join('')}
            </div>
          </div>`).join('');

      if (categorias) {
        stackHtml = `<section class="seccion" aria-label="Stack tecnológico">
          <h2 class="seccion__titulo">Stack</h2>
          ${categorias}
        </section>`;
      }
    }

    // Contacto
    const contactoHtml = `
      <section class="seccion" aria-label="Contacto">
        <h2 class="seccion__titulo">Contacto</h2>
        <ul class="lista-contacto" role="list">
          ${perfil.correo ? `<li><a href="mailto:${esc(perfil.correo)}" class="enlace-contacto">${esc(perfil.correo)}</a></li>` : ''}
          ${perfil.github ? `<li><a href="${esc(perfil.github)}" target="_blank" rel="noopener noreferrer" class="enlace-contacto">GitHub</a></li>` : ''}
          ${perfil.linkedin ? `<li><a href="${esc(perfil.linkedin)}" target="_blank" rel="noopener noreferrer" class="enlace-contacto">LinkedIn</a></li>` : ''}
        </ul>
      </section>`;

    // Proyectos con paginación
    const proyectosHtml = renderProyectos(idAlumno, proyectos, pagina);

    return `
      <nav class="miga" aria-label="Navegación">
        <a href="#/" class="miga__enlace">&larr; Todos los portfolios</a>
      </nav>
      ${erroresHtml}
      ${headerHtml}
      ${presentacionHtml}
      ${sobreMiHtml}
      ${ahoraHtml}
      ${stackHtml}
      ${proyectosHtml}
      ${contactoHtml}`;
  }

  // ── Proyectos (R4, R5, BR1-BR5) ─────────────────────────────────

  function renderProyectos(idAlumno, proyectos, pagina) {
    if (!proyectos || proyectos.length === 0) {
      return `<section class="seccion" aria-label="Proyectos">
        <h2 class="seccion__titulo">Proyectos</h2>
        <p class="mensaje-info">Este alumno aún no ha añadido proyectos a su portfolio.</p>
      </section>`;
    }

    const totalPaginas = Math.ceil(proyectos.length / PROYECTOS_POR_PAGINA);
    const paginaActual = Math.min(Math.max(1, pagina), totalPaginas);
    const inicio = (paginaActual - 1) * PROYECTOS_POR_PAGINA;
    const proyectosPagina = proyectos.slice(inicio, inicio + PROYECTOS_POR_PAGINA);

    const tarjetas = proyectosPagina.map(p => renderTarjetaProyecto(idAlumno, p)).join('');

    let paginacionHtml = '';
    if (totalPaginas > 1) {
      const botones = [];
      for (let i = 1; i <= totalPaginas; i++) {
        if (i === paginaActual) {
          botones.push(`<span class="paginacion__actual" aria-current="page">${i}</span>`);
        } else {
          botones.push(`<a href="#/alumno/${esc(idAlumno)}/pagina/${i}" class="paginacion__enlace">${i}</a>`);
        }
      }
      paginacionHtml = `
        <nav class="paginacion" aria-label="Paginación de proyectos">
          ${paginaActual > 1 ? `<a href="#/alumno/${esc(idAlumno)}/pagina/${paginaActual - 1}" class="paginacion__enlace paginacion__enlace--prev">&larr; Anterior</a>` : ''}
          <div class="paginacion__numeros">${botones.join('')}</div>
          ${paginaActual < totalPaginas ? `<a href="#/alumno/${esc(idAlumno)}/pagina/${paginaActual + 1}" class="paginacion__enlace paginacion__enlace--next">Siguiente &rarr;</a>` : ''}
        </nav>`;
    }

    return `
      <section class="seccion" aria-label="Proyectos">
        <h2 class="seccion__titulo">Proyectos</h2>
        <div class="rejilla-proyectos">
          ${tarjetas}
        </div>
        ${paginacionHtml}
      </section>`;
  }

  function renderTarjetaProyecto(idAlumno, proyecto) {
    const imgSrc = Data.resolverAsset(idAlumno, proyecto.imagen);
    const descripcion = Validate.truncar(proyecto.descripcion, 200);

    // Tecnologías
    let tecnologiasHtml;
    if (Array.isArray(proyecto.tecnologias) && proyecto.tecnologias.length > 0) {
      tecnologiasHtml = proyecto.tecnologias.map(t => `<span class="chip">${esc(t)}</span>`).join('');
    } else {
      tecnologiasHtml = '<span class="chip chip--vacio">No especificado</span>';
    }

    // Enlace al repositorio (BR3)
    let enlaceHtml;
    if (!proyecto.enlace || proyecto.enlace.trim() === '') {
      enlaceHtml = '<span class="aviso-repo">Repositorio obligatorio</span>';
    } else if (!Validate.esUrlValida(proyecto.enlace)) {
      enlaceHtml = '<span class="aviso-repo">Repositorio no disponible</span>';
    } else {
      enlaceHtml = `<a href="${esc(proyecto.enlace)}" target="_blank" rel="noopener noreferrer" class="btn btn--primario btn--pequeno">Ver repositorio</a>`;
    }

    return `
      <article class="tarjeta-proyecto" data-id="${esc(proyecto.id)}">
        <div class="tarjeta-proyecto__marco">
          ${imgConFallback(imgSrc, `Imagen de ${proyecto.nombre}`, 'tarjeta-proyecto__img')}
        </div>
        <div class="tarjeta-proyecto__contenido">
          <h3 class="tarjeta-proyecto__nombre">${esc(proyecto.nombre)}</h3>
          <p class="tarjeta-proyecto__descripcion">${esc(descripcion)}</p>
          <div class="tarjeta-proyecto__tecnologias">${tecnologiasHtml}</div>
          <div class="tarjeta-proyecto__meta">
            <time class="tarjeta-proyecto__fecha" datetime="${esc(proyecto.fecha)}">${esc(proyecto.fecha)}</time>
            ${enlaceHtml}
          </div>
        </div>
      </article>`;
  }

  // ── Subida de portfolio (flujo 7.2, R8) ─────────────────────────

  function renderSubida() {
    return `
      <section class="seccion seccion--subida" aria-label="Subir portfolio">
        <h1 class="seccion__titulo">Subir portfolio</h1>
        <p class="texto-corrido">
          Selecciona los archivos JSON de tu portfolio para validarlos.
          El sistema comprobará que el formato y los datos son correctos.
        </p>

        <form id="form-subida" class="form-subida" novalidate>
          <div class="form-subida__campo">
            <label for="input-id" class="form-subida__label">Identificador de alumno</label>
            <input type="text" id="input-id" class="form-subida__input" placeholder="ej: alex-ejemplo"
              pattern="[a-z0-9\-]+" required aria-describedby="input-id-ayuda">
            <small id="input-id-ayuda" class="form-subida__ayuda">Solo letras minúsculas, números y guiones.</small>
          </div>

          <div class="form-subida__campo">
            <label for="input-profile" class="form-subida__label">profile.json</label>
            <input type="file" id="input-profile" class="form-subida__input" accept=".json" required>
          </div>

          <div class="form-subida__campo">
            <label for="input-projects" class="form-subida__label">projects.json</label>
            <input type="file" id="input-projects" class="form-subida__input" accept=".json" required>
          </div>

          <div class="form-subida__acciones">
            <button type="submit" class="btn btn--primario">Validar portfolio</button>
            <a href="#/" class="btn btn--secundario">Cancelar</a>
          </div>
        </form>

        <div id="resultado-validacion" class="resultado-validacion" aria-live="polite"></div>
      </section>`;
  }

  function renderResultadoValidacion(idAlumno, perfilRes, proyectosRes) {
    const partes = [];

    // Resultado del perfil
    if (perfilRes.validacion.valido) {
      partes.push(`<div class="alerta alerta--exito" role="alert">
        <strong>profile.json:</strong> Válido. Sin errores.
      </div>`);
    } else {
      partes.push(`<div class="alerta alerta--error" role="alert">
        <strong>profile.json — errores encontrados:</strong>
        <ul>${perfilRes.validacion.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
      </div>`);
    }

    // Resultado de proyectos
    if (proyectosRes.validacion.valido) {
      const numProyectos = (proyectosRes.proyectos || []).length;
      partes.push(`<div class="alerta alerta--exito" role="alert">
        <strong>projects.json:</strong> Válido. ${numProyectos} proyecto${numProyectos !== 1 ? 's' : ''} encontrado${numProyectos !== 1 ? 's' : ''}.
      </div>`);
    } else {
      partes.push(`<div class="alerta alerta--error" role="alert">
        <strong>projects.json — errores encontrados:</strong>
        <ul>${proyectosRes.validacion.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
      </div>`);
    }

    // Si todo válido, mostrar resumen
    if (perfilRes.validacion.valido && proyectosRes.validacion.valido) {
      const proyectos = proyectosRes.proyectos || [];
      partes.push(`<div class="alerta alerta--info">
        <p><strong>Portfolio válido para "${esc(idAlumno)}".</strong></p>
        <p>Para publicarlo, guarda los archivos en:</p>
        <pre><code>data/${esc(idAlumno)}/profile.json
data/${esc(idAlumno)}/projects.json</code></pre>
        <p>Y añade "${esc(idAlumno)}" al array "alumnos" en <code>data/index.json</code>.</p>
        <p>Las imágenes deben estar en <code>data/${esc(idAlumno)}/assets/</code>.</p>
      </div>`);

      // Vista previa de proyectos
      if (proyectos.length > 0) {
        partes.push(`<details class="detalle-preview">
          <summary>Vista previa de proyectos (${proyectos.length})</summary>
          <ul>${proyectos.map(p => `<li><strong>${esc(p.nombre)}</strong> — ${esc(p.fecha)} — ${(p.tecnologias || []).join(', ')}</li>`).join('')}</ul>
        </details>`);
      }
    }

    return partes.join('');
  }

  // ── Loading / Error ─────────────────────────────────────────────

  function renderCargando() {
    return `<div class="estado-cargando" role="status" aria-label="Cargando">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando…</p>
    </div>`;
  }

  function renderError(mensaje) {
    return `<div class="estado-error" role="alert">
      <p class="estado-error__mensaje">${esc(mensaje)}</p>
      <a href="#/" class="btn btn--secundario">&larr; Volver a la lista</a>
    </div>`;
  }

  // ── API pública ─────────────────────────────────────────────────

  return {
    renderLista,
    renderDetalle,
    renderSubida,
    renderResultadoValidacion,
    renderCargando,
    renderError,
    esc
  };

})();
