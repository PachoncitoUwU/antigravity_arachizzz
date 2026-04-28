# Rol: Administrador

## 📋 Descripción General

El **Administrador** es un rol superior en el sistema que supervisa y gestiona fichas, instructores, materias y aprendices. Tiene permisos elevados para modificar, supervisar y generar reportes, pero su alcance está limitado únicamente a las fichas donde está asignado.

**Alcance:** El administrador solo puede gestionar las fichas que él creó o donde fue invitado. No tiene acceso global a toda la base de datos.

---

## 🏗️ Jerarquía de Roles

```
Administrador > Líder (instructor creador de ficha) > Instructor > Aprendiz
```

### Definición de roles:
- **Administrador**: Rol superior que supervisa fichas, no toma asistencia
- **Líder**: Instructor que creó la ficha (actualmente llamado "admin de ficha" en el código)
- **Instructor**: Instructor normal que gestiona materias y toma asistencia
- **Aprendiz**: Estudiante inscrito en fichas

> **Nota:** Actualmente en el código, el instructor creador de una ficha se llama "admin de ficha". En el futuro se cambiará esta terminología a "Líder de ficha" para evitar confusión con el rol de Administrador. Cuando este cambio se complete, eliminar esta nota.

---

## 🔐 Asignación del Rol

El rol de **Administrador** se asigna al momento del **registro del usuario** en el sistema.

### **Roles disponibles en el registro:**
1. **Aprendiz** - Estudiante
2. **Instructor** - Profesor/Docente
3. **Administrador** - Supervisor/Coordinador

### **Asignación a fichas:**
Un administrador se vincula a una ficha cuando:
1. **Crea una ficha** → Automáticamente queda asignado como administrador de esa ficha
2. **Es invitado por el líder** → El líder de una ficha puede invitar a un administrador usando el código/link de invitación

**Importante:**
- El rol de administrador es permanente y se define al crear la cuenta
- Un administrador puede gestionar múltiples fichas
- Una ficha solo puede tener un administrador asignado
- El administrador usa los mismos códigos de invitación que genera el líder
- El administrador NO puede ver quién usó cada código de invitación

---

## ✅ Permisos y Funcionalidades

### 1. **Gestión de Fichas**
- ✅ Crear nuevas fichas
- ✅ Ver todas las fichas donde está asignado
- ✅ Editar información de fichas
- ✅ Cambiar el líder de una ficha
- ✅ Enviar fichas a la papelera
- ✅ Invitar usuarios a fichas (usando códigos del líder)

### 2. **Gestión de Materias**
- ✅ Crear materias en sus fichas
- ✅ Editar materias
- ✅ Cambiar el instructor a cargo de una materia
- ✅ Enviar materias a la papelera

### 3. **Gestión de Instructores**
- ✅ Ver lista de instructores de sus fichas
- ✅ Modificar horarios de cualquier instructor de sus fichas
  - Debe respetar las reglas de horario (no solapar clases, horarios válidos, etc.)
- ✅ Ver historial de actividad de instructores:
  - Última vez que tomó asistencia
  - Cantidad de asistencias tomadas en el mes
  - Excusas aprobadas/rechazadas
  - Materias creadas/modificadas
  - Aprendices agregados/removidos
- ✅ Enviar instructores a la papelera (removerlos de la ficha)

### 4. **Gestión de Aprendices**
- ✅ Ver todos los aprendices de sus fichas
- ✅ Ver todas las fichas en las que está inscrito un aprendiz
- ✅ Modificar información de aprendices:
  - Nombre
  - Email
  - Documento
  - Quitar foto de perfil (no puede agregar una nueva)
- ✅ Resetear contraseñas de aprendices
- ✅ Ver historial de aprendices:
  - Fecha de inscripción a la ficha
  - Cantidad de asistencias
  - Cantidad de excusas enviadas
  - Cambios en su información
  - Historial de suspensiones/reactivaciones
- ✅ Enviar aprendices a la papelera (removerlos de la ficha)

### 5. **Gestión de Excusas**
- ✅ Ver todas las excusas de sus fichas:
  - Excusas pendientes
  - Excusas aprobadas
  - Excusas rechazadas
- ✅ Aprobar/rechazar excusas (incluso en nombre de instructores)
- ✅ Ver estadísticas de excusas por ficha/aprendiz

### 6. **Papelera**
El administrador tiene acceso completo a la papelera con dos vistas:

