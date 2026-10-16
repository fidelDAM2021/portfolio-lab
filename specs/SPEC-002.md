# SPEC-002 — Portfolio para alumnos en prácticas

| | |
|---|---|
| Estado | Borrador |
| Versión | v1.0 |
| Fecha | 2025-10-16 |
| Autor | Fidel Oltra Landete |
| Revisado por | Lambda Thornwood |

---

## 1. Context

Una empresa que acoge alumnos en prácticas de un centro educativo ha pedido que los alumnos les envíen un portfolio con un formato concreto. El objetivo es que la empresa pueda ver quién es el alumno, los proyectos que ha realizado, las tecnologías con las que ha trabajado y cómo contactarle.

El portfolio actúa como un CV digital accesible desde dispositivos móviles.

---

## 2. Goal

Crear una herramienta que permita a la empresa visualizar portfolios de alumnos en un formato consistente y profesional.

Los portfolios deben incluir:
- Información personal del alumno
- Proyectos realizados
- Datos de contacto

Los alumnos no interactúan directamente con la aplicación; crean o actualizan su portfolio subiendo archivos JSON con sus datos.

---

## 3. Users

### 3.1 Usuario principal: Empresa

La empresa accede a la aplicación para consultar los portfolios de los alumnos.

**Necesidades:**
- Ver lista de alumnos disponibles
- Navegar entre diferentes perfiles
- Ver detalle de cada portfolio (información personal + proyectos)
- Acceder a enlaces de contacto y repositorios
- Filtrar/buscar alumnos según criterios (funcionalidad futura)

### 3.2 Usuario secundario: Alumno (indirecto)

El alumno no usa la aplicación directamente. Su interacción consiste en:
- Crear archivos JSON con su información siguiendo el formato establecido
- Subir los archivos para crear o actualizar su portfolio

---

## 4. Scope

### In scope

- Visualización de lista de portfolios de alumnos
- Visualización de detalle de portfolio individual
- Portada con información personal del alumno
- Sección de proyectos con: imagen, nombre, descripción, tecnologías y enlace al repositorio
- Diseño responsive optimizado para móviles
- Carga de datos desde archivos JSON
- Validación de datos al subir portfolio
- Paginación de proyectos (10 por página)
- Estructura de carpetas por alumno

### Out of scope

- Diseño e interfaz (ya implementados, no modificables)
- Sistema de login o autenticación
- Multiidioma
- Backend con base de datos
- Edición de portfolio desde la aplicación
- Sistema de filtros avanzados (fase futura)

---

## 5. Requirements

### R1 — Visualización responsive

La aplicación debe visualizarse correctamente en dispositivos con ancho de pantalla desde 320px hasta 1920px, sin scroll horizontal.

### R2 — Lista de portfolios

La página principal debe mostrar una lista de todos los portfolios disponibles, incluyendo al menos: foto, nombre y titular del alumno.

### R3 — Detalle de portfolio

Al seleccionar un alumno, se debe mostrar:
- Información personal completa (ver estructura en Appendix)
- Lista de proyectos realizados (paginada)
- Datos de contacto

### R4 — Datos de proyecto

Cada proyecto debe mostrar:
- Imagen (obligatoria)
- Nombre (obligatorio)
- Descripción (obligatoria, máximo 200 caracteres)
- Tecnologías utilizadas (una o varias)
- Enlace al repositorio (obligatorio)
- Fecha del proyecto (formato dd/mm/yyyy)

### R5 — Paginación de proyectos

Si un alumno tiene más de 10 proyectos, estos deben paginarse mostrando máximo 10 proyectos por página. Límite máximo: 100 proyectos por alumno.

### R6 — Persistencia de datos

Los datos se almacenan en archivos JSON organizados en carpetas por alumno:

/data/
/{id-alumno}/
profile.json
projects.json

### R7 — Identificación de portfolio

Cada alumno tiene una carpeta única identificada por `{id-alumno}`. El mecanismo para que un alumno solo pueda modificar su propia carpeta está pendiente de definir (ver Open Questions).

