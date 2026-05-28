import { MedicalRecordDTO } from "@/domain/dtos/medical-record.dto";
import { IMedicalRecordRepository } from "@/domain/dtos/medical-record.dto";

export class SaveMedicalRecord {
  constructor(private repository: IMedicalRecordRepository) {}

  async execute(data: MedicalRecordDTO) {
    // Aquí podrías agregar lógica de validación de negocio antes de guardar
    if (!data.patientId) throw new Error("El ID del paciente es obligatorio");

    // Llamamos al repositorio. El repositorio se encargará del SQL con ON CONFLICT
    return await this.repository.upsertRecord(data);
  }
}