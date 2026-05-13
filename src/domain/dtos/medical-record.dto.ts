export interface MedicalRecordDTO {
  patientId: string;
  // I. Identificación
  edad?: string;
  fechaNacimiento?: string;
  escolaridad?: string;
  estabEducacional?: string;
  conQuienVive?: string;
  domicilio?: string;
  quienConsulta?: string;
  interconsulta?: string;
  derivadoPor?: string;
  // II. Motivo de Consulta
  motivoPadres?: string;
  motivoNino?: string;
  motivoLatente?: string;
  intentosSolucion?: string;
  sintomatologiaConductual?: string;
  sintomatologiaEmocional?: string;
}

export interface IMedicalRecordRepository {
  getRecordByPatientId(patientId: string): Promise<MedicalRecordDTO | null>;
  upsertRecord(data: MedicalRecordDTO): Promise<MedicalRecordDTO>;
}