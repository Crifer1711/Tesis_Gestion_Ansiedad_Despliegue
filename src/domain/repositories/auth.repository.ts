// src/domain/repositories/auth.repository.ts
import { User } from "../dtos/user.dto"; // ✅ Importar desde el DTO

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updateLastLogin(userId: string | number): Promise<void>; // ✅ Corregir tipo
}