'use server'

import pool from "@/infrastructure/database/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// --- INTERFACES ---
export interface CreatePatientData {
  name: string;
  lastname: string; // ✅ AGREGADO
  email: string;
  password: string;
  contacto: string;
}

export interface UpdatePatientData {
  name: string;
  lastname: string; // ✅ AGREGADO
  email: string;
  contacto: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}

// --- ELIMINAR PACIENTE ---
export async function deletePatientAction(id: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM bienestar_asignaciones WHERE estudiante_id = $1', [id]);

    const deletedUser = await client.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id',
      [id, 'PACIENTE']
    );

    if (deletedUser.rowCount === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Paciente no encontrado o no se pudo eliminar' };
    }

    await client.query('COMMIT');
    revalidatePath('/dashboard/admin/pacientes');
    return { success: true };
  } catch (error: unknown) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // No-op: rollback best effort
    }
    const errorMessage = error instanceof Error ? error.message : "Error al eliminar";
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}

// --- CREAR PACIENTE ---
export async function createPatientAction(formData: CreatePatientData) {
  const { name, lastname, email, password, contacto } = formData; // ✅ AGREGADO lastname
  const client = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ AGREGADO lastname en la consulta SQL
    const result = await client.query(
      `INSERT INTO users (name, lastname, email, password, role, status, contacto) 
       VALUES ($1, $2, $3, $4, 'PACIENTE', 'Activo', $5)
       RETURNING id, TO_CHAR(created_at, 'DD/MM/YY') AS fecha_registro`,
      [name, lastname, email, hashedPassword, contacto] // ✅ AGREGADO lastname
    );

    revalidatePath('/dashboard/admin/pacientes');
    return { success: true, id: result.rows[0]?.id, fecha_registro: result.rows[0]?.fecha_registro };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}

// --- ACTUALIZAR PACIENTE ---
export async function updatePatientAction(id: string, formData: UpdatePatientData) {
  const { name, lastname, email, contacto, estado } = formData; // ✅ AGREGADO lastname
  const client = await pool.connect();

  try {
    // Mapeamos los estados de la UI a los valores aceptados por la BD
    const dbStatus = estado === 'Activo' ? 'aprobado' : 'pendiente';
    
    // ✅ AGREGADO lastname en la consulta SQL
    await client.query(
      `UPDATE users 
       SET name = $1, lastname = $2, email = $3, contacto = $4, status = $5 
       WHERE id = $6`,
      [name, lastname, email, contacto, dbStatus, id] // ✅ AGREGADO lastname
    );

    revalidatePath('/dashboard/admin/pacientes');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar";
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}

export async function togglePatientStatusAction(id: string, currentStatus: string) {
  const client = await pool.connect();
  try {
    const lowered = (currentStatus || '').toString().toLowerCase();
    const newStatus = (lowered === 'activo' || lowered === 'aprobado') ? 'Inactivo' : 'Activo';

    await client.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [newStatus, id]
    );

    return { success: true, newStatus };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: "No se pudo cambiar el estado" };
  } finally {
    client.release();
  }
}