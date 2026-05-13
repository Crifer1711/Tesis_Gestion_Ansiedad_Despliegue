import { MedicalRecord } from "@/domain/entities/MedicalRecord";
import { IMedicalRecordRepository } from "@/domain/repositories/IMedicalRecordRepository";

export class SaveMedicalRecord {
  constructor(private repository: IMedicalRecordRepository) {}

  async execute(data: MedicalRecord) {
    // Aquí podrías agregar lógica de validación de negocio antes de guardar
    if (!data.studentId) throw new Error("El ID del estudiante es obligatorio");

    // Llamamos al repositorio. El repositorio se encargará del SQL con ON CONFLICT
    return await this.repository.save(data);
  }
}