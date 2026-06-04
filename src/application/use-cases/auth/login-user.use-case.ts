// src/application/use-cases/auth/login-user.use-case.ts

import { IAuthRepository } from "@/domain/repositories/auth.repository";
import bcrypt from "bcrypt";

export class LoginUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, passwordPlan: string) {
    // 1. Buscamos el usuario por correo
    const user = await this.authRepository.findByEmail(email);
    
    // Si no existe, lanzamos el error específico de correo
    if (!user) {
      throw new Error("Correo incorrecto");
    }

    // 2. Comparación segura con el hash de la base de datos
    const isPasswordValid = await bcrypt.compare(passwordPlan, user.password!);
    
    // Si la contraseña no coincide, lanzamos el error específico de contraseña
    if (!isPasswordValid) {
      throw new Error("Contraseña incorrecta");
    }

    // 3. Verificación de estado de cuenta
    const normalizedStatus = (user.status || '').toString().trim().toLowerCase();
    const isAccountEnabled = normalizedStatus === 'activo' || normalizedStatus === 'aprobado';

    if (!isAccountEnabled) {
      throw new Error("Usuario no aprobado o desactivado");
    }

    // 4. Registro de fecha de último inicio de sesión
    if (user.role === "PACIENTE") {
      await this.authRepository.updateLastLogin(user.id);
    }

    // Retornamos los datos necesarios para la sesión
    return { 
      id: user.id,
      role: user.role, 
      name: user.name 
    };
  }
}