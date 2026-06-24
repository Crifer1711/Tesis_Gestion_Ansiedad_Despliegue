import pool from "../database/db";
import { IAuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/entities/user";

export class PgUserRepository implements IAuthRepository {
  async save(user: User): Promise<void> {
    // 1. Actualizamos la consulta para incluir los nuevos campos
    const query = `
      INSERT INTO users (
        email, password, name, lastname, role, contacto, status, especialidad,
        verification_token, verification_token_expires_at, email_verified_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    // 2. Definimos los valores con las reglas que pediste
    const values = [
      user.email,
      user.password, // Ya cifrado desde el Use Case
      user.name,
      user.lastname,
      user.role || 'PACIENTE',             // Evita el error NOT NULL si no viene el rol
      user.contacto,                        // Capturado desde el nuevo input del registro
      // Registro con verificación por correo
      (user.status || 'pendiente').toLowerCase(),
      user.especialidad || 'Psicología Clínica', // Valor por defecto solicitado
      user.verificationToken || null,
      user.verificationTokenExpiresAt || null,
      user.emailVerifiedAt || null,
    ];

    await pool.query(query, values);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async updateLastLogin(id: string | undefined) {
    try {
      if (!id) return null;
      await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [id]);
      return true;
    } catch (err: unknown) {
      // Some deployments may not yet have last_login column — ignore that specific error
      const isPgUndefinedColumn = (err instanceof Error) && err.message.includes('42703');
      if (isPgUndefinedColumn) return null;
      throw err;
    }
  }
}