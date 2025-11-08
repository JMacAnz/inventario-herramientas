// src/application/useCases/Tools/ListTools.ts
import { SupabaseToolService } from "../../../api/tools";
import type { Tool, ToolType, ToolStatus } from "../../../domain/entities/Tool";

interface ToolFilter {
  tipo?: ToolType;
  estado?: ToolStatus;
  ubicacionActual?: string;
  search?: string;
}

export class ListTools {
  private toolService: SupabaseToolService;

  constructor(toolService: SupabaseToolService) {
    this.toolService = toolService;
  }

  async execute(
    page: number = 0,
    filters: ToolFilter = {},
    sortBy: "nombre" | "serial" = "nombre",
    ascending: boolean = true
  ): Promise<{ tools: Tool[]; total: number }> {
    // La lógica de negocio aquí sería principalmente validación de parámetros,
    // pero delegamos la complejidad de filtros a la capa de infraestructura.

    const { data, totalCount } = await this.toolService.getTools(
      page,
      filters,
      sortBy,
      ascending
    );

    return { tools: data as Tool[], total: totalCount ?? 0 };
  }
}
