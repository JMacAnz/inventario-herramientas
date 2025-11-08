// Tipos de datos estrictos para el campo 'tipo'
export type ToolType =
  | "Eléctrica"
  | "Manual"
  | "Mecánica"
  | "Especial"
  | "Equipo de Altura";

// Tipos de datos estrictos para el campo 'estado'
export type ToolStatus = "Activo" | "Inactivo" | "Perdido" | "En mantenimiento";

/**
 * Define la estructura de datos (Entidad) para una Herramienta.
 * Esta definición es independiente de la base de datos o de la interfaz de usuario.
 */
export interface Tool {
  /** Clave primaria única generada por Supabase */
  id: string;
  /** Nombre comercial de la herramienta */
  nombre: string;
  /** Marca del fabricante */
  marca: string;
  /** Número de serie único para identificar el activo */
  serial: string;
  /** Categoría de la herramienta (de ToolType) */
  tipo: ToolType;
  /** Estado actual de operatividad (de ToolStatus) */
  estado: ToolStatus;
  /** Ubicación actual: nombre de obra, taller o "Empresa" */
  ubicacionActual: string;
  /** ID del usuario responsable o null si está en "Empresa" */
  responsableActual: string | null;
  /** Fecha en que se registró la herramienta (Supabase 'created_at') */
  fechaCreacion: Date;
}
