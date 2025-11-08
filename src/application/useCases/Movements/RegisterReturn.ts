import { SupabaseMovementService } from "../../../api/movement";

interface RegisterReturnParams {
  herramientaId: string;
  fechaDevolucion: string;
  observaciones: string | null;
}

export class RegisterReturn {
  private movementService: SupabaseMovementService;

  constructor(movementService: SupabaseMovementService) {
    this.movementService = movementService;
  }

  async execute(params: RegisterReturnParams): Promise<void> {
    // Se pueden añadir validaciones de negocio aquí, por ejemplo:
    // 1. Validar que la herramienta realmente no esté en la empresa.
    // 2. Validar el formato de la fecha.

    await this.movementService.registerReturn(params);
  }
}
