import { supabase } from "../lib/supabaseClient";

// ------------------------------------------------
// INTERFACES DEL DOMINIO
// ------------------------------------------------

// Definición básica de la entidad de perfil
export interface UserProfile {
  idUser: string;
  nombre: string;
  apellido: string;
  rol: "Admin" | "User";
}

// Nueva interfaz para el DDL (Dropdown List)
export interface SimpleProfile {
  idUser: string;
  fullName: string;
}

// ------------------------------------------------
// SERVICIO DE ACCESO A DATOS
// ------------------------------------------------

/**
 * Servicio para interactuar con la gestión de usuarios (Auth y Perfiles).
 */
export class SupabaseUserService {
  /**
   * Registra un nuevo usuario en Supabase Auth y crea su perfil inicial.
   * @param email - Correo del nuevo usuario (será el login).
   * @param password - Contraseña inicial.
   * @param name - Nombre del usuario.
   * @param lastName - Apellido del usuario.
   * @param role - Rol asignado ('Admin' o 'User').
   */
  async registerNewUser(
    email: string,
    password: string,
    name: string,
    lastName: string,
    role: "Admin" | "User"
  ): Promise<void> {
    // 1. Crear el usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          lastName: lastName,
          // Nota: Los metadatos del usuario se guardan aquí,
          // pero el rol se guarda en la tabla 'profiles' para RLS.
        },
      },
    });

    if (authError) {
      throw new Error(`Error de autenticación: ${authError.message}`);
    }

    if (!data.user) {
      throw new Error(
        "El registro de usuario falló y no se devolvió un usuario."
      );
    }

    const userId = data.user.id;

    // 2. Insertar el perfil en la tabla 'profiles'
    const { error: profileError } = await supabase.from("profiles").insert({
      idUser: userId,
      nombre: name,
      apellido: lastName,
      rol: role,
    });

    if (profileError) {
      // Si el perfil falla, idealmente se debería revertir la creación de auth,
      // pero por simplicidad, solo mostramos el error.
      throw new Error(`Error al crear el perfil: ${profileError.message}`);
    }
  }

  /**
   * Obtiene la lista de todos los perfiles de usuario.
   */
  async listAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("idUser, nombre, apellido, rol, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error al listar perfiles: ${error.message}`);
    }

    // Mapear los datos para asegurar el tipado
    return data.map((p) => ({
      idUser: p.idUser,
      nombre: p.nombre,
      apellido: p.apellido,
      rol: p.rol,
    })) as UserProfile[];
  }

  /**
   * Obtiene una lista simple de perfiles (ID y Nombre Completo) para DDLs.
   * ESTA ES LA FUNCIÓN SOLICITADA PARA EL DDL DE INVENTARIO.
   */
  async listSimpleProfiles(): Promise<SimpleProfile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("idUser, nombre, apellido")
      .order("nombre", { ascending: true }); // Ordenar por nombre

    if (error) {
      throw new Error(`Error al listar perfiles simples: ${error.message}`);
    }

    // Mapear a SimpleProfile (idUser, fullName)
    return data.map((p) => ({
      idUser: p.idUser,
      fullName: `${p.nombre} ${p.apellido}`,
    })) as SimpleProfile[];
  }
}
