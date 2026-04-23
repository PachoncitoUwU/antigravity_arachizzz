# Requirements Document

## Introduction

Modal de perfil del aprendiz que muestra información personal, métodos de registro biométrico y materias evitadas. Se accede desde la lista de aprendices en FichaDetalle.jsx. Los instructores pueden ver la información, pero solo los administradores pueden realizar modificaciones.

## Glossary

- **Modal_Perfil**: Componente modal que muestra el perfil completo del aprendiz
- **Aprendiz**: Usuario con rol de estudiante inscrito en una ficha
- **Instructor**: Usuario que puede ver información de aprendices de su ficha
- **Admin**: Instructor con permisos de administración de la ficha
- **Método_Biométrico**: Sistema de registro de asistencia (NFC, huella dactilar, reconocimiento facial)
- **Ficha_Actual**: La ficha desde la cual se abre el modal
- **Materias_Evitadas**: Lista de materias de la ficha actual en las que el aprendiz no participa

## Requirements

### Requirement 1: Acceso al Modal de Perfil

**User Story:** Como instructor, quiero abrir el perfil de un aprendiz desde la lista, para ver su información detallada.

#### Acceptance Criteria

1. WHEN un instructor hace click en la tarjeta de un aprendiz, THE Modal_Perfil SHALL abrirse mostrando la información del aprendiz
2. WHEN el cursor pasa sobre la tarjeta del aprendiz, THE Sistema SHALL mostrar efecto hover similar al de las fichas
3. THE Modal_Perfil SHALL mostrar fondo difuminado consistente con otros modales del sistema
4. THE Modal_Perfil SHALL mostrar únicamente información de la Ficha_Actual

### Requirement 2: Visualización de Información Personal

**User Story:** Como instructor, quiero ver la información personal del aprendiz, para conocer sus datos de contacto y registro.

#### Acceptance Criteria

1. THE Modal_Perfil SHALL mostrar foto o avatar del aprendiz
2. THE Modal_Perfil SHALL mostrar nombre completo del aprendiz
3. THE Modal_Perfil SHALL mostrar número de documento del aprendiz
4. THE Modal_Perfil SHALL mostrar email del aprendiz
5. WHEN el aprendiz no tiene foto, THE Modal_Perfil SHALL mostrar avatar con iniciales

### Requirement 3: Visualización de Métodos Biométricos

**User Story:** Como instructor, quiero ver qué métodos de registro tiene configurados el aprendiz, para saber cómo puede registrar asistencia.

#### Acceptance Criteria

1. THE Modal_Perfil SHALL mostrar si el aprendiz tiene NFC registrado
2. THE Modal_Perfil SHALL mostrar cantidad de huellas dactilares registradas
3. THE Modal_Perfil SHALL mostrar si el aprendiz tiene reconocimiento facial registrado
4. WHEN un método biométrico no está registrado, THE Modal_Perfil SHALL indicar claramente su ausencia

### Requirement 4: Registro de Métodos Biométricos (Solo Admin)

**User Story:** Como admin de ficha, quiero registrar métodos biométricos para un aprendiz, para que pueda marcar asistencia.

#### Acceptance Criteria

1. WHERE el usuario es admin de la ficha, THE Modal_Perfil SHALL mostrar botón para registrar métodos biométricos
2. WHERE el usuario no es admin, THE Modal_Perfil SHALL ocultar botones de registro biométrico
3. WHEN el admin hace click en registrar método biométrico, THE Sistema SHALL abrir el componente EnrollModal existente
4. WHEN se completa el registro biométrico, THE Modal_Perfil SHALL actualizar la información mostrada

### Requirement 5: Eliminación de Métodos Biométricos (Solo Admin)

**User Story:** Como admin de ficha, quiero eliminar métodos biométricos de un aprendiz, para actualizar sus formas de registro.

#### Acceptance Criteria

1. WHERE el usuario es admin de la ficha, THE Modal_Perfil SHALL mostrar botones para eliminar cada método biométrico registrado
2. WHERE el usuario no es admin, THE Modal_Perfil SHALL ocultar botones de eliminación
3. WHEN el admin hace click en eliminar método biométrico, THE Sistema SHALL solicitar confirmación
4. WHEN se confirma la eliminación, THE Sistema SHALL eliminar el método biométrico y actualizar la vista

### Requirement 6: Visualización de Materias Evitadas

**User Story:** Como instructor, quiero ver qué materias evita el aprendiz en esta ficha, para entender su participación académica.

#### Acceptance Criteria

1. THE Modal_Perfil SHALL mostrar lista de Materias_Evitadas de la Ficha_Actual
2. THE Modal_Perfil SHALL mostrar únicamente materias de la Ficha_Actual, no de otras fichas
3. WHEN el aprendiz no tiene materias evitadas, THE Modal_Perfil SHALL mostrar mensaje indicando que participa en todas las materias
4. WHERE el usuario es admin, THE Modal_Perfil SHALL mostrar placeholder para gestión de materias evitadas (implementación en FASE 3)

### Requirement 7: Eliminación de Aprendiz de Ficha (Solo Admin)

**User Story:** Como admin de ficha, quiero eliminar un aprendiz de mi ficha, para mantener actualizada la lista de estudiantes.

#### Acceptance Criteria

1. WHERE el usuario es admin de la ficha, THE Modal_Perfil SHALL mostrar botón para eliminar aprendiz de la ficha
2. WHERE el usuario no es admin, THE Modal_Perfil SHALL ocultar botón de eliminación
3. WHEN el admin hace click en eliminar aprendiz, THE Sistema SHALL solicitar confirmación
4. WHEN se confirma la eliminación, THE Sistema SHALL eliminar al aprendiz de la Ficha_Actual y cerrar el modal
5. WHEN se elimina el aprendiz, THE Sistema SHALL actualizar la lista de aprendices en FichaDetalle

### Requirement 8: Restricciones de Acceso por Ficha

**User Story:** Como instructor de una ficha, quiero ver solo información de mis aprendices, para mantener la privacidad entre fichas.

#### Acceptance Criteria

1. WHEN un instructor de Ficha 1 abre el perfil de un aprendiz, THE Modal_Perfil SHALL mostrar únicamente información relacionada con Ficha 1
2. WHEN un instructor de Ficha 2 abre el perfil del mismo aprendiz, THE Modal_Perfil SHALL mostrar únicamente información relacionada con Ficha 2
3. THE Modal_Perfil SHALL NOT incluir selector de ficha
4. THE Sistema SHALL determinar automáticamente la Ficha_Actual desde el contexto de FichaDetalle

### Requirement 9: Consistencia Visual

**User Story:** Como usuario del sistema, quiero que el modal de perfil sea consistente con el resto de la aplicación, para una experiencia uniforme.

#### Acceptance Criteria

1. THE Modal_Perfil SHALL utilizar los mismos estilos que el modal de materias existente
2. THE Modal_Perfil SHALL utilizar la paleta de colores del sistema (#4285F4 para elementos principales)
3. THE Modal_Perfil SHALL utilizar los componentes Button y Modal existentes
4. THE Modal_Perfil SHALL mantener el mismo espaciado y tipografía que otros formularios del sistema
