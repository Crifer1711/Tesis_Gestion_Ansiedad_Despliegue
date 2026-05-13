// src/application/use-cases/auth/login-user.use-case.ts

import { IAuthRepository } from "@/domain/repositories/auth.repository";
import bcrypt from "bcrypt";

export class LoginUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, passwordPlan: string) {
    const user = await this.authRepository.findByEmail(email);
    
    if (!user) throw new Error("Credenciales inválidas");

    // Comparación segura con el hash de la base de datos (PostgreSQL)
    const isPasswordValid = await bcrypt.compare(passwordPlan, user.password!);
    if (!isPasswordValid) throw new Error("Credenciales inválidas");

    // ============================================================
    // NUEVO: Registramos la fecha de inicio de sesión
    // Solo si el usuario es un PACIENTE (o puedes quitar el IF si quieres para todos)
    if (user.role === "PACIENTE") {
      await this.authRepository.updateLastLogin(user.id);
    }
    // ============================================================

    // Retornamos el rol para la redirección
    return { 
      id: user.id,
      role: user.role, 
      name: user.name 
    };
  }
}