#### **Vista General (Menú principal)**
- Ver todos los elementos eliminados de sus fichas
- Subsecciones: Fichas / Materias / Instructores / Aprendices

#### **Vista por Sección (Dentro de cada módulo)**
- Botón "Ver eliminados" en cada sección
- Muestra solo elementos eliminados de esa categoría

#### **Reglas de la Papelera:**

**Enviar a papelera:**
- Admin puede enviar: fichas, materias, aprendices, instructores
- Líder puede enviar: materias, aprendices, instructores (de su ficha)
- Instructor puede enviar: aprendices (de sus materias)

**Recuperar de papelera:**
- Lo que envía Admin → Solo Admin puede recuperar
- Lo que envía Líder → Líder o Admin pueden recuperar
- Lo que envía Instructor → Instructor, Líder o Admin pueden recuperar

**Eliminar permanentemente:**
- Solo Admin puede eliminar permanentemente
- Puede eliminar cualquier elemento en la papelera (incluso lo que enviaron otros)
- Los elementos permanecen en papelera indefinidamente hasta eliminación manual
- NO hay auto-eliminación automática

**Información mostrada en papelera:**
- Fecha de eliminación
- Quién lo eliminó
- Tipo de elemento
- Información básica del elemento

### 7. **Reportes y Exportación**
El administrador puede generar y descargar reportes en formato **XLSX** (Excel):

#### **Reportes Individuales:**
- Información completa de una ficha específica
- Asistencias de una materia específica
- Asistencias de todas las materias de una ficha

#### **Reportes Consolidados:**
- Información de todas sus fichas en un solo archivo
- Incluye: fichas, materias, instructores, aprendices, asistencias

**Formato:** Usa el mismo formato XLSX que actualmente usan los instructores

### 8. **Estadísticas y Visualización**
- ✅ Dashboard con métricas generales:
  - Total de fichas gestionadas
  - Total de aprendices
  - Total de instructores
  - Promedio de asistencia
- ✅ Gráficos de tendencias de asistencia
- ✅ Estadísticas de excusas
- ✅ Reportes de instructores activos/inactivos

### 9. **Historial de Cambios (Auditoría)**
El administrador tiene acceso a un registro completo de cambios en sus fichas:

**Eventos registrados:**
- Cambios en fichas (creación, edición, eliminación)
- Cambios en materias (creación, edición, eliminación, cambio de instructor)
- Cambios en aprendices (inscripción, modificación, eliminación)
- Cambios en instructores (asignación, modificación de horario, eliminación)
- Cambios de líder de ficha
- Aprobación/rechazo de excusas
- Elementos enviados a papelera
- Elementos recuperados de papelera
- Elementos eliminados permanentemente

**Información del registro:**
- Fecha y hora del cambio
- Usuario que realizó el cambio
- Tipo de cambio
- Detalles del cambio (qué se modificó)

### 10. **Notificaciones**
El administrador solo recibe notificaciones toast de sus propias acciones:
- ✅ Guardado exitoso
- ✅ Creación exitosa
- ✅ Eliminación exitosa
- ✅ Errores en operaciones

**NO recibe notificaciones de:**
- ❌ Acciones de instructores
- ❌ Excusas aprobadas/rechazadas por otros
- ❌ Asistencias tomadas
- ❌ Cambios realizados por otros usuarios

> Para supervisar actividad de otros usuarios, debe usar el apartado de "Historial de Cambios"

---

## ❌ Limitaciones

### **No puede:**
1. ❌ **Tomar asistencia** - Esta función es exclusiva de instructores
2. ❌ **Gestionar juegos/skins** - No tiene acceso a sistema de juegos ni recompensas
3. ❌ **Ver estadísticas de juegos** - No puede ver puntuaciones ni logros de aprendices
4. ❌ **Crear usuarios** - No puede crear cuentas de instructores o aprendices
5. ❌ **Gestionar reconocimiento facial** - No puede modificar métodos de registro de asistencia
6. ❌ **Agregar fotos de perfil** - Solo puede quitarlas, no agregarlas
7. ❌ **Ver quién usó códigos de invitación** - Los códigos son generales para la ficha
8. ❌ **Acceder a fichas donde no está asignado** - Solo ve sus propias fichas
9. ❌ **Ser instructor de una ficha** - Los roles son separados y excluyentes

---

## 🎨 Interfaz de Usuario

### **Navegación Principal:**
El administrador tiene un menú lateral con las siguientes secciones:

