<template>
  <div class="container-fluid mt-4">
    <div class="row mb-4">
      <div class="col-md-8">
        <h2>Historial de Movimientos 📋</h2>
        <p class="text-muted">Visualiza todos los movimientos (retiros y devoluciones) de las herramientas</p>
      </div>
      <div class="col-md-4">
        <button @click="refreshMovements" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4 p-3">
      <div class="row g-3">
        <div class="col-md-3">
          <input
            v-model="filters.searchTerm"
            type="text"
            class="form-control"
            placeholder="Buscar por nombre, serial o ubicación..."
          />
        </div>
        <div class="col-md-3">
          <select v-model="filters.movementType" class="form-select">
            <option value="">Todos los tipos</option>
            <option value="Retiro">Retiro</option>
            <option value="Devolucion">Devolución</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="filters.status" class="form-select">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente (Abierto)</option>
            <option value="completed">Completado (Cerrado)</option>
          </select>
        </div>
        <div class="col-md-3">
          <button @click="clearFilters" class="btn btn-outline-secondary w-100">
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="isLoading && allMovements.length === 0" class="alert alert-info">
      <div class="spinner-border spinner-border-sm me-2"></div>
      Cargando movimientos...
    </div>
    <div v-else-if="error" class="alert alert-danger">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Tabla de movimientos -->
    <div v-else class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-dark">
          <tr>
            <th @click="sortBy('herramientaNombre')" style="cursor: pointer;">
              Herramienta
              <i v-if="sortConfig.key === 'herramientaNombre'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('serial')" style="cursor: pointer;">
              Serial
              <i v-if="sortConfig.key === 'serial'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('tipo')" style="cursor: pointer;">
              Tipo
              <i v-if="sortConfig.key === 'tipo'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('ubicacion')" style="cursor: pointer;">
              Ubicación
              <i v-if="sortConfig.key === 'ubicacion'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('responsable')" style="cursor: pointer;">
              Responsable
              <i v-if="sortConfig.key === 'responsable'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('fechaRetiro')" style="cursor: pointer;">
              Fecha Retiro
              <i v-if="sortConfig.key === 'fechaRetiro'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th @click="sortBy('fechaIngreso')" style="cursor: pointer;">
              Fecha Devolución
              <i v-if="sortConfig.key === 'fechaIngreso'" 
                 :class="sortConfig.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
            </th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in filteredAndSortedMovements" :key="movement.id">
            <td>{{ movement.herramientaNombre }}</td>
            <td><code>{{ movement.serial }}</code></td>
            <td>
              <span v-if="movement.tipo === 'Retiro'" class="badge bg-warning text-dark">
                Retiro
              </span>
              <span v-else class="badge bg-info">
                Devolución
              </span>
            </td>
            <td>{{ movement.ubicacion }}</td>
            <td>{{ movement.responsable }}</td>
            <td>{{ formatDate(movement.fechaRetiro) }}</td>
            <td>
              <span v-if="movement.fechaIngreso">
                {{ formatDate(movement.fechaIngreso) }}
              </span>
              <span v-else class="text-danger">
                <strong>Pendiente</strong>
              </span>
            </td>
            <td>
              <span v-if="movement.fechaIngreso" class="badge bg-success">
                Completado
              </span>
              <span v-else class="badge bg-danger">
                Abierto
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="viewMovementDetails(movement)"
                title="Ver detalles"
              >
                <i class="bi bi-eye"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredAndSortedMovements.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">
              No se encontraron movimientos que coincidan con los filtros.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estadísticas -->
    <div v-if="allMovements.length > 0" class="row mt-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Total de Movimientos</h5>
            <p class="display-6">{{ allMovements.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Movimientos Pendientes</h5>
            <p class="display-6 text-danger">{{ pendingMovementsCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Movimientos Completados</h5>
            <p class="display-6 text-success">{{ completedMovementsCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Herramientas Únicas</h5>
            <p class="display-6 text-info">{{ uniqueToolsCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <div
      v-if="selectedMovement"
      class="modal fade show"
      :class="{ 'd-block': showDetailsModal }"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Movimiento</h5>
            <button
              type="button"
              class="btn-close"
              @click="showDetailsModal = false"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Herramienta:</strong>
                <p>{{ selectedMovement.herramientaNombre }}</p>
              </div>
              <div class="col-md-6">
                <strong>Serial:</strong>
                <p><code>{{ selectedMovement.serial }}</code></p>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Tipo de Movimiento:</strong>
                <p>
                  <span :class="selectedMovement.tipo === 'Retiro' ? 'badge bg-warning text-dark' : 'badge bg-info'">
                    {{ selectedMovement.tipo }}
                  </span>
                </p>
              </div>
              <div class="col-md-6">
                <strong>Estado:</strong>
                <p>
                  <span :class="selectedMovement.fechaIngreso ? 'badge bg-success' : 'badge bg-danger'">
                    {{ selectedMovement.fechaIngreso ? 'Completado' : 'Abierto' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Ubicación:</strong>
                <p>{{ selectedMovement.ubicacion }}</p>
              </div>
              <div class="col-md-6">
                <strong>Responsable:</strong>
                <p>{{ selectedMovement.responsable }}</p>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Fecha de Retiro:</strong>
                <p>{{ formatDate(selectedMovement.fechaRetiro) }}</p>
              </div>
              <div class="col-md-6">
                <strong>Fecha de Devolución:</strong>
                <p>{{ selectedMovement.fechaIngreso ? formatDate(selectedMovement.fechaIngreso) : 'Pendiente' }}</p>
              </div>
            </div>
            <div class="row mb-3" v-if="selectedMovement.observaciones">
              <div class="col-12">
                <strong>Observaciones:</strong>
                <p>{{ selectedMovement.observaciones }}</p>
              </div>
            </div>
            <div class="row mb-3" v-if="selectedMovement.fechaIngreso === null">
              <div class="col-12">
                <div class="alert alert-warning">
                  <strong>⚠️ Este movimiento está abierto</strong> - La herramienta aún no ha sido devuelta.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetailsModal = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop del modal -->
    <div
      v-if="showDetailsModal"
      class="modal-backdrop fade show"
      @click="showDetailsModal = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { SupabaseMovementService } from '../../api/movement';
import { ListAllMovements } from '../../application/useCases/Movements/ListAllMovements';

interface MovementDisplay {
  id: string;
  herramientaId: string;
  herramientaNombre: string;
  serial: string;
  tipo: 'Retiro' | 'Devolucion';
  fechaRetiro: Date;
  fechaIngreso: Date | null;
  responsable: string;
  ubicacion: string;
  observaciones: string | null;
}

interface Filters {
  searchTerm: string;
  movementType: string;
  status: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const allMovements = ref<MovementDisplay[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const selectedMovement = ref<MovementDisplay | null>(null);
const showDetailsModal = ref(false);

const filters = ref<Filters>({
  searchTerm: '',
  movementType: '',
  status: '',
});

const sortConfig = ref<SortConfig>({
  key: 'fechaRetiro',
  direction: 'desc',
});

const movementService = new SupabaseMovementService();
const listAllMovementsUseCase = new ListAllMovements(movementService);

// Cargar todos los movimientos
const loadAllMovements = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const movements = await listAllMovementsUseCase.execute();

    // Mapear y transformar los datos
    allMovements.value = movements.map((m: any) => ({
      id: m.id,
      herramientaId: m.herramientaId,
      herramientaNombre: m.herramienta?.nombre || 'Desconocido',
      serial: m.herramienta?.serial || 'N/A',
      tipo: m.fechaRetiro && !m.fechaIngreso ? 'Retiro' : 'Devolucion',
      fechaRetiro: new Date(m.fechaRetiro),
      fechaIngreso: m.fechaIngreso ? new Date(m.fechaIngreso) : null,
      responsable: m.responsable ? `${m.responsable.nombre} ${m.responsable.apellido}` : 'Desconocido',
      ubicacion: m.ubicacion || 'N/A',
      observaciones: m.observaciones || null,
    }));
  } catch (e: any) {
    error.value = `Error al cargar movimientos: ${e.message}`;
    console.error(error.value, e);
  } finally {
    isLoading.value = false;
  }
};

// Filtrar y ordenar movimientos
const filteredAndSortedMovements = computed(() => {
  let filtered = allMovements.value;

  // Aplicar filtros
  if (filters.value.searchTerm) {
    const term = filters.value.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.herramientaNombre.toLowerCase().includes(term) ||
        m.serial.toLowerCase().includes(term) ||
        m.ubicacion.toLowerCase().includes(term) ||
        m.responsable.toLowerCase().includes(term)
    );
  }

  if (filters.value.movementType) {
    filtered = filtered.filter((m) => m.tipo === filters.value.movementType);
  }

  if (filters.value.status) {
    if (filters.value.status === 'pending') {
      filtered = filtered.filter((m) => m.fechaIngreso === null);
    } else if (filters.value.status === 'completed') {
      filtered = filtered.filter((m) => m.fechaIngreso !== null);
    }
  }

  // Aplicar ordenamiento
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortConfig.value.key as keyof MovementDisplay];
    let bVal: any = b[sortConfig.value.key as keyof MovementDisplay];

    if (aVal instanceof Date && bVal instanceof Date) {
      aVal = aVal.getTime();
      bVal = bVal.getTime();
    }

    if (aVal < bVal) return sortConfig.value.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.value.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
});

// Estadísticas
const pendingMovementsCount = computed(() =>
  allMovements.value.filter((m) => m.fechaIngreso === null).length
);

const completedMovementsCount = computed(() =>
  allMovements.value.filter((m) => m.fechaIngreso !== null).length
);

const uniqueToolsCount = computed(() => {
  const toolIds = new Set(allMovements.value.map((m) => m.herramientaId));
  return toolIds.size;
});

// Funciones
const sortBy = (key: string) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
};

const clearFilters = () => {
  filters.value = {
    searchTerm: '',
    movementType: '',
    status: '',
  };
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const viewMovementDetails = (movement: MovementDisplay) => {
  selectedMovement.value = movement;
  showDetailsModal.value = true;
};

const refreshMovements = () => {
  loadAllMovements();
};

onMounted(loadAllMovements);
</script>

<style scoped>
.modal.d-block {
  display: block !important;
}

table th {
  user-select: none;
}

table th i {
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
