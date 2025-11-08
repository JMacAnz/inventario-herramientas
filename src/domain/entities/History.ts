// src/domain/entities/History.ts

/**
 * Define la estructura de datos para un registro de Historial de Movimientos.
 */
export interface History {
  id: string;
  herramientaId: string; // FK a Herramientas
  fechaRetiro: Date;
  fechaIngreso: Date | null; // Null si la herramienta está fuera
  responsable: string; // ID del usuario responsable (FK a profiles/users)
  ubicacion: string; // Obra específica
  observaciones: string | null;
  createdAt: Date; // Usaremos el 'created_at' de Supabase
}
