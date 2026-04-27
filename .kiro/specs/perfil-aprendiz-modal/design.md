# Design Document: Modal de Perfil del Aprendiz

## Overview

El Modal de Perfil del Aprendiz es un componente React que proporciona una vista detallada de la información de un estudiante dentro del contexto de una ficha específica. El modal se integra con el sistema existente de FichaDetalle.jsx y reutiliza componentes establecidos como EnrollModal y MateriasEvitadasModal.

### Propósito

Centralizar la visualización y gestión de información del aprendiz en un único modal accesible desde la lista de estudiantes, permitiendo a instructores ver información y a administradores realizar modificaciones.

### Alcance

- Visualización de información personal del aprendiz
- Gestión de métodos biométricos (solo admin)
- Visualización y gestión de materias evitadas (solo admin)
- Eliminación del aprendiz de la ficha (solo admin)
- Restricción de información al contexto de la ficha actual

### Fuera de Alcance

- Edición de información personal del aprendiz (nombre, documento, email)
- Gestión de fichas múltiples desde el mismo modal
- Historial de asistencia del aprendiz
- Calificaciones o evaluaciones

## Architecture

### Component Structure

```
AprendizPerfilModal (Principal)
├── Modal (Wrapper reutilizable)
├── EnrollModal (Gestión biométrica)
└── MateriasEvitadasModal (Gestión de materias evitadas)
```

### Integration Points

1. **FichaDetalle.jsx**: Componente padre que invoca el modal
2. **Backend API**: Endpoints para actualización de datos
3. **EnrollModal**: Modal existente para gestión biométrica
4. **MateriasEvitadasModal**: Modal existente para gestión de materias evitadas

### Data Flow

```
FichaDetalle
    ↓ (aprendiz, fichaId, isAdmin)
AprendizPerfilModal
    ↓ (solicita actualización)
Backend API
    ↓ (datos actualizados)
FichaDetalle (callback onBiometricUpdate)
    ↓ (refresca datos)
AprendizPerfilModal (actualiza vista)
```

## Components and Interfaces

### AprendizPerfilModal Component

**Props Interface:**
```typescript
interface AprendizPerfilModalProps {
  open: boolean;                    // Control de visibilidad del modal
  onClose: () => void;              // Callback para cerrar el modal
  aprendiz: Aprendiz;               // Objeto con información del aprendiz
  isAdmin: boolean;                 // Indica si el usuario actual es admin
  fichaId: string;                  // ID de la ficha actual
  materias: Materia[];              // Lista de materias de la ficha
  onRemoveAprendiz: (id: string) => void;  // Callback para eliminar aprendiz
  onBiometricUpdate: () => Promise<void>;  // Callback para actualizar datos
}
```

**Aprendiz Data Model:**
```typescript
interface Aprendiz {
  id: string;
  fullName: string;
  document: string;
  email: string;
  avatarUrl?: string;
  nfcUid?: string;
  huellas: number[];
  faceDescriptor: number[];
  materiasEvitadas: MateriaEvitada[];
}

interface MateriaEvitada {
  id: string;
  materiaId: string;
  materia: {
    nombre: string;
    tipo: string;
  };
}
```

### Component Sections

1. **Header Section**: Avatar/iniciales + nombre + documento + email
2. **Biometric Methods Section**: Tarjetas visuales para NFC, huellas, facial
3. **Avoided Subjects Section**: Lista de materias evitadas de la ficha actual
4. **Admin Actions Section**: Botón de eliminación (solo admin)

### State Management

```typescript
const [modalEnroll, setModalEnroll] = useState(false);
const [modalMateriasEvitadas, setModalMateriasEvitadas] = useState(false);
const [localAprendiz, setLocalAprendiz] = useState(aprendiz);
```

**State Synchronization:**
- `localAprendiz` se sincroniza con `aprendiz` prop mediante `useEffect`
- Actualizaciones biométricas disparan `onBiometricUpdate` callback
- Callback refresca datos en FichaDetalle y propaga cambios al modal

## Data Models

### Database Schema (Prisma)

**User Model (Aprendiz):**
```prisma
model User {
  id              String               @id @default(cuid())
  userType        String               // "aprendiz"
  fullName        String
  document        String               @unique
  email           String               @unique
  avatarUrl       String?
  nfcUid          String?              @unique
  huellas         Int[]                @default([])
  faceDescriptor  Float[]              @default([])
  fichasApr       Ficha[]              @relation("Aprendices")
  materiasEvitadas MateriaEvitada[]
}
```

**MateriaEvitada Model:**
```prisma
model MateriaEvitada {
  id         String   @id @default(cuid())
  aprendizId String
  materiaId  String
  createdAt  DateTime @default(now())
  aprendiz   User     @relation(...)
  materia    Materia  @relation(...)
  
  @@unique([aprendizId, materiaId])
}
```

### API Endpoints

