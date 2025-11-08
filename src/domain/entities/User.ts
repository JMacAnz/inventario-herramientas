export type UserType = "admin" | "empleado";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserType;
  fechaCreacion: Date;
}
