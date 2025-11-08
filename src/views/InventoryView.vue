<template>
    <div class="container-fluid mt-4">
        <h2 class="mb-4 text-primary">Inventario de Herramientas 🛠️</h2>
        
        <!-- Controles de Filtro/Búsqueda (AHORA IMPLEMENTADO) -->
        <div class="row mb-3">
            <div class="col-md-6">
                <!-- Campo de búsqueda reactivo -->
                <input 
                    type="text" 
                    class="form-control rounded-pill shadow-sm" 
                    placeholder="Buscar por nombre, marca, ubicación o responsable..."
                    v-model="searchTerm"
                >
            </div>
            <div class="col-md-6 text-end">
                <button class="btn btn-secondary rounded-pill" @click="loadTools" :disabled="isLoading">
                    <i class="bi bi-arrow-clockwise"></i> Recargar
                </button>
            </div>
        </div>
        
        <div v-if="isLoading" class="alert alert-info text-center">
            <div class="spinner-border text-primary me-2" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando herramientas...
        </div>

        <div v-else-if="error" class="alert alert-danger">
            <strong>Error:</strong> {{ error }}
        </div>
        
        <!-- Muestra el mensaje si no hay herramientas O si la búsqueda no arroja resultados -->
        <div v-else-if="toolsWithNames.length === 0" class="alert alert-warning text-center">
            No hay herramientas registradas. <router-link to="/herramienta/crear" class="alert-link">¡Crea la primera ahora!</router-link>
        </div>
        <div v-else-if="toolsDisplay.length === 0" class="alert alert-info text-center">
             No se encontraron herramientas que coincidan con "{{ searchTerm }}".
        </div>


        <div v-else class="table-responsive shadow-sm">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Ubicación Actual</th>
                        <th>Responsable Actual</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tool in toolsDisplay" :key="tool.id">
                        <td><strong>{{ tool.nombre }}</strong></td>
                        <td>{{ tool.marca }}</td>
                        <td>
                            <span :class="{'badge bg-success': tool.ubicacionActual === 'Empresa', 'badge bg-warning text-dark': tool.ubicacionActual !== 'Empresa'}">
                                {{ tool.ubicacionActual }}
                            </span>
                        </td>
                        <td>{{ tool.responsableName ? tool.responsableName : 'N/A' }}</td>
                        <td class="text-center">
                            <!-- NUEVO BOTÓN DE EDICIÓN -->
                            <button 
                                class="btn btn-sm btn-primary me-2" 
                                @click="openEditModal(tool)"
                                title="Editar herramienta"
                            >
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                            
                            <button 
                                v-if="tool.ubicacionActual === 'Empresa'" 
                                class="btn btn-sm btn-info me-2" 
                                @click="openWithdrawalModal(tool)"
                                title="Retirar herramienta a una obra"
                            >
                                <i class="bi bi-box-arrow-up"></i> Retirar
                            </button>
                            <button 
                                v-else 
                                class="btn btn-sm btn-success me-2"
                                @click="openReturnModal(tool)"
                                title="Devolver herramienta a la empresa"
                            >
                                <i class="bi bi-box-arrow-down"></i> Devolver
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- MODAL DE EDICIÓN (NUEVO) -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-md">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">✏️ Editar: {{ editingToolData.nombre }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="showEditModal = false"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleEditSubmit">
                        
                        <div class="mb-3">
                            <label for="editNombre" class="form-label fw-bold">Nombre</label>
                            <input type="text" class="form-control" id="editNombre" v-model="editingToolData.nombre" required>
                        </div>

                        <div class="mb-3">
                            <label for="editMarca" class="form-label fw-bold">Marca</label>
                            <input type="text" class="form-control" id="editMarca" v-model="editingToolData.marca" required>
                        </div>

                        <div class="mb-3">
                            <label for="editSerial" class="form-label fw-bold">Número de Serie (Serial)</label>
                            <input type="text" class="form-control" id="editSerial" v-model="editingToolData.serial" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="isEditModalLoading">
                            <span v-if="isEditModalLoading" class="spinner-border spinner-border-sm me-2"></span>
                            Guardar Cambios
                        </button>
                        
                        <div v-if="editError" class="alert alert-danger mt-3">{{ editError }}</div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL DE RETIRO -->
    <div v-if="showWithdrawalModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-md">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">📦 Retirar: {{ selectedTool?.nombre }} ({{ selectedTool?.serial }})</h5>
                    <button type="button" class="btn-close btn-close-white" @click="showWithdrawalModal = false"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleWithdrawalSubmit">
                        
                        <div class="mb-3">
                            <label for="responsableId" class="form-label fw-bold">Responsable (Empleado)</label>
                            <select 
                                id="responsableId" 
                                class="form-select" 
                                v-model="withdrawalData.responsableId" 
                                required
                                :disabled="isModalLoading || simpleProfiles.length === 0"
                            >
                                <option value="" disabled>Seleccione un responsable</option>
                                <option 
                                    v-for="profile in simpleProfiles" 
                                    :key="profile.idUser" 
                                    :value="profile.idUser"
                                >
                                    {{ profile.fullName }}
                                </option>
                            </select>
                            <div v-if="simpleProfiles.length === 0 && !isLoadingProfiles" class="form-text text-danger">
                                No hay usuarios registrados. Cree uno en la sección 'Usuarios'.
                            </div>
                            <div v-else-if="isLoadingProfiles" class="form-text text-info">
                                Cargando lista de responsables...
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="ubicacion" class="form-label fw-bold">Ubicación de Destino (Obra)</label>
                            <input type="text" class="form-control" v-model="withdrawalData.ubicacion" placeholder="Ej: Obra Central Torre A" required>
                        </div>

                        <div class="mb-3">
                            <label for="fechaRetiro" class="form-label fw-bold">Fecha y Hora de Retiro</label>
                            <input type="datetime-local" class="form-control" v-model="withdrawalData.fechaRetiro" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="observaciones" class="form-label">Observaciones (Opcional)</label>
                            <textarea class="form-control" v-model="withdrawalData.observaciones"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="isModalLoading">
                            <span v-if="isModalLoading" class="spinner-border spinner-border-sm me-2"></span>
                            Confirmar Retiro
                        </button>
                        
                        <div v-if="withdrawalError" class="alert alert-danger mt-3">{{ withdrawalError }}</div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <!-- MODAL DE DEVOLUCIÓN -->
    <div v-if="showReturnModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">🏠 Devolver: {{ selectedTool?.nombre }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="showReturnModal = false"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info p-2 small">
                        La herramienta regresará a **Empresa** y el responsable se marcará como **N/A**.
                    </div>

                    <form @submit.prevent="handleReturnSubmit">
                        
                        <div class="mb-3">
                            <label for="fechaDevolucion" class="form-label fw-bold">Fecha y Hora de Devolución</label>
                            <input type="datetime-local" class="form-control" v-model="returnToolData.fechaDevolucion" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="observaciones" class="form-label">Observaciones (Estado al devolver)</label>
                            <textarea class="form-control" v-model="returnToolData.observaciones" placeholder="Ej: Devuelto en buen estado, o necesita mantenimiento."></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-success w-100 mt-3" :disabled="isReturnModalLoading">
                            <span v-if="isReturnModalLoading" class="spinner-border spinner-border-sm me-2"></span>
                            Confirmar Devolución
                        </button>
                        
                        <div v-if="returnError" class="alert alert-danger mt-3">{{ returnError }}</div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- NOTIFICACIÓN TOAST -->
    <div 
        v-if="showToast" 
        :class="['notification-toast', toastType === 'success' ? 'bg-success' : 'bg-danger']"
    >
        <div class="toast-body d-flex align-items-center text-white">
            <i :class="['bi me-2', toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill']"></i>
            {{ toastMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'; 
import { ListTools } from '../application/useCases/Tools/ListTools';
import { RegisterWithdrawal } from '../application/useCases/Movements/RegisterWithdrawal';
import { RegisterReturn } from '../application/useCases/Movements/RegisterReturn';
import { SupabaseToolService } from '../api/tools';
import { SupabaseMovementService } from '../api/movement';
import type { Tool } from '../domain/entities/Tool';
import { SupabaseUserService, type SimpleProfile } from '../api/UserService'; 


// ------------------------------------
// LÓGICA DE NOTIFICACIÓN TOAST
// ------------------------------------
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'danger'>('success'); // Tipo de notificación: éxito o peligro

const showNotification = (message: string, type: 'success' | 'danger') => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
        showToast.value = false;
    }, 4000);
};


// ------------------------------------
// LÓGICA DE HERRAMIENTAS Y PANTALLA
// ------------------------------------
interface ToolDisplay extends Tool {
    responsableName: string | null;
}

const tools = ref<Tool[]>([]); 
const currentPage = ref(0);
const isLoading = ref(false);
const error = ref<string | null>(null);
const selectedTool = ref<Tool | null>(null);

const listToolsUseCase = new ListTools(new SupabaseToolService());


// NUEVO: Estado para el término de búsqueda
const searchTerm = ref('');


// COMPUTED PROPERTY 1: Mapea las herramientas con el nombre del responsable
// Esto resuelve el nombre del responsable una sola vez después de cargar
const toolsWithNames = computed<ToolDisplay[]>(() => {
    return tools.value.map(tool => {
        let responsableName: string | null = null;
        if (tool.responsableActual) {
            const profile = simpleProfiles.value.find(p => p.idUser === tool.responsableActual);
            responsableName = profile ? profile.fullName : tool.responsableActual; 
        }

        return {
            ...tool,
            responsableName: responsableName,
        };
    });
});


// COMPUTED PROPERTY 2: Filtra la lista (la que se usa en el template)
const toolsDisplay = computed<ToolDisplay[]>(() => {
    const toolsList = toolsWithNames.value;

    if (!searchTerm.value) {
        return toolsList; // Muestra toda la lista con nombres resueltos
    }
    
    const term = searchTerm.value.toLowerCase().trim();
    
    // Filtra por nombre, marca, ubicación o responsable
    return toolsList.filter(tool => {
        const name = tool.nombre?.toLowerCase() || '';
        const brand = tool.marca?.toLowerCase() || '';
        const location = tool.ubicacionActual?.toLowerCase() || '';
        const responsible = tool.responsableName?.toLowerCase() || '';

        return name.includes(term) || 
               brand.includes(term) || 
               location.includes(term) || 
               responsible.includes(term);
    });
});


const loadTools = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        // En un entorno real, la búsqueda inactiva se habilitaría aquí, 
        // añadiendo el criterio de filtro al objeto vacío {}
        const result = await listToolsUseCase.execute(currentPage.value, {}); 
        tools.value = result.tools;
    } catch (e: any) {
        error.value = 'Error al cargar el inventario. Verifique permisos de SELECT: ' + e.message;
    } finally {
        isLoading.value = false;
    }
};