### R8 — Validación de datos

Al subir un portfolio, el sistema debe validar:
- Formato JSON correcto
- Campos obligatorios presentes
- URLs con formato válido
- Fechas en formato dd/mm/yyyy (o convertibles)
- Descripciones dentro del límite de caracteres

### R9 — Perfil de ejemplo

La aplicación debe incluir datos de ejemplo para desarrollo y pruebas.

---

## 6. Business Rules

### BR1 — Alumno sin proyectos

Si un alumno no tiene proyectos, se muestra el mensaje: *"Este alumno aún no ha añadido proyectos a su portfolio."*

### BR2 — Descripción de proyecto

Las descripciones de proyecto tienen un límite de 200 caracteres. Si exceden este límite, se truncan y se añade "..." al final.

### BR3 — Repositorio obligatorio

Todo proyecto debe incluir enlace a un repositorio. Si falta, se muestra aviso indicando que es obligatorio.

### BR4 — Repositorio no accesible

Si el enlace no existe, no es público o no responde, se muestra: *"Repositorio no disponible"*.

### BR5 — Formato de fechas

Todas las fechas deben mostrarse en formato **dd/mm/yyyy**. Si el JSON contiene otro formato, debe convertirse.

### BR6 — Enlaces externos

Todos los enlaces externos deben abrirse en pestaña nueva (`target="_blank"`).

### BR7 — Actualización de portfolio

Cuando un alumno sube una nueva versión, esta sobrescribe completamente la anterior.

### BR8 — Identificación de proyecto

Cada proyecto tiene un `id` único generado automáticamente por el sistema al crearlo.

---

## 7. User Flow

### 7.1 Flujo principal: Empresa consulta portfolios

1. La empresa accede a la aplicación
2. Ve una lista de alumnos con foto, nombre y titular
3. Selecciona un alumno de la lista
4. Accede al detalle del portfolio:
   - Ve información personal completa
   - Ve lista de proyectos (paginada si hay más de 10)
   - Puede hacer clic en enlaces de contacto
   - Puede hacer clic en enlaces a repositorios (se abren en pestaña nueva)
5. Puede volver a la lista para ver otro portfolio

### 7.2 Flujo secundario: Alumno sube portfolio

1. El alumno prepara sus archivos JSON siguiendo el formato establecido
2. Sube los archivos a su carpeta correspondiente
3. El sistema valida el formato y los datos
4. Si hay errores, se muestran mensajes indicando qué corregir
5. Si es correcto, el portfolio se crea o actualiza

---

## 8. Acceptance Criteria

### AC1 — Responsive design

- [ ] La aplicación se visualiza correctamente en pantallas de 320px, 768px, 1024px y 1920px de ancho
- [ ] No aparece scroll horizontal en ninguna resolución
- [ ] Los elementos interactivos son accesibles en pantallas táctiles

### AC2 — Lista de portfolios

- [ ] Se muestran todos los portfolios disponibles
- [ ] Cada elemento muestra foto, nombre y titular del alumno
- [ ] Al hacer clic en un alumno, se navega a su detalle

### AC3 — Detalle de portfolio

- [ ] Se muestra toda la información personal del alumno
- [ ] Se muestran todos los proyectos del alumno
- [ ] Cada proyecto muestra: imagen, nombre, descripción, tecnologías, enlace y fecha

### AC4 — Paginación

- [ ] Si hay 10 o menos proyectos, se muestran todos sin paginación
- [ ] Si hay más de 10 proyectos, aparece paginación
- [ ] La paginación permite navegar entre páginas correctamente
- [ ] No se permiten más de 100 proyectos por alumno

### AC5 — Validación de datos

- [ ] Si el JSON no es válido, se muestra mensaje de error
- [ ] Si falta un campo obligatorio, se indica cuál
- [ ] Si un proyecto no tiene repositorio, se muestra aviso
- [ ] Si una fecha no tiene formato dd/mm/yyyy, se intenta convertir o muestra error

### AC6 — Casos límite

