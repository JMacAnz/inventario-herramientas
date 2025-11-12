<template>
    <div id="app">
        <div v-if="isAuthLoading" class="loading-overlay d-flex justify-content-center align-items-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>

        <nav v-if="isAuthenticated && !isAuthLoading" class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div class="container-fluid">
                <router-link class="navbar-brand d-flex align-items-center" to="/inventario">
                    <i class="bi bi-gear-wide-connected me-2 text-info"></i> Inventario Tools
                </router-link>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" to="/inventario">
                                <i class="bi bi-box-seam me-1"></i> Inventario
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" to="/historial-movimientos">
                                <i class="bi bi-clock-history me-1"></i> Historial de Movimientos
                            </router-link>
                        </li>
                        <!-- <li class="nav-item">
                            <router-link class="nav-link" active-class="active" to="/movimientos-pendientes">
                                <i class="bi bi-clock-history me-1"></i> Pendientes
                            </router-link>
                        </li> -->
                        <li v-if="isAdmin" class="nav-item">
                            <router-link class="nav-link" active-class="active" to="/herramienta/crear">
                                <i class="bi bi-plus-square me-1"></i> Crear Herramienta
                            </router-link>
                        </li>
                        <li v-if="isAdmin" class="nav-item">
                            <router-link class="nav-link" active-class="active" to="/usuarios">
                                <i class="bi bi-people me-1"></i> Usuarios
                            </router-link>
                        </li>
                    </ul>
                    
                    <div class="d-flex align-items-center">
                        <span v-if="userRole" class="navbar-text me-3 text-info">
                            Rol: <strong>{{ userRole }}</strong>
                        </span>
                        <button @click="handleLogout" class="btn btn-outline-danger btn-sm">
                            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="py-4 flex-grow-1">
            <div class="container-fluid">
                <router-view />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './lib/supabaseClient'; 

const router = useRouter();
const isAuthenticated = ref(false);
const userRole = ref<string | null>(null);
const isAuthLoading = ref(true); // Nuevo estado de carga

const isAdmin = computed(() => userRole.value === 'Admin');

const checkAuthStatus = async () => {
    isAuthLoading.value = true;
    
    const { data: { session } } = await supabase.auth.getSession();
    isAuthenticated.value = !!session;

    if (session) {
        try {
            // Optimización: Si ya tenemos el rol, no lo consultamos de nuevo a menos que sea necesario.
            if (!userRole.value) { 
                      const { data: profile, error } = await supabase
                          .from('profiles')
                          .select('rol')
                          .eq('idUser', session.user.id)
                          .maybeSingle();
                
                if (profile && !error) {
                    userRole.value = profile.rol;
                } else {
                    console.error("Error al obtener el rol del usuario:", error);
                    userRole.value = null;
                }
            }
        } catch (e) {
            console.error("No se pudo obtener el rol del usuario (excepción):", e);
            userRole.value = null;
        }
    } else {
        userRole.value = null;
    }
    
    isAuthLoading.value = false;
};

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        isAuthenticated.value = false;
        userRole.value = null;
        router.push('/login');
    }
};

onMounted(() => {
    // 1. Verificar el estado al cargar
    checkAuthStatus(); 

    // 2. Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
        isAuthenticated.value = !!session;
        
        // Llamar a checkAuthStatus en caso de cambio (SIGNED_IN/SIGNED_OUT)
        // Esto maneja la lógica de rol y navegación
        checkAuthStatus(); 

        if (event === 'SIGNED_OUT') {
            router.push('/login');
        } else if (event === 'SIGNED_IN') {
            // Redirigir si está en la página de login después de iniciar sesión
            if (router.currentRoute.value.path === '/login') {
                 router.push('/inventario');
            }
        }
    });
});
</script>

<style scoped>
/* Estilos básicos para el layout */
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
main {
    flex-grow: 1;
}

/* Estilo para el estado de carga (opcional, centra el spinner) */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 1050; /* Por encima de la navbar */
}

/* Asegurar que los router-links inactivos mantengan el color blanco de la navbar-dark */
.nav-link {
    color: rgba(255, 255, 255, 0.8);
}

/* Estilo para los router-links activos */
.nav-link.active {
    font-weight: bold;
    color: var(--bs-info) !important; /* Resalta el enlace activo */
}
</style>