'use server'

import pool from "@/infrastructure/database/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// --- INTERFACES ---
export interface CreatePatientData { // <--- Debe tener 'export'
  name: string;
  email: string;
  password: string;
  contacto: string;
}

export interface UpdatePatientData {
  name: string;
  email: string;
  contacto: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}

// --- ELIMINAR PACIENTE ---
export async function deletePatientAction(id: string) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath('/dashboard/admin/pacientes');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al eliminar";
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}

// --- CREAR PACIENTE ---
export async function createPatientAction(formData: CreatePatientData) {
  const { name, email, password, contacto } = formData;
  const client = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nota: 'fecha_registro' se suele manejar con DEFAULT CURRENT_TIMESTAMP en la DB
    // Usamos el rol 'ESTUDIANTE' o 'PACIENTE' según tu lógica de negocio
    // Al crear desde el administrador, marcamos la cuenta como aprobada en la BD
    await client.query(
      `INSERT INTO users (name, email, password, role, status, contacto) 
       VALUES ($1, $2, $3, 'PACIENTE', 'aprobado', $4)`,
      [name, email, hashedPassword, contacto]
    );

    revalidatePath('/dashboard/admin/pacientes');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: errorMessage };

  } finally {
    client.release();
  }
}

// --- ACTUALIZAR PACIENTE ---
export async function updatePatientAction(id: string, formData: UpdatePatientData) {
  const { name, email, contacto, estado } = formData;
  const client = await pool.connect();

  try {
    // Mapeamos los estados de la UI a los valores aceptados por la BD
    // UI usa 'Activo'/'Inactivo'/'Pendiente' — DB espera 'aprobado'|'pendiente'
    const dbStatus = estado === 'Activo' ? 'aprobado' : 'pendiente';
    await client.query(
      `UPDATE users 
       SET name = $1, email = $2, contacto = $3, status = $4 
       WHERE id = $5`,
      [name, email, contacto, dbStatus, id]
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
    // Mapeamos y alternamos entre 'aprobado' y 'pendiente' para cumplir la constraint
    const lowered = (currentStatus || '').toString().toLowerCase();
    const newStatus = (lowered === 'aprobado' || lowered === 'activo') ? 'pendiente' : 'aprobado';

    await client.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [newStatus, id]
    );

    // Devolvemos el nuevo estado en formato amigable para la UI
    const uiStatus = newStatus === 'aprobado' ? 'Activo' : 'Pendiente';
    return { success: true, newStatus: uiStatus };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: "No se pudo cambiar el estado" };
  } finally {
    client.release();
  }
}