```
📊 Dashboard
   └─ Métricas generales y gráficos

👥 Usuarios
   ├─ Instructores
   └─ Aprendices

📚 Fichas
   └─ Lista de fichas gestionadas

📖 Materias
   └─ Materias de todas sus fichas

📋 Asistencias
   └─ Visualización de asistencias

📝 Excusas
   ├─ Pendientes
   ├─ Aprobadas
   └─ Rechazadas

📊 Reportes
   ├─ Reportes individuales
   └─ Reportes consolidados

🗑️ Papelera
   ├─ Fichas eliminadas
   ├─ Materias eliminadas
   ├─ Instructores eliminados
   └─ Aprendices eliminados

📜 Historial
   └─ Registro de cambios y auditoría
```

### **Características de la interfaz:**
- Dashboard con resumen visual de métricas
- Tablas con filtros y búsqueda
- Botones de acción claramente identificados
- Confirmaciones para acciones críticas (eliminar permanentemente)
- Indicadores visuales de estado (activo/suspendido)
- Exportación de datos con un clic

---

## 🔄 Flujo de Trabajo Típico

### **Creación de una ficha:**
1. Admin crea una ficha
2. Admin se convierte automáticamente en administrador de esa ficha
3. Admin asigna un líder (instructor principal)
4. Líder invita instructores
5. Instructores gestionan materias y toman asistencia
6. Admin supervisa todo el proceso

### **Supervisión de instructores:**
1. Admin accede a "Usuarios" → "Instructores"
2. Selecciona un instructor
3. Ve historial de actividad
4. Puede modificar horarios si es necesario
5. Puede cambiar asignaciones de materias

### **Gestión de excusas:**
1. Admin accede a "Excusas"
2. Ve todas las excusas pendientes
3. Puede aprobar/rechazar directamente
4. Ve estadísticas de excusas por ficha/aprendiz

### **Generación de reportes:**
1. Admin accede a "Reportes"
2. Selecciona tipo de reporte (individual o consolidado)
3. Selecciona ficha(s) y período
4. Descarga archivo XLSX
5. Analiza datos en Excel

### **Uso de papelera:**
1. Admin envía elemento a papelera
2. Elemento queda marcado como eliminado
3. Admin puede recuperarlo desde "Papelera"
4. O puede eliminarlo permanentemente (sin recuperación)

---

## 🔮 Funcionalidades Futuras

### **Planeadas para implementar más adelante:**

1. **Cambio de terminología:**
   - Renombrar "admin de ficha" a "Líder de ficha" en todo el código
   - Actualizar base de datos y frontend

2. **Super-Administrador (posible):**
   - Rol superior que gestiona múltiples administradores
   - Acceso global a toda la plataforma
   - Gestión de configuraciones del sistema

3. **Reportes avanzados:**
   - Reportes comparativos entre fichas
   - Análisis predictivo de asistencia
   - Identificación de patrones

4. **Notificaciones configurables:**
   - Admin puede elegir qué notificaciones recibir
   - Resúmenes diarios/semanales por email

5. **Gestión de fichas terminadas:**
   - Marcar fichas como "terminadas"
   - Archivar fichas antiguas
   - Ver historial de fichas completadas

---

## 📝 Notas Técnicas

### **Cambios en Base de Datos:**

#### **Tabla Usuario:**
- Modificar campo `rol` para incluir el nuevo valor: `'aprendiz' | 'instructor' | 'administrador'`
- Este campo ya existe en el sistema, solo se agrega el nuevo valor posible

#### **Tabla Ficha:**
- Agregar campo `administradorId` (referencia a Usuario)
- Mantener campo `adminId` (líder de ficha) hasta cambio de terminología

#### **Nueva Tabla: Papelera**
```sql
CREATE TABLE Papelera (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipoElemento ENUM('ficha', 'materia', 'instructor', 'aprendiz'),
  elementoId INT,
  fichaId INT,
  eliminadoPor INT, -- Usuario que lo eliminó
  fechaEliminacion DATETIME,
  datosOriginales JSON, -- Backup del elemento
  FOREIGN KEY (fichaId) REFERENCES Ficha(id),
  FOREIGN KEY (eliminadoPor) REFERENCES Usuario(id)
);
```

#### **Nueva Tabla: HistorialCambios**
```sql
CREATE TABLE HistorialCambios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fichaId INT,
  usuarioId INT, -- Quien hizo el cambio
  tipoEvento VARCHAR(50), -- 'crear', 'editar', 'eliminar', etc.
  entidad VARCHAR(50), -- 'ficha', 'materia', 'aprendiz', etc.
  entidadId INT,
  descripcion TEXT,
  datosAnteriores JSON,
  datosNuevos JSON,
  fechaHora DATETIME,
  FOREIGN KEY (fichaId) REFERENCES Ficha(id),
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
);
```

