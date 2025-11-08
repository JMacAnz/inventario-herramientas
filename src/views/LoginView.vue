<template>
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="card p-4 shadow-lg" style="width: 100%; max-width: 400px;">
            <h2 class="card-title text-center mb-4">Acceso al Sistema 🔐</h2>
            
            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" v-model="loginData.email" required>
                </div>
                
                <div class="mb-3">
                    <label for="password" class="form-label">Contraseña</label>
                    <input type="password" class="form-control" id="password" v-model="loginData.password" required>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
                </button>
                
                <div v-if="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LoginUser } from '../application/useCases/Auth/LoginUser';
import { SupabaseAuthService } from '../api/auth';

const router = useRouter();

const loginData = ref({
    email: '',
    password: '',
});

const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const loginUserUseCase = new LoginUser(new SupabaseAuthService());

const handleLogin = async () => {
    isLoading.value = true;
    errorMsg.value = null;

    try {
        const { user, rol } = await loginUserUseCase.execute(
            loginData.value.email,
            loginData.value.password
        );

        // NOTA: El rol ahora está disponible. Se podría almacenar en un store (Pinia/Vuex) 
        // para un acceso global más rápido, pero el App.vue y router.ts ya lo manejan.

        console.log(`Usuario ${user.id} logueado con rol: ${rol}`);
        
        // Redirigir al inventario después de un login exitoso
        router.push('/inventario');

    } catch (e: any) {
        // Manejo de errores de autenticación de Supabase (ej: 'Invalid login credentials')
        errorMsg.value = e.message;
    } finally {
        isLoading.value = false;
    }
};
</script>