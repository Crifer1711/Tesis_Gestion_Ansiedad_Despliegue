// src/infrastructure/repositories/pg-auth.repository.ts
import pool from "../database/db";
import { IAuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/dtos/user.dto";

export class PgAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    // ✅ SOLO agregar lastname al SELECT
    const query = "SELECT id, name, lastname, email, password, role, status FROM users WHERE email = $1";
    const res = await pool.query(query, [email]);

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    
    return {
      id: row.id,
      name: row.name,
      lastname: row.lastname || '', // ✅ AGREGAR
      email: row.email,
      password: row.password,
      role: row.role,
      status: row.status,
    } as User;
  }

  async save(user: User): Promise<void> {
    // ✅ SOLO agregar lastname al INSERT
    const query = "INSERT INTO users (id, name, lastname, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)";
    await pool.query(query, [user.id, user.name, user.lastname || '', user.email, user.password, user.role]);
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await pool.query(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        [userId]
      );
    } catch (err: any) {
      if (err?.code === '42703') {
        console.warn('updateLastLogin: columna last_login no existe en users, omitiendo');
        return;
      }
      throw err;
    }
  }
}