// src/api/movement.ts
import { supabase } from "../lib/supabaseClient";
import type { History } from "../domain/entities/History";

export interface RegisterMovementParams {
  herramientaId: string;
  // Para Retiro
  responsableId?: string;
  ubicacion?: string;
  fechaRetiro?: string;
  // Para Devolución
  fechaDevolucion?: string;
  observaciones?: string | null;
}

export class SupabaseMovementService {
  private readonly HISTORY_TABLE = "HistorialHerramientas";
  private readonly TOOLS_TABLE = "Herramientas";

  // =================================================================
  // A: Registrar Retiro (Crea Historial y Actualiza Herramienta)
  // =================================================================
  async registerWithdrawal(
    herramientaId: string,
    responsableId: string,
    ubicacion: string,
    fechaRetiro: string,
    observaciones: string | null
  ) {
    // 1. Crear el registro de Historial
    const { data: historyData, error: historyError } = await supabase
      .from(this.HISTORY_TABLE)
      .insert({
        herramientaId,
        fechaRetiro,
        responsable: responsableId,
        ubicacion,
        observaciones: observaciones,
        fechaIngreso: null, // Está retirado, por lo que es nulo
      })
      .select()
      .single();

    if (historyError)
      throw new Error(`Error al registrar historial: ${historyError.message}`);

    // 2. Actualizar la Herramienta
    const { error: toolError } = await supabase
      .from(this.TOOLS_TABLE)
      .update({
        ubicacionActual: ubicacion,
        responsableActual: responsableId,
        estado: "Activo", // Asegurar que está activo al ser retirado
      })
      .eq("id", herramientaId);

    if (toolError) {
      throw new Error(`Error al actualizar herramienta: ${toolError.message}`);
    }

    return historyData as History;
  }

  // =================================================================
  // B: Registrar Ingreso (Actualiza Historial y Herramienta)
  // =================================================================
  async registerEntry(
    herramientaId: string,
    historialId: string,
    fechaIngreso: string,
    observaciones: string | null
  ) {
    // 1. Actualizar el registro de Historial (cerrar el movimiento)
    const { data: historyData, error: historyError } = await supabase
      .from(this.HISTORY_TABLE)
      .update({
        fechaIngreso,
        observaciones: observaciones,
      })
      .eq("id", historialId)
      .select()
      .single();

    if (historyError)
      throw new Error(
        `Error al registrar ingreso en historial: ${historyError.message}`
      );

    // 2. Actualizar la Herramienta (ubicación "Empresa" y responsable null)
    const { error: toolError } = await supabase
      .from(this.TOOLS_TABLE)
      .update({
        ubicacionActual: "Empresa",
        responsableActual: null, // ✅ null porque no hay responsable asignado
      })
      .eq("id", herramientaId);

    if (toolError) {
      throw new Error(
        `Error al actualizar herramienta a 'Empresa': ${toolError.message}`
      );
    }

    return historyData as History;
  }

  // =================================================================
  // C: Leer Movimientos Pendientes
  // =================================================================
  async getPendingMovements() {
    const { data, error } = await supabase
      .from(this.HISTORY_TABLE)
      .select(
        "*, herramienta:herramientaId(nombre, serial), responsable:responsable(nombre, apellido)"
      )
      .is("fechaIngreso", null);

    if (error)
      throw new Error(
        `Error al obtener movimientos pendientes: ${error.message}`
      );

    return data;
  }

  // =================================================================
  // D: Obtener Historial por ID de Herramienta
  // =================================================================
  async getHistoryByToolId(toolId: string) {
    const { data, error } = await supabase
      .from(this.HISTORY_TABLE)
      .select("*")
      .eq("herramientaId", toolId)
      .order("fechaRetiro", { ascending: false });

    if (error) throw new Error(`Error al obtener historial: ${error.message}`);

    return data as History[];
  }

  // =================================================================
  // E: Registrar Devolución (Cierra Historial y Actualiza Herramienta)
  // =================================================================
  async registerReturn(params: RegisterMovementParams): Promise<void> {
    // Validación básica
    if (!params.fechaDevolucion) {
      throw new Error("Parámetro de fecha de devolución incompleto.");
    }

    // 1. Buscar el único registro de historial abierto (fechaIngreso es NULL)
    const { data: historyData, error: historyFetchError } = await supabase
      .from(this.HISTORY_TABLE)
      .select("id")
      .eq("herramientaId", params.herramientaId)
      .is("fechaIngreso", null)
      .maybeSingle();

    if (historyFetchError) {
      throw new Error(
        `Error al buscar movimiento abierto: ${historyFetchError.message}`
      );
    }

    if (!historyData) {
      throw new Error(
        "No se encontró un registro de retiro abierto para esta herramienta. No se puede devolver."
      );
    }

    // 2. Actualizar el registro abierto con la fecha de ingreso
    const { error: updateHistoryError } = await supabase
      .from(this.HISTORY_TABLE)
      .update({
        fechaIngreso: params.fechaDevolucion,
        observaciones: params.observaciones || null,
      })
      .eq("id", historyData.id);

    if (updateHistoryError) {
      throw new Error(
        `Error al actualizar el historial con la devolución: ${updateHistoryError.message}`
      );
    }

    // 3. Actualizar la herramienta (de vuelta a Empresa y responsable null)
    const { error: updateToolError } = await supabase
      .from(this.TOOLS_TABLE)
      .update({
        ubicacionActual: "Empresa",
        responsableActual: null, // ✅ null porque no hay responsable asignado
      })
      .eq("id", params.herramientaId);

    if (updateToolError) {
      throw new Error(
        `Error al actualizar la herramienta tras devolución: ${updateToolError.message}`
      );
    }
  }
}
