import { SupabaseMovementService } from "../../../api/movement";

/**
 * Use Case: Listar todos los movimientos (historial completo)
 * 
 * Responsabilidad:
 * - Obtener todos los registros de movimientos de todas las herramientas
 * - Retornar el historial ordenado por fecha (más recientes primero)
 */
export class ListAllMovements {
  movementService: SupabaseMovementService;

  constructor(movementService: SupabaseMovementService) {
    this.movementService = movementService;
  }

  async execute(): Promise<any[]> {
    try {
      // Usar el método público del servicio para obtener todos los movimientos
      const data = await this.movementService.getAllMovements();

      // El service ya lanza si hay error, así que simplemente devolvemos los datos

      return data || [];
    } catch (error) {
      console.error("Error en ListAllMovements:", error);
      throw error;
    }
  }
}
