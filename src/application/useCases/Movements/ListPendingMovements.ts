import { SupabaseMovementService } from "../../../api/movement";

// Definimos un tipo que incluya el historial y los datos anidados de la herramienta y el responsable
interface PendingMovement {
  id: string;
  fechaRetiro: string;
  ubicacion: string;
  observaciones: string | null;
  herramienta: {
    nombre: string;
    serial: string;
  };
  responsable: {
    nombre: string;
    apellido: string;
  };
}

export class ListPendingMovements {
  private movementService: SupabaseMovementService;

  constructor(movementService: SupabaseMovementService) {
    this.movementService = movementService;
  }

  async execute(): Promise<PendingMovement[]> {
    const data = await this.movementService.getPendingMovements();
    // Nota: Tendrás que mapear los datos para ajustarlos al tipo PendingMovement[]
    // ya que el join de Supabase retorna un formato ligeramente diferente.

    // Por ahora, asumimos que el casting es seguro para el ejemplo
    return data as PendingMovement[];
  }
}
