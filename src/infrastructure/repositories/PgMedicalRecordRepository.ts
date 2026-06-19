import pool from "../database/db";
import { MedicalRecordDTO, IMedicalRecordRepository } from "@/domain/dtos/medical-record.dto";

export class PgMedicalRecordRepository implements IMedicalRecordRepository {
  
  async getRecordByPatientId(patientId: string): Promise<MedicalRecordDTO | null> {
    const query = `SELECT * FROM medical_records WHERE patient_id = $1`;
    const res = await pool.query(query, [patientId]);
    
    if (res.rows.length === 0) return null;
    
    const row = res.rows[0];
    return this.mapToDTO(row);
  }

  async upsertRecord(data: MedicalRecordDTO): Promise<MedicalRecordDTO> {
    const query = `
      INSERT INTO medical_records (
        patient_id, edad, fecha_nacimiento, escolaridad, estab_educacional, 
        con_quien_vive, domicilio, derivado_por, departamento, carrera, genero, nivel,
        motivo_padres, motivo_nino, motivo_latente, intentos_solucion, 
        sintomatologia_conductual, sintomatologia_emocional, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
      )
      ON CONFLICT (patient_id) DO UPDATE SET
        edad = EXCLUDED.edad,
        fecha_nacimiento = EXCLUDED.fecha_nacimiento,
        escolaridad = EXCLUDED.escolaridad,
        estab_educacional = EXCLUDED.estab_educacional,
        con_quien_vive = EXCLUDED.con_quien_vive,
        domicilio = EXCLUDED.domicilio,
        departamento = EXCLUDED.departamento,
        carrera = EXCLUDED.carrera,
        genero = EXCLUDED.genero,
        nivel = EXCLUDED.nivel,
        derivado_por = EXCLUDED.derivado_por,
        motivo_padres = EXCLUDED.motivo_padres,
        motivo_nino = EXCLUDED.motivo_nino,
        motivo_latente = EXCLUDED.motivo_latente,
        intentos_solucion = EXCLUDED.intentos_solucion,
        sintomatologia_conductual = EXCLUDED.sintomatologia_conductual,
        sintomatologia_emocional = EXCLUDED.sintomatologia_emocional,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      data.patientId, data.edad, data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      data.escolaridad, data.estabEducacional, data.conQuienVive, data.domicilio,
      data.derivadoPor, data.departamento, data.carrera, data.genero, data.nivel,
      data.motivoPadres, data.motivoNino, data.motivoLatente, data.intentosSolucion,
      data.sintomatologiaConductual, data.sintomatologiaEmocional
    ];

    const res = await pool.query(query, values);
    return this.mapToDTO(res.rows[0]);
  }

  // Mapeador auxiliar corregido para retornar todos los datos al Frontend
  private mapToDTO(row: any): MedicalRecordDTO {
    return {
      patientId: row.patient_id.toString(),
      edad: row.edad,
      fechaNacimiento: row.fecha_nacimiento ? row.fecha_nacimiento.toISOString().split('T')[0] : '',
      escolaridad: row.escolaridad,
      estabEducacional: row.estab_educacional,
      conQuienVive: row.con_quien_vive,
      domicilio: row.domicilio,
      derivadoPor: row.derivado_por,
      
      // 👇 Campos nuevos integrados al mapeador
      departamento: row.departamento,
      carrera: row.carrera,
      genero: row.genero,
      nivel: row.nivel,

      motivoPadres: row.motivo_padres,
      motivoNino: row.motivo_nino,
      motivoLatente: row.motivo_latente,
      intentosSolucion: row.intentos_solucion,
      sintomatologiaConductual: row.sintomatologia_conductual,
      sintomatologiaEmocional: row.sintomatologia_emocional
    };
  }
}