import { IAuthRepository } from "@/domain/repositories/auth.repository";
import bcrypt from "bcryptjs";

export class LoginUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, passwordPlan: string) {
    const user = await this.authRepository.findByEmail(email);
    
    // 1. Si no existe el usuario, el correo está mal
    if (!user) throw new Error("Correo incorrecto");

    // 2. Si existe, comparamos la contraseña
    const isPasswordValid = await bcrypt.compare(passwordPlan, user.password!);
    
    // 3. Si la contraseña no coincide
    if (!isPasswordValid) throw new Error("Contraseña incorrecta");

    return {
      id: user.id,
      role: user.role,
      name: user.name,
    };
  }
}