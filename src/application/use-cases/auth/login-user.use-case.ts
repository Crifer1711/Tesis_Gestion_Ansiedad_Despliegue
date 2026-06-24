// src/application/use-cases/auth/login-user.use-case.ts

import { IAuthRepository } from "@/domain/repositories/auth.repository";
import bcrypt from "bcrypt";

export class LoginUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, passwordPlan: string) {
    // 1. Buscamos el usuario por correo
    const user = await this.authRepository.findByEmail(email);
    
    // Si no existe, lanzamos error genérico para no revelar si el correo existe
    if (!user) {
      throw new Error("Correo o contraseña incorrectos");
    }

    // 2. Verificar estado ANTES de contraseña para dar mensaje claro
    const normalizedStatus = (user.status || '').toString().trim().toLowerCase();
    const isPending = normalizedStatus === 'pendiente';
    const isAccountEnabled = normalizedStatus === 'activo' || normalizedStatus === 'aprobado';

    if (isPending) {
      throw new Error('Tu cuenta aún no está verificada. Revisa tu correo institucional y haz clic en el enlace de activación.');
    }

    if (!isAccountEnabled) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // 3. Comparación segura con el hash de la base de datos
    const isPasswordValid = await bcrypt.compare(passwordPlan, user.password!);
    
    if (!isPasswordValid) {
      throw new Error("Correo o contraseña incorrectos");
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