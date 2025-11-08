import { SupabaseUserService } from "../../../api/UserService";

interface RegisterUserParams {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: "Admin" | "User";
}

export class RegisterUser {
  private userService: SupabaseUserService;

  constructor(userService: SupabaseUserService) {
    this.userService = userService;
  }

  async execute(params: RegisterUserParams): Promise<void> {
    const { email, password, nombre, apellido, rol } = params;

    // Validación de reglas de negocio (p. ej., longitud de contraseña, formato de email, etc.)
    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    if (!["Admin", "User"].includes(rol)) {
      throw new Error('Rol inválido. Debe ser "Admin" o "User".');
    }

    // Llamada al servicio para crear el usuario y el perfil
    await this.userService.registerNewUser(
      email,
      password,
      nombre,
      apellido,
      rol
    );
  }
}
