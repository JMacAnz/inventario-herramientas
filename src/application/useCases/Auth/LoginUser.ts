// src/application/useCases/Auth/LoginUser.ts

// AÑADE ESTA LÍNEA para importar la instancia
import { supabase } from "../../../lib/supabaseClient";

import { SupabaseAuthService } from "../../../api/auth";

export class LoginUser {
  private authService: SupabaseAuthService;

  constructor(authService: SupabaseAuthService) {
    this.authService = authService;
  }

  async execute(email: string, password: string) {
    try {
      // 1. Autenticar al usuario
      const userData = await this.authService.login(email, password);
      console.log("Usuario autenticado:", userData.user?.id);

      if (!userData.user?.id) {
        throw new Error(
          "El ID de usuario no fue proporcionado después del login."
        );
      }

      // 2. Obtener el rol del usuario desde la tabla 'profiles'
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("rol")
        .eq("idUser", userData.user.id) // Usamos el ID de usuario
        .single();

      if (profileError) {
        throw new Error(`Error al cargar el perfil: ${profileError.message}`);
      }

      return { user: userData.user, rol: profile.rol };
    } catch (error: any) {
      // Manejo general de errores
      throw new Error(`Fallo en el login: ${error.message}`);
    }
  }
}