**Existing Endpoints Used:**
- `GET /api/fichas/:id` - Obtener datos de ficha con aprendices
- `DELETE /api/fichas/:id/aprendices/:aprendizId` - Eliminar aprendiz de ficha
- Endpoints de EnrollModal para gestión biométrica
- Endpoints de MateriasEvitadasModal para gestión de materias evitadas

## Error Handling

### Error Scenarios

1. **Aprendiz no encontrado**: Modal no se renderiza si `aprendiz` es null/undefined
2. **Fallo en actualización biométrica**: EnrollModal maneja errores internamente
3. **Fallo en eliminación de aprendiz**: Toast de error en FichaDetalle
4. **Fallo en carga de avatar**: Fallback a iniciales con color de fondo

### Error Display Strategy

- **Toast notifications**: Para errores de operaciones (eliminación, actualización)
- **Inline messages**: Dentro de modales anidados (EnrollModal, MateriasEvitadasModal)
- **Graceful degradation**: Avatar fallback, mensajes de "sin datos"

### Recovery Mechanisms

- **Retry automático**: Callback `onBiometricUpdate` reintenta carga de datos
- **Estado local**: `localAprendiz` mantiene última versión conocida
- **Cierre seguro**: Modal puede cerrarse en cualquier momento sin pérdida de datos

## Testing Strategy

### Why Property-Based Testing Does NOT Apply

Este feature NO es apropiado para property-based testing porque:

1. **Es principalmente UI rendering**: El modal muestra información, no transforma datos
2. **No hay propiedades universales**: Las interacciones son específicas del contexto (admin vs instructor)
3. **Lógica de presentación**: La mayoría del código es JSX y estilos, no lógica de negocio
4. **Dependencias de componentes**: Integración con Modal, EnrollModal, MateriasEvitadasModal

### Recommended Testing Approach

#### 1. Snapshot Tests

**Propósito**: Verificar que el renderizado del modal sea consistente

```javascript
describe('AprendizPerfilModal Snapshots', () => {
  test('renders correctly for instructor view', () => {
    const { container } = render(
      <AprendizPerfilModal 
        open={true}
        aprendiz={mockAprendiz}
        isAdmin={false}
        {...otherProps}
      />
    );
    expect(container).toMatchSnapshot();
  });

  test('renders correctly for admin view', () => {
    const { container } = render(
      <AprendizPerfilModal 
        open={true}
        aprendiz={mockAprendiz}
        isAdmin={true}
        {...otherProps}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

#### 2. Integration Tests

**Propósito**: Verificar interacciones entre componentes

**Test Cases:**
- Abrir modal desde FichaDetalle al hacer click en tarjeta de aprendiz
- Abrir EnrollModal al hacer click en "Gestionar" métodos biométricos (admin)
- Abrir MateriasEvitadasModal al hacer click en "Gestionar" materias evitadas (admin)
- Cerrar modal y verificar que callbacks se ejecutan correctamente
- Eliminar aprendiz y verificar que se cierra el modal y se actualiza la lista

#### 3. Unit Tests (Example-Based)

**Propósito**: Verificar comportamiento específico de funciones y lógica

**Test Cases:**

**Requirement 1: Acceso al Modal**
- ✓ Modal se renderiza cuando `open={true}`
- ✓ Modal no se renderiza cuando `open={false}`
- ✓ Callback `onClose` se ejecuta al cerrar modal

**Requirement 2: Visualización de Información Personal**
- ✓ Muestra nombre completo del aprendiz
- ✓ Muestra documento del aprendiz
- ✓ Muestra email del aprendiz
- ✓ Muestra avatar cuando `avatarUrl` existe
- ✓ Muestra iniciales cuando `avatarUrl` es null

**Requirement 3: Visualización de Métodos Biométricos**
- ✓ Muestra estado "Registrado" cuando `nfcUid` existe
- ✓ Muestra estado "No registrado" cuando `nfcUid` es null
- ✓ Muestra cantidad correcta de huellas registradas
- ✓ Muestra estado "Registrado" cuando `faceDescriptor.length === 128`
- ✓ Muestra estado "No registrado" cuando `faceDescriptor.length === 0`

**Requirement 4 & 5: Gestión Biométrica (Admin)**
- ✓ Muestra botón "Gestionar" cuando `isAdmin={true}`
- ✓ Oculta botón "Gestionar" cuando `isAdmin={false}`
- ✓ Abre EnrollModal al hacer click en "Gestionar"
- ✓ Ejecuta `onBiometricUpdate` al cerrar EnrollModal

**Requirement 6: Visualización de Materias Evitadas**
- ✓ Muestra lista de materias evitadas cuando existen
- ✓ Muestra mensaje "Participa en todas las materias" cuando lista está vacía
- ✓ Muestra solo materias de la ficha actual (filtrado por `fichaId`)

**Requirement 7: Eliminación de Aprendiz (Admin)**
- ✓ Muestra botón "Eliminar aprendiz" cuando `isAdmin={true}`
- ✓ Oculta botón "Eliminar aprendiz" cuando `isAdmin={false}`
- ✓ Ejecuta callback `onRemoveAprendiz` con ID correcto

**Requirement 8: Restricciones de Acceso**
- ✓ Filtra materias evitadas por `fichaId`
- ✓ No muestra selector de ficha
- ✓ Contexto de ficha se determina automáticamente

**Requirement 9: Consistencia Visual**
- ✓ Usa color principal `#4285F4` para elementos azules
- ✓ Usa componente `Modal` existente
- ✓ Usa iconos de `lucide-react`
- ✓ Usa clases CSS consistentes con el sistema

