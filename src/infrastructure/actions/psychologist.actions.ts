'use server'

import pool from "@/infrastructure/database/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt"; // Cambiado a bcryptjs para evitar errores de módulo
import { PgPsychologistRepository } from "../repositories/pg-psychologist.repository";
import { GetPsychologistDashboard } from "@/application/use-cases/get-psychologist-dashboard.use-case";

// 1. Interfaces específicas para evitar el error 'any'
interface CreatePsychologistData {
  name: string;
  email: string;
  password: string;
  especialidad: string;
  contacto: string;
}

interface UpdatePsychologistData {
  name: string;
  email: string;
  especialidad: string;
  contacto: string;
}

// --- ELIMINAR ---
export async function deletePsychologistAction(id: string) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath('/dashboard/admin/psicologos');
  } finally {
    client.release();
  }
}

// --- CREAR ---
export async function createPsychologistAction(formData: CreatePsychologistData) {
  const { name, email, password, especialidad, contacto } = formData;
  const client = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creado por el administrador: marcamos la cuenta como aprobada en la BD
    await client.query(
      `INSERT INTO users (name, email, password, role, status, especialidad, contacto) 
       VALUES ($1, $2, $3, 'PSICOLOGO', 'aprobado', $4, $5)`,
      [name, email, hashedPassword, especialidad, contacto]
    );

    revalidatePath('/dashboard/admin/psicologos');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al crear psicólogo:", errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}

// --- ACTUALIZAR (Corregido sin 'any') ---
export async function updatePsychologistAction(id: string, formData: UpdatePsychologistData) {
  const { name, email, especialidad, contacto } = formData;
  const client = await pool.connect();

  try {
    // Actualizamos los campos asegurando que las columnas existan
    await client.query(
      `UPDATE users 
       SET name = $1, email = $2, especialidad = $3, contacto = $4 
       WHERE id = $5`,
      [name, email, especialidad, contacto, id]
    );

    revalidatePath('/dashboard/admin/psicologos');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar";
    console.error("Error al editar psicólogo:", errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    client.release();
  }
}
export async function togglePsychologistStatusAction(id: string, currentStatus: string) {
  const client = await pool.connect();
  try {
    // Alternamos entre 'aprobado' y 'pendiente' para cumplir la constraint
    const lowered = (currentStatus || '').toString().toLowerCase();
    const newStatus = (lowered === 'aprobado' || lowered === 'activo') ? 'pendiente' : 'aprobado';

    await client.query(
      'UPDATE users SET status = $1 WHERE id = $2 AND role = $3',
      [newStatus, id, 'PSICOLOGO']
    );

    // Retornamos estado para UI
    const uiStatus = newStatus === 'aprobado' ? 'Activo' : 'Pendiente';
    return { success: true, newStatus: uiStatus };
  } catch (error: unknown) {
    console.error("Error al cambiar estado del psicólogo:", error);
    return { success: false, error: "No se pudo actualizar el estado" };
  } finally {
    client.release();
  }
}
export async function getDashboardAction(psychologistId: string) {
  // Siguiendo Clean Architecture: Action -> Use Case -> Repository
  const repository = new PgPsychologistRepository();
  const useCase = new GetPsychologistDashboard(repository);
  
  try {
    const data = await useCase.execute(psychologistId);
    return data;
  } catch (error) {
    console.error("Error en getDashboardAction:", error);
    // Devolvemos datos vacíos para que la UI no rompa si falla la DB
    return {
      stats: { totalPatients: 0, pendingAppointments: 0, acceptedAppointments: 0 },
      nextAppointments: [],
      recentActivities: []
    };
  }
}