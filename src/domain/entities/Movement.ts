// src/domain/entities/Movement.ts

export type MovementType = "Retiro" | "Devolucion";

/**
 * Define un registro de movimiento (Retiro o Devolución) de una herramienta.
 */
export interface Movement {
  id: string;
  herramientaId: string;
  tipo: MovementType;
  fecha: string; // ISO string
  responsableId: string | null; // ID del responsable
  ubicacion: string; // Ubicacion de destino ('Obra X') o 'Empresa'
  observaciones: string | null;
}
