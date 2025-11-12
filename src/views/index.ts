// src/views/index.ts

// Vistas principales
import LoginView from "./LoginView.vue";
import InventoryView from "./InventoryView.vue";

// Vistas de Herramientas
import CreateToolView from "./tools/CreateToolView.vue";
import ToolDetailView from "./tools/ToolDetailView.vue";

// Vistas de Movimientos
import PendingMovementsView from "./movements/PendingMovementsView.vue";
import ToolMovementsHistoryView from "./movements/ToolMovementsHistoryView.vue";
import UserRegistrationView from "./UserRegistrationView.vue";

// Exportar todas las vistas para facilitar su importación
export {
  LoginView,
  InventoryView,
  CreateToolView,
  ToolDetailView,
  PendingMovementsView,
  ToolMovementsHistoryView,
  UserRegistrationView,
};
