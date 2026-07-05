// src/infrastructure/repositories/pg-user.repository.ts
import pool from "../database/db";
import { IAuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/dtos/user.dto";

export class PgUserRepository implements IAuthRepository {
  async save(user: User): Promise<void> {
    const query = `
      INSERT INTO users (
        email, password, name, lastname, role, contacto, status, especialidad,
        verification_token, verification_token_expires_at, email_verified_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    const values = [
      user.email,
      user.password,
      user.name,
      user.lastname || '',
      user.role || 'PACIENTE',
      user.contacto || null,
      (user.status || 'pendiente').toLowerCase(),
      user.especialidad || null,
      user.verificationToken || null,
      user.verificationTokenExpiresAt || null,
      user.emailVerifiedAt || null,
    ];

    await pool.query(query, values);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      lastname: row.lastname || '',
      role: row.role,
      contacto: row.contacto || '',
      status: row.status || 'pendiente',
      especialidad: row.especialidad || null,
      verificationToken: row.verification_token || null,
      verificationTokenExpiresAt: row.verification_token_expires_at || null,
      emailVerifiedAt: row.email_verified_at || null,
    };
  }

  async updateLastLogin(id: string | number | undefined): Promise<void> {
    try {
      if (!id) return;
      await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [id]);
    } catch (err: unknown) {
      const isPgUndefinedColumn = (err instanceof Error) && err.message.includes('42703');
      if (isPgUndefinedColumn) return;
      throw err;
    }
  }
}