// ------------------------------------
// LÓGICA DE USUARIOS (DDL y Mapeo de Nombres)
// ------------------------------------
const userService = new SupabaseUserService();
const simpleProfiles = ref<SimpleProfile[]>([]);
const isLoadingProfiles = ref(false);

const loadProfilesForDDL = async () => {
    isLoadingProfiles.value = true;
    try {
        const profiles = await userService.listSimpleProfiles();
        simpleProfiles.value = profiles;
        // Solo recarga herramientas si los perfiles se cargan correctamente
        await loadTools();
    } catch (e: any) {
        console.error('Error al cargar la lista de responsables para DDL:', e.message);
    } finally {
        isLoadingProfiles.value = false;
    }
};


// ------------------------------------
// LÓGICA DEL MODAL DE EDICIÓN
// ------------------------------------
const showEditModal = ref(false);
// Utilizamos ToolDisplay para tener el ID, nombre, marca y serial
const editingToolData = ref<ToolDisplay>({} as ToolDisplay); 
const isEditModalLoading = ref(false);
const editError = ref<string | null>(null);

const openEditModal = (tool: ToolDisplay) => {
    // Clona el objeto para evitar modificar la lista directamente mientras se edita
    editingToolData.value = JSON.parse(JSON.stringify(tool));
    showEditModal.value = true;
};

