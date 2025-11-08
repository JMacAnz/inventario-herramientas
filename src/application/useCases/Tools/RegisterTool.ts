// src/application/useCases/Tools/RegisterTool.ts
import { SupabaseToolService } from "../../../api/tools";
import type { Tool, ToolType } from "../../../domain/entities/Tool";

// Define el tipo de datos mínimos necesarios para el registro
type ToolRegistrationData = {
  nombre: string;
  marca: string;
  serial: string;
  tipo: ToolType;
};

export class RegisterTool {
  private toolService: SupabaseToolService;

  /**
   * Inicializa el caso de uso inyectando la dependencia del servicio de infraestructura.
   * @param toolService El servicio que interactúa con la base de datos (SupabaseToolService).
   */
  constructor(toolService: SupabaseToolService) {
    this.toolService = toolService;
  }

  /**
   * Ejecuta la lógica para registrar una nueva herramienta.
   * @param data Los datos de la nueva herramienta.
   * @returns La entidad Tool creada.
   */
  async execute(data: ToolRegistrationData): Promise<Tool> {
    // --- Lógica de Negocio Pura (Validación) ---

    // 1. Verificar campos obligatorios
    if (!data.nombre || !data.serial || !data.marca || !data.tipo) {
      throw new Error(
        "Todos los campos (nombre, marca, serial, tipo) son obligatorios."
      );
    }

    // 2. Validar que el tipo sea válido (aunque TypeScript lo garantiza)
    const validTypes: ToolType[] = [
      "Eléctrica",
      "Manual",
      "Mecánica",
      "Especial",
      "Equipo de Altura",
    ];
    if (!validTypes.includes(data.tipo)) {
      throw new Error("El tipo de herramienta proporcionado no es válido.");
    }

    // --- Llamada a la Infraestructura ---

    // La lógica de verificar si el serial ya existe se delega a la base de datos
    // (usando la restricción UNIQUE en la tabla 'Herramientas' y manejo de error en el servicio).

    // Llama al servicio de infraestructura para crear el registro en la DB
    const newTool = await this.toolService.createTool(data);

    return newTool;
  }
}
