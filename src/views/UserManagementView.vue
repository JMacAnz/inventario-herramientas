<template>
    <div class="container mt-4">
        <h2>Gestión de Usuarios y Roles 🧑‍💻</h2>
        <p class="text-danger">Advertencia: Esta vista usa funciones de administración de usuarios y solo debe ser accesible por el rol 'admin'.</p>

        <div class="card p-4 shadow-sm">
            <h4 class="mb-3">Registrar Nuevo Empleado</h4>
            
            <form @submit.prevent="handleRegister">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="userData.email" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label">Contraseña Temporal</label>
                        <input type="password" class="form-control" v-model="userData.password" required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" v-model="userData.nombre" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="apellido" class="form-label">Apellido</label>
                        <input type="text" class="form-control" v-model="userData.apellido" required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label for="rol" class="form-label">Rol</label>
                        <select class="form-select" v-model="userData.rol" required>
                            <option value="empleado">Empleado</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn btn-success mt-3" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Crear Usuario
                </button>
                <div v-if="successMsg" class="alert alert-success mt-3">{{ successMsg }}</div>
                <div v-if="errorMsg" class="alert alert-danger mt-3">Error: {{ errorMsg }}</div>
            </form>
        </div>
        
        </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../../lib/supabaseClient'; // Usamos el cliente estándar

const userData = ref({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'empleado',
});

const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);

const handleRegister = async () => {
    isLoading.value = true;
    errorMsg.value = null;
    successMsg.value = null;

    try {
        // 1. Crear el usuario en auth.users
        const { data: userAuthData, error: authError } = await supabase.auth.signUp({
            email: userData.value.email,
            password: userData.value.password,
            options: {
                // Se puede añadir metadata, pero no el rol
                data: {
                    nombre: userData.value.nombre,
                    apellido: userData.value.apellido
                }
            }
        });

        if (authError) throw new Error(authError.message);

        const userId = userAuthData.user?.id;
        if (!userId) throw new Error("ID de usuario no generado.");

        // 2. Insertar el rol y nombre/apellido en la tabla 'profiles'
        const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            nombre: userData.value.nombre,
            apellido: userData.value.apellido,
            rol: userData.value.rol,
        });

        if (profileError) {
             // IMPORTANTE: Si falla el perfil, se debe borrar el usuario creado en auth.users
             // Supabase no hace esto automáticamente, es lógica de compensación avanzada.
             console.error("Fallo al crear perfil, usuario creado pero sin rol:", profileError.message);
             throw new Error("Usuario creado, pero falló la asignación de rol.");
        }

        successMsg.value = `Usuario ${userData.value.nombre} creado y rol '${userData.value.rol}' asignado.`;
        // Limpiar
        userData.value = { email: '', password: '', nombre: '', apellido: '', rol: 'empleado' };

    } catch (e: any) {
        errorMsg.value = e.message;
    } finally {
        isLoading.value = false;
    }
};
</script>