const handleEditSubmit = async () => {
    isEditModalLoading.value = true;
    editError.value = null;

    if (!editingToolData.value.nombre || !editingToolData.value.marca || !editingToolData.value.serial) {
        editError.value = "Los campos Nombre, Marca y Serial son obligatorios.";
        isEditModalLoading.value = false;
        showNotification("Por favor, complete todos los campos obligatorios.", 'danger');
        return;
    }

    try {
        // Asumiendo que SupabaseToolService tiene un método 'updateToolDetails(id, data)'
        const toolService = new SupabaseToolService();
        
        const updatedData = {
            nombre: editingToolData.value.nombre,
            marca: editingToolData.value.marca,
            serial: editingToolData.value.serial,
            // Aquí se podrían añadir otros campos editables
        };
        
        await toolService.updateToolDetails(editingToolData.value.id, updatedData);
        
        showNotification(`Herramienta ${editingToolData.value.nombre} actualizada con éxito.`, 'success');
        showEditModal.value = false;
        
        // Recargar los datos para ver la herramienta actualizada en la lista
        await loadTools(); 
    } catch (e: any) {
        editError.value = `Fallo en la actualización de la herramienta: ${e.message}.`;
        showNotification(`Error al actualizar ${editingToolData.value.nombre}.`, 'danger');
    } finally {
        isEditModalLoading.value = false;
    }
};


