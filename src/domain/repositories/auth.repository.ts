import { User } from "../entities/user";

export interface IAuthRepository {
  updateLastLogin(id: string | undefined): unknown;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}