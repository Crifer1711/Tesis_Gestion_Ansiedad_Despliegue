"use server";
import { MedicalRecordDTO } from "@/domain/dtos/medical-record.dto";
import { PgMedicalRecordRepository } from "../repositories/PgMedicalRecordRepository";

const repository = new PgMedicalRecordRepository();

export async function getMedicalRecordAction(patientId: string) {
  try {
    const record = await repository.getRecordByPatientId(patientId);
    return { success: true, data: record };
  } catch (error) {
    console.error("Error al obtener la ficha médica:", error);
    return { success: false, error: "No se pudo cargar la ficha." };
  }
}

export async function saveMedicalRecordAction(data: MedicalRecordDTO) {
  try {
    const savedRecord = await repository.upsertRecord(data);
    return { success: true, data: savedRecord };
  } catch (error) {
    console.error("Error al guardar la ficha médica:", error);
    return { success: false, error: "No se pudo guardar la ficha." };
  }
}