// ------------------------------------
// LÓGICA DEL MODAL DE RETIRO
// ------------------------------------
const showWithdrawalModal = ref(false);
const withdrawalData = ref({
    herramientaId: '',
    responsableId: '' as string, 
    ubicacion: '',
    // Inicializa con fecha y hora actual en formato local
    fechaRetiro: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
    observaciones: '' as string | null,
});
const isModalLoading = ref(false);
const withdrawalError = ref<string | null>(null);

const registerWithdrawalUseCase = new RegisterWithdrawal(new SupabaseMovementService());

const openWithdrawalModal = (tool: Tool) => {
    selectedTool.value = tool;
    withdrawalData.value.herramientaId = tool.id;
    withdrawalData.value.responsableId = ''; 
    withdrawalData.value.ubicacion = ''; 
    withdrawalData.value.observaciones = null;
    // Asegura que el campo datetime-local se inicialice correctamente
    withdrawalData.value.fechaRetiro = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    showWithdrawalModal.value = true;
};

const handleWithdrawalSubmit = async () => {
    isModalLoading.value = true;
    withdrawalError.value = null;

    if (!withdrawalData.value.responsableId || !withdrawalData.value.ubicacion) {
        withdrawalError.value = "Los campos Responsable y Ubicación son obligatorios.";
        isModalLoading.value = false;
        showNotification("Por favor, complete todos los campos obligatorios.", 'danger');
        return;
    }

    try {
        await registerWithdrawalUseCase.execute({ ...withdrawalData.value });

        showNotification(`Retiro de ${selectedTool.value?.nombre} registrado con éxito.`, 'success');
        showWithdrawalModal.value = false;
        
        await loadTools(); // Recarga los datos
    } catch (e: any) {
        withdrawalError.value = `Fallo en el registro de retiro: ${e.message}.`;
        showNotification(`Error al retirar ${selectedTool.value?.nombre}.`, 'danger');
    } finally {
        isModalLoading.value = false;
    }
};


// ------------------------------------
// LÓGICA DEL MODAL DE DEVOLUCIÓN
// ------------------------------------
const showReturnModal = ref(false);
const returnToolData = ref({
    herramientaId: '',
    // Inicializa con fecha y hora actual en formato local
    fechaDevolucion: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
    observaciones: '' as string | null,
});
const isReturnModalLoading = ref(false);
const returnError = ref<string | null>(null);

const registerReturnUseCase = new RegisterReturn(new SupabaseMovementService());

const openReturnModal = (tool: Tool) => {
    selectedTool.value = tool;
    returnToolData.value.herramientaId = tool.id;
    returnToolData.value.observaciones = null;
    // Asegura que el campo datetime-local se inicialice correctamente
    returnToolData.value.fechaDevolucion = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    showReturnModal.value = true;
};

const handleReturnSubmit = async () => {
    isReturnModalLoading.value = true;
    returnError.value = null;

    try {
        await registerReturnUseCase.execute({ ...returnToolData.value });

        showNotification(`Devolución de ${selectedTool.value?.nombre} registrada con éxito.`, 'success');
        showReturnModal.value = false;
        
        await loadTools(); // Recarga los datos para actualizar la ubicación a 'Empresa'
    } catch (e: any) {
        returnError.value = `Fallo en el registro de devolución: ${e.message}.`;
        showNotification(`Error al devolver ${selectedTool.value?.nombre}.`, 'danger');
    } finally {
        isReturnModalLoading.value = false;
    }
};


// Ejecutar la carga de datos y perfiles al montar el componente
onMounted(() => {
    loadProfilesForDDL();
});
</script>

<style scoped>
/* Estilos necesarios para mostrar los modales (si no usas el JS de Bootstrap) */
.modal-title {
    font-weight: 600;
}

/* Estilos para el Toast de Notificación */
.notification-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 250px;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 1050; /* Mayor que el modal backdrop */
    transition: opacity 0.3s ease-in-out;
}

.bg-success {
    background-color: #198754 !important; /* Bootstrap success green */
}

.bg-danger {
    background-color: #dc3545 !important; /* Bootstrap danger red */
}
</style>