#### 4. Visual Regression Tests (Opcional)

**Propósito**: Detectar cambios visuales no intencionados

**Herramientas sugeridas:**
- Percy.io
- Chromatic
- BackstopJS

**Escenarios:**
- Modal con aprendiz sin avatar
- Modal con aprendiz con avatar
- Modal con todos los métodos biométricos registrados
- Modal sin métodos biométricos registrados
- Modal con materias evitadas
- Modal sin materias evitadas
- Vista de instructor (sin botones de admin)
- Vista de admin (con botones de admin)

### Test Coverage Goals

- **Unit Tests**: 80%+ de cobertura de funciones y branches
- **Integration Tests**: Todos los flujos de usuario principales
- **Snapshot Tests**: Todas las variantes de renderizado (admin/instructor, con/sin datos)

### Testing Tools

- **Framework**: Jest + React Testing Library
- **Mocking**: Mock Service Worker (MSW) para API calls
- **Assertions**: @testing-library/jest-dom
- **Coverage**: Jest coverage reports

## Implementation Notes

### Existing Implementation

El componente `AprendizPerfilModal.jsx` ya está implementado y funcional. El diseño documenta la implementación existente para:

1. Facilitar mantenimiento futuro
2. Guiar testing y validación
3. Documentar decisiones de diseño
4. Servir como referencia para features similares

### Key Design Decisions

1. **Reutilización de componentes**: EnrollModal y MateriasEvitadasModal se reutilizan en lugar de duplicar lógica
2. **Estado local sincronizado**: `localAprendiz` permite actualizaciones optimistas mientras se espera confirmación del backend
3. **Callbacks para actualización**: Patrón de callback permite a FichaDetalle controlar cuándo refrescar datos
4. **Restricción por contexto**: Modal solo muestra información relevante a la ficha actual, sin selector de ficha

### Visual Design Patterns

**Color Coding:**
- Azul (`#4285F4`): NFC, elementos principales
- Púrpura (`#8b5cf6`): Huellas dactilares
- Verde (`#34A853`): Reconocimiento facial
- Rojo (`#EA4335`): Materias evitadas, acciones destructivas

**Layout:**
- Grid de 3 columnas para métodos biométricos
- Espaciado consistente (gap-3, gap-4, gap-6)
- Bordes redondeados (rounded-xl, rounded-2xl)
- Hover states para interactividad

### Accessibility Considerations

- Uso de elementos semánticos (`<button>`, `<div>`)
- Iconos acompañados de texto descriptivo
- Contraste de colores adecuado (WCAG AA)
- Navegación por teclado (heredada de Modal component)
- ARIA labels en botones de acción

### Performance Considerations

- **Lazy loading**: Modales anidados solo se renderizan cuando están abiertos
- **Memoization**: Considerar `React.memo` si el modal se re-renderiza frecuentemente
- **Optimistic updates**: `localAprendiz` permite UI responsiva mientras se espera backend
- **Scroll virtual**: Para listas largas de materias evitadas (si es necesario en el futuro)

## Future Enhancements

### Phase 2 (Potential)

1. **Historial de asistencia**: Mostrar resumen de asistencia del aprendiz en esta ficha
2. **Edición de información personal**: Permitir a admin editar nombre, documento, email
3. **Notas del instructor**: Campo de texto libre para notas sobre el aprendiz
4. **Exportación de datos**: Botón para exportar información del aprendiz a PDF/Excel

### Phase 3 (Potential)

1. **Múltiples fichas**: Selector para ver información del aprendiz en otras fichas
2. **Historial de cambios**: Log de modificaciones realizadas al perfil
3. **Notificaciones**: Enviar notificación al aprendiz cuando se modifica su perfil
4. **Integración con calendario**: Mostrar próximas clases del aprendiz

## References

- **Requirements Document**: `.kiro/specs/perfil-aprendiz-modal/requirements.md`
- **Existing Implementation**: `frontend/src/components/AprendizPerfilModal.jsx`
- **Parent Component**: `frontend/src/pages/instructor/FichaDetalle.jsx`
- **Related Components**: 
  - `frontend/src/components/EnrollModal.jsx`
  - `frontend/src/components/MateriasEvitadasModal.jsx`
  - `frontend/src/components/Modal.jsx`
- **Database Schema**: `backend/prisma/schema.prisma`
