import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../lib/supabaseClient"; // Importa el cliente de Supabase
import {
  LoginView,
  InventoryView,
  CreateToolView,
  ToolDetailView,
  PendingMovementsView,
  UserRegistrationView,
} from "../views"; // Ya no es necesario el '/index.ts'

// Definición de tipos para la meta de la ruta
declare module "vue-router" {
  interface RouteMeta {
    /** true si la ruta es accesible sin iniciar sesión */
    public?: boolean;
    /** true si la ruta requiere que el usuario esté autenticado */
    requiresAuth?: boolean;
    /** Array de roles permitidos (ej: ['admin', 'empleado']) */
    roles?: string[];
  }
}

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { public: true },
  },
  {
    path: "/inventario",
    name: "Inventario",
    component: InventoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/herramienta/crear",
    name: "CrearHerramienta",
    component: CreateToolView,
    // Solo accesible por administradores
    meta: { requiresAuth: true, roles: ["Admin"] },
  },
  {
    path: "/herramienta/:id",
    name: "DetalleHerramienta",
    component: ToolDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/movimientos-pendientes",
    name: "MovimientosPendientes",
    component: PendingMovementsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: UserRegistrationView,
    // Aquí puedes añadir meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Redirección por defecto
  { path: "/", redirect: "/inventario" },
  { path: "/:catchAll(.*)", redirect: "/inventario" },
];

// 1. Inicialización del Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 2. Navigation Guard (Protección de Rutas)
router.beforeEach(async (to, from, next) => {
  // 1. Verificar sesión de autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // Si la ruta es pública, permite el acceso inmediatamente
  if (to.meta.public) {
    // Si el usuario ya está logueado y va a /login, redirigirlo a /inventario
    if (isAuthenticated && to.name === "Login") {
      next("/inventario");
    } else {
      next();
    }
    return;
  }

  // 2. Protección de Autenticación
  // Si requiere autenticación y no está logueado, redirige a login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // 3. Protección por Rol (si está autenticado y la ruta tiene roles definidos)
  if (to.meta.roles && isAuthenticated) {
    // ... (Lógica para obtener userRole, omitida para brevedad)

    let userRole: string = "empleado"; // Rol por defecto

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("rol")
        .eq("idUser", session?.user.id)
        .single();
      if (profile) {
        userRole = profile.rol;
      } else if (error) {
        console.error("Error al obtener rol del perfil:", error.message);
      }
    } catch (e) {
      console.error("Error al acceder a Supabase para obtener el rol:", e);
    } // LÍNEA CORREGIDA: Asigna el valor y usa la aserción de tipos

    const requiredRoles = to.meta.roles as string[];
    if (!requiredRoles.includes(userRole)) {
      // No tiene el rol necesario
      alert("Acceso denegado: No tienes permisos para esta vista.");
      next("/inventario");
      return;
    }
  } // Todo correcto, permite el acceso

  next();
});

export default router;
