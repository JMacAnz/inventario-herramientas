# Historial de Movimientos - Documentación

## Descripción
La vista `ToolMovementsHistoryView` permite visualizar el **historial completo de todos los movimientos** (retiros y devoluciones) que han tenido todas las herramientas del inventario.

## Ubicación
- **Archivo Vista**: `src/views/movements/ToolMovementsHistoryView.vue`
- **Use Case**: `src/application/useCases/Movements/ListAllMovements.ts`
- **Ruta**: `/historial-movimientos`

## Características

### 1. **Visualización Completa**
- Tabla interactiva con todos los movimientos históricos
- Información detallada de cada movimiento (herramienta, tipo, fechas, responsable, ubicación)
- Información de herramientas relacionadas (nombre y serial)

### 2. **Filtros Avanzados**
- **Búsqueda por término**: Busca en nombre de herramienta, serial, ubicación y responsable
- **Filtro por tipo**: Retiro o Devolución
- **Filtro por estado**: 
  - Pendiente (Abierto) - movimientos sin devolución registrada
  - Completado (Cerrado) - movimientos con devolución registrada
- **Limpieza de filtros**: Botón para resetear todos los filtros

### 3. **Ordenamiento**
- Haz clic en cualquier encabezado de columna para ordenar
- Alterna entre orden ascendente y descendente
- El ordenamiento por defecto es por fecha de retiro (más recientes primero)
- Columnas ordenables:
  - Herramienta
  - Serial
  - Tipo
  - Ubicación
  - Responsable
  - Fecha Retiro
  - Fecha Devolución

### 4. **Estadísticas**
Se muestra un resumen de estadísticas:
- **Total de Movimientos**: Cantidad total de registros
- **Movimientos Pendientes**: Herramientas sin devolución
- **Movimientos Completados**: Movimientos cerrados
- **Herramientas Únicas**: Total de herramientas con movimientos registrados

### 5. **Detalles del Movimiento**
- Modal que muestra información completa de un movimiento seleccionado
- Indicadores visuales para movimientos pendientes vs completados
- Muestra observaciones si existen

### 6. **Estados Visuales**
- **Badges**: Indicadores de tipo y estado
  - Retiro (amarillo)
  - Devolución (azul)
  - Completado (verde)
  - Abierto (rojo)
- **Colores por urgencia**: Movimientos pendientes destacados en rojo

## Acceso a la Vista

### Desde el Router
La ruta está protegida y requiere autenticación:
```typescript
{
  path: "/historial-movimientos",
  name: "HistorialMovimientos",
  component: ToolMovementsHistoryView,
  meta: { requiresAuth: true },
}
```

### Navegación
```typescript
// Usar router-link en el template
<router-link to="/historial-movimientos">Ver Historial</router-link>

// O con el nombre de la ruta
<router-link :to="{ name: 'HistorialMovimientos' }">Ver Historial</router-link>

// O programáticamente
router.push('/historial-movimientos');
```

## Datos que Muestra

```typescript
interface MovementDisplay {
  id: string;                           // ID del registro de historial
  herramientaId: string;                // ID de la herramienta
  herramientaNombre: string;            // Nombre de la herramienta
  serial: string;                       // Serial de la herramienta
  tipo: 'Retiro' | 'Devolucion';       // Tipo de movimiento
  fechaRetiro: Date;                    // Fecha en que se realizó el retiro
  fechaIngreso: Date | null;            // Fecha de devolución (null si pendiente)
  responsable: string;                  // Nombre del responsable
  ubicacion: string;                    // Obra o ubicación del retiro
  observaciones: string | null;         // Notas adicionales
}
```

## Relaciones con Otras Vistas

| Vista | Relación |
|-------|----------|
| `PendingMovementsView` | Muestra solo movimientos PENDIENTES (sin devolución) |
| `ToolMovementsHistoryView` | Muestra TODOS los movimientos (pendientes + completados) |
| `ToolDetailView` | Muestra historial de UNA herramienta específica |

## Estructura de Datos en Base de Datos

### Tabla: HistorialHerramientas
```sql
- id (PK)
- herramientaId (FK)
- fechaRetiro
- fechaIngreso (NULL si pendiente)
- responsable (FK)
- ubicacion
- observaciones
- createdAt
```

### Relaciones JOIN
- `herramientaId` → `Herramientas` (nombre, serial)
- `responsable` → `profiles` (nombre, apellido)

## Use Case: ListAllMovements

```typescript
// Uso
const movementService = new SupabaseMovementService();
const listAllMovementsUseCase = new ListAllMovements(movementService);
const movements = await listAllMovementsUseCase.execute();
```

**Responsabilidades**:
- Obtener todos los movimientos del historial
- Unir datos de herramientas y responsables
- Ordenar por fecha (más recientes primero)
- Manejo de errores

## Estilos y Componentes Bootstrap
- **Tabla**: `table table-bordered table-hover`
- **Badges**: Estados visuales del movimiento
- **Modal**: Detalles interactivos
- **Cards**: Estadísticas resumidas
- **Alertas**: Estados y errores

## Mejoras Futuras Sugeridas
1. Exportar a CSV/Excel el historial completo
2. Filtro por rango de fechas
3. Gráficos de actividad (movimientos por mes/herramienta)
4. Integración con auditoría (quién vio qué movimiento)
5. Búsqueda avanzada por criterios múltiples
6. Paginación para grandes volúmenes de datos
