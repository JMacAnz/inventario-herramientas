// src/api/auth.ts
import { supabase } from "../lib/supabaseClient";

export class SupabaseAuthService {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  // ... Implementar métodos para registro y recuperación de contraseña (usando RLS en Supabase)
}
