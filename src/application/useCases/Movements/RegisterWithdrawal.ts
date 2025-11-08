import { SupabaseMovementService } from "../../../api/movement";
import type { History } from "../../../domain/entities/History";

export type WithdrawalData = {
  herramientaId: string;
  responsableId: string;
  ubicacion: string;
  fechaRetiro: string; // ISO string de fecha/hora
  observaciones: string | null;
};

export class RegisterWithdrawal {
  private movementService: SupabaseMovementService;

  constructor(movementService: SupabaseMovementService) {
    this.movementService = movementService;
  }

  async execute(data: WithdrawalData): Promise<History> {
    // Validación de lógica de negocio
    if (!data.herramientaId || !data.responsableId || !data.ubicacion) {
      throw new Error(
        "Se requiere ID de herramienta, responsable y ubicación para el retiro."
      );
    }

    // El servicio de infraestructura maneja la creación del historial y
    // la actualización atómica de la tabla Herramientas.
    const newHistoryRecord = await this.movementService.registerWithdrawal(
      data.herramientaId,
      data.responsableId,
      data.ubicacion,
      data.fechaRetiro,
      data.observaciones
    );

    return newHistoryRecord;
  }
}
