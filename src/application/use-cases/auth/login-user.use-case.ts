// src/application/use-cases/auth/login-user.use-case.ts
import { IAuthRepository } from "@/domain/repositories/auth.repository";
import bcrypt from "bcrypt";

export class LoginUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, passwordPlan: string) {
    const user = await this.authRepository.findByEmail(email);
    
    if (!user) {
      throw new Error("Correo o contraseña incorrectos");
    }

    const normalizedStatus = (user.status || '').toString().trim().toLowerCase();
    const isPending = normalizedStatus === 'pendiente';
    const isAccountEnabled = normalizedStatus === 'activo' || normalizedStatus === 'aprobado';

    if (isPending) {
      throw new Error('Tu cuenta aún no está verificada. Revisa tu correo institucional y haz clic en el enlace de activación.');
    }

    if (!isAccountEnabled) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(passwordPlan, user.password!);
    
    if (!isPasswordValid) {
      throw new Error("Correo o contraseña incorrectos");
    }

    if (user.role === "PACIENTE") {
      await this.authRepository.updateLastLogin(user.id);
    }

    // ✅ AGREGAR lastname al return
    return { 
      id: user.id,
      role: user.role, 
      name: user.name,
      lastname: user.lastname || '', // ✅ AGREGAR
    };
  }
}