<template>
    <div class="container-fluid mt-4">
        <h2 class="mb-4 text-primary">Gestión de Usuarios <i class="bi bi-people"></i></h2>

        <div class="row">
            <!-- Columna de Formulario de Registro -->
            <div class="col-lg-5 mb-4">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">Registrar Nuevo Usuario</h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="handleRegistration">
                            
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="form.email" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña Temporal</label>
                                <input type="password" class="form-control" v-model="form.password" minlength="6" required>
                                <div class="form-text">Mínimo 6 caracteres. El usuario deberá cambiarla después.</div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="nombre" class="form-label">Nombre</label>
                                    <input type="text" class="form-control" v-model="form.nombre" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="apellido" class="form-label">Apellido</label>
                                    <input type="text" class="form-control" v-model="form.apellido" required>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="rol" class="form-label">Rol</label>
                                <select class="form-select" v-model="form.rol" required>
                                    <option value="User">User (Empleado)</option>
                                    <option value="Admin">Admin (Administrador)</option>
                                </select>
                            </div>

                            <button type="submit" class="btn btn-success w-100 mt-2" :disabled="isSubmitting">
                                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                                Registrar Usuario
                            </button>
                            
                            <div v-if="registrationSuccess" class="alert alert-success mt-3 p-2">{{ registrationSuccess }}</div>
                            <div v-if="registrationError" class="alert alert-danger mt-3 p-2">{{ registrationError }}</div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Columna de Tabla de Usuarios -->
            <div class="col-lg-7">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">Usuarios Registrados ({{ profiles.length }})</h5>
                    </div>
                    <div class="card-body p-0">
                        <div v-if="isLoadingProfiles" class="text-center p-4">
                            <div class="spinner-border text-info" role="status"></div>
                            <p class="mt-2">Cargando perfiles...</p>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-striped table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Rol</th>
                                        <th>ID (UUID)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="profile in profiles" :key="profile.idUser">
                                        <td>{{ profile.nombre }} {{ profile.apellido }}</td>
                                        <td>
                                            <span :class="{'badge bg-danger': profile.rol === 'Admin', 'badge bg-primary': profile.rol === 'User'}">
                                                {{ profile.rol }}
                                            </span>
                                        </td>
                                        <td class="small">{{ profile.idUser }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="profileError" class="alert alert-danger mt-0 rounded-0">{{ profileError }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SupabaseUserService, type UserProfile } from '../api/UserService';
import { RegisterUser } from '../application/useCases/Users/RegisterUser';

// Servicios y Casos de Uso
const userService = new SupabaseUserService();
const registerUserUseCase = new RegisterUser(userService);

// Estado del Formulario de Registro
const form = ref({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'User' as 'Admin' | 'User',
});
const isSubmitting = ref(false);
const registrationError = ref<string | null>(null);
const registrationSuccess = ref<string | null>(null);

// Estado de la Tabla de Perfiles
const profiles = ref<UserProfile[]>([]);
const isLoadingProfiles = ref(false);
const profileError = ref<string | null>(null);

/**
 * Maneja el envío del formulario de registro.
 */
const handleRegistration = async () => {
    isSubmitting.value = true;
    registrationError.value = null;
    registrationSuccess.value = null;

    try {
        await registerUserUseCase.execute(form.value);
        
        registrationSuccess.value = `Usuario ${form.value.nombre} registrado con éxito. Su cuenta está activa.`;
        
        // Limpiar formulario y recargar lista
        form.value = {
            email: '',
            password: '',
            nombre: '',
            apellido: '',
            rol: 'User',
        };
        await loadProfiles();

    } catch (e: any) {
        // Manejar errores de Supabase o de validación de Caso de Uso
        registrationError.value = e.message;
    } finally {
        isSubmitting.value = false;
    }
};

/**
 * Carga la lista de perfiles de usuario.
 */
const loadProfiles = async () => {
    isLoadingProfiles.value = true;
    profileError.value = null;
    try {
        profiles.value = await userService.listAllProfiles();
    } catch (e: any) {
        profileError.value = `Error al cargar la lista de usuarios: ${e.message}. Asegúrese de tener RLS con política SELECT adecuada para 'Admin'.`;
    } finally {
        isLoadingProfiles.value = false;
    }
};

// Cargar perfiles al montar el componente
onMounted(loadProfiles);
</script>