### **Middleware de Autorización:**
Crear middleware `esAdministrador` para proteger rutas:
```javascript
function esAdministrador(req, res, next) {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

function esAdministradorDeFicha(req, res, next) {
  const fichaId = req.params.fichaId;
  // Verificar que el usuario es admin de esa ficha
  // ...
}
```

### **Rutas Backend:**
```
/api/admin/fichas - GET, POST
/api/admin/fichas/:id - GET, PUT, DELETE
/api/admin/materias - GET, POST
/api/admin/usuarios/instructores - GET
/api/admin/usuarios/aprendices - GET
/api/admin/usuarios/:id - PUT, DELETE
/api/admin/excusas - GET
/api/admin/excusas/:id/aprobar - POST
/api/admin/excusas/:id/rechazar - POST
/api/admin/reportes/ficha/:id - GET
/api/admin/reportes/consolidado - GET
/api/admin/papelera - GET
/api/admin/papelera/:id/recuperar - POST
/api/admin/papelera/:id/eliminar - DELETE
/api/admin/historial/:fichaId - GET
```

---

## 🔄 Actualización del Documento

**⚠️ IMPORTANTE: Este documento DEBE actualizarse obligatoriamente cuando:**
- Se agreguen nuevas funcionalidades al rol de Administrador
- Se modifiquen permisos o limitaciones existentes
- Se complete el cambio de "admin de ficha" a "Líder de ficha"
- Se implementen funcionalidades futuras listadas en este documento
- Se modifiquen funcionalidades del rol de Instructor que afecten al Administrador
- Se realice cualquier cambio en el código relacionado con el rol de Administrador
- Se agreguen o eliminen restricciones
- Se modifique la estructura de la base de datos relacionada con este rol
- Se cambien flujos de trabajo o procesos

**Responsabilidad:** Cualquier desarrollador que modifique funcionalidades relacionadas con el rol de Administrador debe actualizar este documento inmediatamente después del cambio.

**Última actualización:** [Fecha de creación del documento]

---

## ✅ Checklist de Implementación

### **Fase 1: Base de Datos**
- [ ] Modificar campo `rol` en tabla Usuario para incluir valor 'administrador'
- [ ] Agregar campo `administradorId` a tabla Ficha
- [ ] Crear tabla Papelera
- [ ] Crear tabla HistorialCambios
- [ ] Actualizar formulario de registro para incluir opción de Administrador

### **Fase 2: Backend**
- [ ] Crear middleware de autorización
- [ ] Crear controlador `adminController.js`
- [ ] Implementar rutas de administrador
- [ ] Implementar lógica de papelera
- [ ] Implementar sistema de historial
- [ ] Implementar generación de reportes consolidados

### **Fase 3: Frontend**
- [ ] Crear layout de administrador
- [ ] Crear Dashboard
- [ ] Crear vista de Fichas
- [ ] Crear vista de Usuarios (Instructores/Aprendices)
- [ ] Crear vista de Materias
- [ ] Crear vista de Excusas
- [ ] Crear vista de Reportes
- [ ] Crear vista de Papelera
- [ ] Crear vista de Historial
- [ ] Implementar navegación y menú lateral

### **Fase 4: Funcionalidades Específicas**
- [ ] Sistema de invitación de administradores
- [ ] Modificación de horarios de instructores
- [ ] Cambio de líder de ficha
- [ ] Cambio de instructor de materia
- [ ] Aprobación/rechazo de excusas
- [ ] Reseteo de contraseñas
- [ ] Modificación de información de aprendices
- [ ] Exportación de reportes consolidados

### **Fase 5: Testing**
- [ ] Probar permisos y restricciones
- [ ] Probar papelera (enviar, recuperar, eliminar)
- [ ] Probar generación de reportes
- [ ] Probar historial de cambios
- [ ] Probar modificación de horarios
- [ ] Probar gestión de excusas

### **Fase 6: Refinamiento**
- [ ] Optimizar consultas de base de datos
- [ ] Mejorar UX/UI
- [ ] Agregar validaciones
- [ ] Documentar código
- [ ] Crear guía de usuario

---

**Documento creado para planificación del Rol de Administrador**
**Versión:** 1.0
