# SPEC-001 — [Nombre]

| | |
|---|---|
| Estado | Borrador |
| Versión | v0 |
| Fecha | |

## 1. Context
Una empresa que acoge alumnos en prácticas de mi centro ha pedido que los alumnos les manden un portfolio con un formato concreto. El objetivo es que se vea quién es el alumno, los proyectos que ha hecho, con qué ha trabajado y cómo contactarle.

## 2. Goal
El objetivo es la creación de una herramienta que permita a los alumnos crear un portfolio con un formato concreto, que incluya información personal, proyectos realizados y datos de contacto, y que sea accesible desde dispositivos móviles. De cada proyecto hay que incluir imagen, nombre, descripción, tecnologías utilizadas y enlace al repositorio. La herramienta debe permitir a los alumnos trabajar sobre un perfil de ejemplo y luego personalizarlo con sus propios datos.

## 3. Users
Por un lado a la empresa que consultará los datos del alumnado. También a los alumnos que usarán la herramienta para crear su portfolio y personalizarlo con sus datos.

## 4. Scope

### In scope
- portada con información personal del alumno
- sección de proyectos realizados por el alumno
- la personalización del portfolio con datos del alumno
- la visualización del portfolio desde dispositivos móviles
- permitir incluir la información necesaria de cada proyecto: imagen, nombre, descripción, tecnologías utilizadas y enlace al repositorio

### Out of scope
- la parte de diseño, interfaz, etc. está hecha y no debe modificarse
- no hace falta multiidioma
- no hace falta login

## 5. Requirements

### R1
- optimizada para móviles

### R2
- permitir la edición de la información del portfolio una vez creado

## 6. Business Rules
- qué pasa si el alumno no tiene proyectos
- qué pasa si la descripción es muy larga
- qué pasa si el repositorio del proyecto no es público, no existe o no es accesible
- formato de fechas en dd/mm/yyyy
- los enlaces deben abrirse siempre en pestañas nuevas

## 7. User Flow
1. El usuario accede a la herramienta y ve los perfiles de los alumnos
2. Selecciona un perfil y accede
3.

## 8. Acceptance Criteria
- [ ] comprobar que si el link del proyecto no existe aparece un mensaje
- [ ] Placeholders en los campos vacíos.
- [ ] comprobar que si el alumno no tiene proyectos aparece un mensaje

## 9. Edge Cases
- perfiles sin proyectos
- si hay filtros, que no haya proyectos que cumplan el filtro

## 10. Open Questions
- cómo se ordenan los proyectos

## 11. Assumptions
-

## 12. Dependencies
- hay un perfil de ejemplo en ../data/profile.json que se puede usar para trabajar y luego cada alumno que lo personalice
