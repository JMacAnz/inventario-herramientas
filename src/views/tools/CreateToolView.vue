<template>
    <div class="container mt-4">
        <h2>Registrar Nueva Herramienta 🔨</h2>
        <router-link to="/inventario" class="btn btn-secondary btn-sm mb-3">
            ← Volver al Inventario
        </router-link>

        <form @submit.prevent="handleSubmit" class="card p-4 shadow-sm">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" v-model="toolData.nombre" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="marca" class="form-label">Marca</label>
                    <input type="text" class="form-control" id="marca" v-model="toolData.marca" required>
                </div>
                
                <div class="col-md-6 mb-3">
                    <label for="serial" class="form-label">Serial (Único)</label>
                    <input type="text" class="form-control" id="serial" v-model="toolData.serial" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="tipo" class="form-label">Tipo</label>
                    <select class="form-select" id="tipo" v-model="toolData.tipo" required>
                        <option disabled value="">Seleccione un tipo</option>
                        <option v-for="t in toolTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-primary mt-3" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isLoading ? 'Registrando...' : 'Registrar Herramienta' }}
            </button>
            
            <div v-if="successMsg" class="alert alert-success mt-3">{{ successMsg }}</div>
            <div v-if="errorMsg" class="alert alert-danger mt-3">Error: {{ errorMsg }}</div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { RegisterTool } from '../../application/useCases/Tools/RegisterTool';
import { SupabaseToolService } from '../../api/tools';
import type { ToolType } from '../../domain/entities/Tool';

const router = useRouter();

// Valores predefinidos para el select
const toolTypes: ToolType[] = ['Eléctrica', 'Manual', 'Mecánica', 'Especial', 'Equipo de Altura'];

// Estado del formulario
const toolData = ref({
    nombre: '',
    marca: '',
    serial: '',
    tipo: '' as ToolType | '',
});

// Estados de Manejo de Errores y Loading (Punto pendiente cubierto)
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);

const registerToolUseCase = new RegisterTool(new SupabaseToolService());

const handleSubmit = async () => {
    isLoading.value = true;
    errorMsg.value = null;
    successMsg.value = null;

    try {
        await registerToolUseCase.execute({
            nombre: toolData.value.nombre,
            marca: toolData.value.marca,
            serial: toolData.value.serial,
            tipo: toolData.value.tipo as ToolType,
        });

        successMsg.value = `Herramienta "${toolData.value.nombre}" registrada con éxito!`;
        
        // Limpiar formulario y opcionalmente redirigir
        toolData.value = { nombre: '', marca: '', serial: '', tipo: '' };
        setTimeout(() => router.push('/inventario'), 2000); 

    } catch (e: any) {
        // Manejo de Errores: Supabase típicamente devuelve un error si el serial es duplicado
        errorMsg.value = e.message;
    } finally {
        isLoading.value = false;
    }
};
</script>