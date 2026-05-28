// src/infrastructure/repositories/pg-auth.repository.ts
import pool from "../database/db";
import { IAuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/entities/user"; // Importa tu entidad

export class PgAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT id, name, email, password, role, status FROM users WHERE email = $1";
    const res = await pool.query(query, [email]);

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    
    // Mapeo manual para asegurar que cumpla con la interfaz User
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      status: row.status,
      // Si tu entidad User tiene más campos obligatorios, agrégalos aquí
    } as User; 
  }

  async save(user: User): Promise<void> {
    const query = "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)";
    await pool.query(query, [user.id, user.name, user.email, user.password, user.role]);
  }
  // Dentro de la clase PgAuthRepository
async updateLastLogin(userId: string): Promise<void> {
  try {
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [userId]
    );
  } catch (err: any) {
    // Postgres error 42703 = undefined_column
    if (err?.code === '42703') {
      console.warn('updateLastLogin: columna last_login no existe en users, omitiendo');
      return;
    }
    throw err;
  }
}
}