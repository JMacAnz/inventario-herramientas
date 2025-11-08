// src/application/useCases/Tools/UpdateTool.ts
import { SupabaseToolService } from "../../../api/tools";
import type { Tool, ToolStatus, ToolType } from "../../../domain/entities/Tool";

type ToolUpdateData = {
  id: string;
  nombre?: string;
  marca?: string;
  tipo?: ToolType;
  estado?: ToolStatus;
};

interface UpdateToolParams {
  toolId: string;
  data: ToolUpdateData;
}

export class UpdateToolv1 {
  private toolService: SupabaseToolService;

  constructor(toolService: SupabaseToolService) {
    this.toolService = toolService;
  }

  async execute(data: ToolUpdateData): Promise<Tool> {
    if (!data.id) {
      throw new Error(
        "El ID de la herramienta es obligatorio para actualizar."
      );
    }

    // Separa el ID de los campos a actualizar
    const { id, ...updates } = data;

    // Aquí podrías añadir lógica de validación de negocio adicional si fuera necesario.

    const updatedTool = await this.toolService.updateTool(id, updates);
    return updatedTool as Tool;
  }
}

export class UpdateTool {
  private toolService: SupabaseToolService;

  constructor(toolService: SupabaseToolService) {
    this.toolService = toolService;
  }

  async execute(params: UpdateToolParams): Promise<void> {
    await this.toolService.updateToolDetails(params.toolId, params.data);
  }
}

// Caso de Uso para Eliminar (Soft Delete)
export class InactivateTool {
  private toolService: SupabaseToolService;

  constructor(toolService: SupabaseToolService) {
    this.toolService = toolService;
  }

  async execute(toolId: string): Promise<Tool> {
    const inactivatedTool = await this.toolService.softDeleteTool(toolId);
    return inactivatedTool as Tool;
  }
}