- [ ] Si un alumno no tiene proyectos, se muestra mensaje informativo
- [ ] Si una descripción supera 200 caracteres, se trunca correctamente
- [ ] Si un repositorio no es accesible, se muestra "Repositorio no disponible"
- [ ] Los campos vacíos muestran placeholder apropiado

### AC7 — Enlaces

- [ ] Todos los enlaces externos se abren en pestaña nueva
- [ ] Los enlaces de email abren el cliente de correo

### AC8 — Formato de fechas

- [ ] Todas las fechas se muestran en formato dd/mm/yyyy
- [ ] Las fechas en otros formatos se convierten correctamente

---

## 9. Edge Cases

| Caso | Comportamiento esperado |
|------|------------------------|
| Alumno sin proyectos | Mensaje: "Este alumno aún no ha añadido proyectos a su portfolio." |
| Descripción muy larga | Truncar a 200 caracteres + "..." |
| Repositorio no accesible | Mostrar "Repositorio no disponible" |
| JSON malformado | Mensaje de error indicando problema de formato |
| Campo obligatorio vacío | Mensaje indicando qué campo falta |
| Imagen no carga | Mostrar placeholder de imagen |
| Fecha en formato incorrecto | Intentar conversión; si falla, mostrar error |
| Más de 100 proyectos | Error: límite máximo alcanzado |
| Proyecto sin tecnologías | Mostrar "No especificado" |

---

## 10. Open Questions

| # | Pregunta | Estado | Responsable |
|---|----------|--------|-------------|
| 1 | ¿Cómo se controla que un alumno solo modifique su propia carpeta? | Pendiente | Fidel |
| 2 | ¿Qué criterios de filtrado/búsqueda necesitará la empresa? | Pendiente | Fidel |
| 3 | ¿Cómo se ordenan los proyectos? (¿por fecha? ¿el alumno decide?) | Pendiente | Fidel |
| 4 | ¿Hay límite de tamaño para las imágenes? | Pendiente | Fidel |
| 5 | ¿Se permite eliminar un portfolio una vez subido? | Pendiente | Fidel |

---

## 11. Assumptions

- El diseño y la interfaz ya están implementados y no deben modificarse
- La aplicación es una página estática (sin backend)
- Los datos se almacenan en archivos JSON organizados por carpetas
- No se requiere autenticación ni gestión de usuarios
- Los alumnos recibirán instrucciones sobre el formato JSON esperado
- La empresa accederá principalmente desde dispositivos móviles
- Habrá una página con todos los perfiles navegable

---

## 12. Dependencies

| Dependencia | Descripción | Estado |
|-------------|-------------|--------|
| Estructura de carpetas | `/data/{id-alumno}/profile.json` + `projects.json` | Definido |
| Diseño e interfaz | Ya implementados, no modificables | Completado |

---

## 13. Appendix

### 13.1 Estructura de archivos

/data/
/alex-ejemplo/
profile.json
projects.json
/otro-alumno/
profile.json
projects.json

### 13.2 Estructura de `profile.json`

```json
{
  "perfil": {
    "nombre": "string",
    "titular": "string",
    "claim": "string",
    "presentacion": "string",
    "sobreMi": ["string"],
    "disponibilidad": "string",
    "ubicacion": "string",
    "foto": "string (ruta relativa)",
    "ahora": ["string"],
    "stack": {
      "Lenguajes": ["string"],
      "Frameworks": ["string"],
      "Herramientas": ["string"]
    },
    "correo": "string (email)",
    "github": "string (url)",
    "linkedin": "string (url)"
  }
}

### 13.3 Estructura de projects.json

{
  "proyectos": [
    {
      "id": "string (generado automáticamente)",
      "nombre": "string",
      "descripcion": "string (max 200 chars)",
      "tecnologias": ["string"],
      "imagen": "string (ruta relativa)",
      "enlace": "string (url)",
      "fecha": "string (dd/mm/yyyy)"
    }
  ]
}

Nota: tecnologias es un array para permitir varias tecnologías por proyecto

