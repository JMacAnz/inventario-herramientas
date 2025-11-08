import { supabase } from "../lib/supabaseClient";
import type { Tool, ToolStatus, ToolType } from "../domain/entities/Tool";

// Definiciones de tipos para los parámetros de búsqueda
interface ToolFilter {
  tipo?: ToolType;
  estado?: ToolStatus;
  ubicacionActual?: string;
  search?: string; // Búsqueda por nombre o serial
}
export interface ToolUpdateData {
  nombre?: string;
  marca?: string;
  serial?: string;
  // Campos actualizables basados en la entidad Tool:
  tipo?: ToolType;
  estado?: ToolStatus;
  // Si la descripción existe en la entidad Tool, se debe incluir aquí:
  descripcion?: string | null; // Asumimos que la descripción es un campo extra que puede ser nulo
}

const PAGE_SIZE = 10; // Tamaño de página estándar para la paginación

export class SupabaseToolService {
  private readonly TOOLS_TABLE = "Herramientas";

  // =================================================================
  // C: CREATE (Crear una nueva herramienta)
  // =================================================================
  async createTool(
    toolData: Omit<
      Tool,
      | "id"
      | "fechaCreacion"
      | "ubicacionActual"
      | "responsableActual"
      | "estado"
    >
  ) {
    // Definimos los valores por defecto que no se pasan en toolData
    const newToolData = {
      ...toolData,
      ubicacionActual: "Empresa",
      responsableActual: null,
      estado: "Activo", // Estado por defecto
    };

    const { data, error } = await supabase
      .from("Herramientas")
      .insert([newToolData])
      .select()
      .single();

    if (error)
      throw new Error(`Error al crear la herramienta: ${error.message}`);
    return data as Tool;
  }

  // =================================================================
  // R: READ (Listar con filtros y paginación)
  // =================================================================
  async getTools(
    page: number = 0, // Índice de la página (0, 1, 2...)
    filters: ToolFilter = {},
    sortBy: "nombre" | "serial" | "fechaCreacion" = "nombre",
    ascending: boolean = true
  ) {
    let query = supabase.from("Herramientas").select("*", { count: "exact" }); // Usar count: 'exact' para obtener el total

    // --- Aplicar Filtros ---
    if (filters.tipo) {
      query = query.eq("tipo", filters.tipo);
    }
    if (filters.estado) {
      query = query.eq("estado", filters.estado);
    }
    if (filters.ubicacionActual) {
      query = query.eq("ubicacionActual", filters.ubicacionActual);
    }

    // --- Búsqueda de Texto (nombre o serial) ---
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(
        `nombre.ilike.${searchPattern},serial.ilike.${searchPattern}`
      );
    }

    // --- Ordenamiento y Paginación ---
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    query = query.order(sortBy, { ascending }).range(from, to);

    const { data, error, count } = await query;

    if (error)
      throw new Error(`Error al obtener herramientas: ${error.message}`);

    return { data: data as Tool[], totalCount: count ?? 0 };
  }

  // =================================================================
  // U: UPDATE (Actualizar información básica)
  // =================================================================
  async updateTool(
    id: string,
    updates: Partial<
      Omit<
        Tool,
        "id" | "fechaCreacion" | "ubicacionActual" | "responsableActual"
      >
    >
  ) {
    // Filtramos para asegurar que solo se envían valores definidos
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const { data, error } = await supabase
      .from("Herramientas")
      .update(cleanedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(
        `Error al actualizar herramienta ${id}: ${error.message}`
      );
    return data as Tool;
  }

  // =================================================================
  // D: DELETE (Soft Delete - Cambiar estado a Inactivo)
  // =================================================================
  async softDeleteTool(id: string) {
    // Soft delete: cambiar el estado a 'Inactivo'
    const { data, error } = await supabase
      .from("Herramientas")
      .update({ estado: "Inactivo" })
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Error al inactivar herramienta ${id}: ${error.message}`);
    return data as Tool;
  }

  // =================================================================
  // R: READ (Obtener detalle por ID)
  // Esta función es útil para la vista "Detalle Herramienta"
  // =================================================================
  async getToolById(id: string) {
    const { data, error } = await supabase
      .from("Herramientas")
      .select("*")
      .eq("id", id)
      .single();

    if (error)
      throw new Error(
        `Error al obtener detalle de herramienta ${id}: ${error.message}`
      );
    return data as Tool;
  }
  async updateToolDetails(toolId: string, data: ToolUpdateData): Promise<void> {
    if (Object.keys(data).length === 0) {
      throw new Error("Datos de actualización vacíos.");
    }

    // La actualización de ubicacionActual y responsableActual se maneja
    // SOLO a través de los movimientos (Retiro/Devolución) para mantener la integridad.

    const { error } = await supabase
      .from(this.TOOLS_TABLE)
      .update(data)
      .eq("id", toolId);

    if (error) {
      throw new Error(
        `Error al actualizar la herramienta ${toolId}: ${error.message}`
      );
    }
  }
}
