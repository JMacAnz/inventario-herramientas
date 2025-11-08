import { SupabaseMovementService } from "../../../api/movement";
import type { History } from "../../../domain/entities/History";

export type EntryData = {
  herramientaId: string;
  historialId: string;
  fechaIngreso: string; // ISO string de fecha/hora
  observaciones: string | null;
};

export class RegisterEntry {
  private movementService: SupabaseMovementService;

  constructor(movementService: SupabaseMovementService) {
    this.movementService = movementService;
  }

  async execute(data: EntryData): Promise<History> {
    // Validación de lógica de negocio
    if (!data.historialId || !data.herramientaId || !data.fechaIngreso) {
      throw new Error(
        "Se requiere ID de historial, ID de herramienta y fecha de ingreso."
      );
    }

    // El servicio actualiza el historial existente y pone la herramienta en "Empresa".
    const updatedHistoryRecord = await this.movementService.registerEntry(
      data.herramientaId,
      data.historialId,
      data.fechaIngreso,
      data.observaciones
    );

    return updatedHistoryRecord;
  }
}
