<template>
    <div class="container mt-4">
        <h2>Movimientos Pendientes de Ingreso ⚠️</h2>
        <p class="text-muted">Herramientas actualmente en obra sin registrar su devolución.</p>

        <div v-if="isLoading" class="alert alert-info">Cargando movimientos...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-else class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Herramienta</th>
                        <th>Serial</th>
                        <th>Ubicación (Obra)</th>
                        <th>Responsable</th>
                        <th>Fecha Retiro</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="movement in pendingMovements" :key="movement.id">
                        <td>{{ movement.herramienta.nombre }}</td>
                        <td>{{ movement.herramienta.serial }}</td>
                        <td>{{ movement.ubicacion }}</td>
                        <td>{{ movement.responsable.nombre }} {{ movement.responsable.apellido }}</td>
                        <td>{{ new Date(movement.fechaRetiro).toLocaleDateString() }}</td>
                        <td>
                            <button class="btn btn-sm btn-success" @click="openEntryModal(movement)">
                                Registrar Ingreso
                            </button>
                        </td>
                    </tr>
                    <tr v-if="pendingMovements.length === 0">
                        <td colspan="6" class="text-center">¡No hay herramientas pendientes de ingreso!</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ListPendingMovements } from '../../application/useCases/Movements/ListPendingMovements';
import { SupabaseMovementService } from '../../api/movement';

// NOTA: Replicamos la interfaz aquí, idealmente debería venir de un archivo de tipos común.
interface PendingMovementDisplay {
    id: string; // ID del Historial
    fechaRetiro: string;
    ubicacion: string;
    herramienta: { nombre: string; serial: string; };
    responsable: { nombre: string; apellido: string; id: string; }; // Necesitamos el ID del responsable para el join
}

const pendingMovements = ref<PendingMovementDisplay[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const listPendingUseCase = new ListPendingMovements(new SupabaseMovementService());

const loadPendingMovements = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const data = await listPendingUseCase.execute();
        
        // NOTA: El resultado del select con join implícito de Supabase es un array de objetos
        // que contienen anidaciones (herramienta: {...}, responsable: {...}).
        // Asumimos que el tipo de retorno de listPendingUseCase.execute() es correcto.
        pendingMovements.value = (data as unknown) as PendingMovementDisplay[];

    } catch (e: any) {
        error.value = 'Error al cargar movimientos pendientes: ' + e.message;
    } finally {
        isLoading.value = false;
    }
};

const openEntryModal = (movement: PendingMovementDisplay) => {
    // Redirigir al detalle para cerrar el movimiento o usar un modal local
    // Por simplicidad, aquí usarías un modal similar al de ToolDetailView.
    alert(`Abrir modal de ingreso para la herramienta: ${movement.herramienta.nombre}`);
    // Idealmente: Abrir el modal, procesar el ingreso y luego recargar loadPendingMovements()
};


onMounted(loadPendingMovements);
</script>