<template>
    <div class="container mt-4">
        <router-link to="/inventario" class="btn btn-secondary btn-sm mb-3">
            ← Volver al Inventario
        </router-link>

        <div v-if="isLoading" class="alert alert-info">Cargando datos...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-else-if="tool" class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">{{ tool.nombre }} ({{ tool.serial }})</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h4>Detalles Actuales</h4>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><strong>Marca:</strong> {{ tool.marca }}</li>
                            <li class="list-group-item"><strong>Tipo:</strong> {{ tool.tipo }}</li>
                            <li class="list-group-item"><strong>Estado:</strong> {{ tool.estado }}</li>
                            <li class="list-group-item"><strong>Creada:</strong> {{ new Date(tool.fechaCreacion).toLocaleDateString() }}</li>
                        </ul>
                    </div>

                    <div class="col-md-6">
                        <h4>Ubicación y Responsable</h4>
                        <div :class="['alert mt-3', tool.ubicacionActual === 'Empresa' ? 'alert-success' : 'alert-warning']">
                            <p class="mb-0"><strong>Ubicación Actual:</strong> {{ tool.ubicacionActual }}</p>
                            <p class="mb-0" v-if="tool.responsableActual"><strong>Responsable:</strong> {{ tool.responsableActual }}</p>
                            <p class="mb-0" v-else><strong>Responsable:</strong> Ninguno (En empresa)</p>
                        </div>

                        <button 
                            v-if="tool.ubicacionActual !== 'Empresa'" 
                            class="btn btn-success mt-3" 
                            @click="openEntryModal(getPendingHistoryId())"
                        >
                            <i class="bi bi-box-arrow-in-left"></i> Registrar Ingreso
                        </button>
                    </div>
                </div>

                <hr class="my-4">
                
                <h4>Historial de Movimientos</h4>
                <div v-if="history.length === 0" class="alert alert-light">No hay movimientos registrados.</div>
                <ul v-else class="list-group">
                    <li v-for="item in history" :key="item.id" class="list-group-item">
                        Retirada por **{{ item.responsable }}** (ID) a **{{ item.ubicacion }}** el 
                        {{ new Date(item.fechaRetiro).toLocaleDateString() }}.
                        <template v-if="item.fechaIngreso">
                            Ingreso: {{ new Date(item.fechaIngreso).toLocaleDateString() }}.
                        </template>
                        <template v-else>
                            <span class="badge bg-danger">PENDIENTE DE INGRESO</span>
                        </template>
                        <p v-if="item.observaciones" class="small mt-1">Obs: {{ item.observaciones }}</p>
                    </li>
                </ul>

            </div>
        </div>

        <div v-if="showEntryModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Registrar Ingreso de {{ tool?.nombre }}</h5>
                        <button type="button" class="btn-close" @click="showEntryModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleEntrySubmit">
                            <div class="mb-3">
                                <label for="fechaIngreso" class="form-label">Fecha de Ingreso</label>
                                <input type="datetime-local" class="form-control" v-model="entryData.fechaIngreso" required>
                            </div>
                            <div class="mb-3">
                                <label for="observaciones" class="form-label">Observaciones (Opcional)</label>
                                <textarea class="form-control" v-model="entryData.observaciones"></textarea>
                            </div>
                            <button type="submit" class="btn btn-success">Confirmar Ingreso</button>
                            <div v-if="entryError" class="alert alert-danger mt-3">{{ entryError }}</div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { SupabaseToolService } from '../../api/tools';
import { SupabaseMovementService } from '../../api/movement';
import { RegisterEntry } from '../../application/useCases/Movements/RegisterEntry';
import type { Tool } from '../../domain/entities/Tool';
import type { History } from '../../domain/entities/History';

const route = useRoute();
const tool = ref<Tool | null>(null);
const history = ref<History[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const showEntryModal = ref(false);
const entryData = ref({
    historialId: '',
    fechaIngreso: new Date().toISOString().slice(0, 16), // Formato datetime-local
    observaciones: '' as string | null,
});
const entryError = ref<string | null>(null);

const toolService = new SupabaseToolService();
const movementService = new SupabaseMovementService();
const registerEntryUseCase = new RegisterEntry(movementService);

// ------------------------------------
// Lógica de Carga de Datos
// ------------------------------------
const loadDetails = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const toolId = route.params.id as string;
        
        // 1. Cargar detalles de la herramienta
        tool.value = await toolService.getToolById(toolId);

        // 2. Cargar historial de movimientos directamente.
        // Aquí historyData ya es el array History[], sin necesidad de .data
        const historyData = await movementService.getHistoryByToolId(toolId);
        
        // Ordenar historial por fecha de retiro descendente
        history.value = historyData.sort((a, b) => 
            new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime()
        );

    } catch (e: any) {
        error.value = `No se pudo cargar la herramienta: ${e.message}`;
    } finally {
        isLoading.value = false;
    }
};

// Función helper para encontrar el ID del movimiento pendiente
const getPendingHistoryId = (): string => {
    const pending = history.value.find(h => h.fechaIngreso === null);
    return pending ? pending.id : '';
};

// ------------------------------------
// Lógica de Ingreso
// ------------------------------------
const openEntryModal = (historialId: string) => {
    entryData.value.historialId = historialId;
    entryError.value = null;
    showEntryModal.value = true;
};

const handleEntrySubmit = async () => {
    if (!tool.value) return;

    entryError.value = null;
    
    try {
        await registerEntryUseCase.execute({
            herramientaId: tool.value.id,
            historialId: entryData.value.historialId,
            fechaIngreso: entryData.value.fechaIngreso,
            observaciones: entryData.value.observaciones,
        });

        alert('Ingreso registrado con éxito.');
        showEntryModal.value = false;
        // Recargar los datos para actualizar el estado y el historial
        await loadDetails(); 

    } catch (e: any) {
        entryError.value = `Fallo al registrar ingreso: ${e.message}`;
    }
};

onMounted(loadDetails);
</script>