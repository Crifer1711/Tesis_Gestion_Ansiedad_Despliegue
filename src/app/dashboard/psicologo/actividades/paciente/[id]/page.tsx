import pool from "@/infrastructure/database/db";
import { ActividadesCompletadasClient } from "./ActividadesCompletadasClient";

export interface CompletedActivityRow {
  paciente: string;
  actividad: string;
  completed_at: string;
  duracion_segundos: number;
  resumen: any;
  entrada_estudiante: string;
  respuesta_ia: any;
}

export default async function PacienteActividadesCompletadasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estudianteId = Number(id);

  if (Number.isNaN(estudianteId)) {
    return <div className="p-8 text-red-600">ID de paciente inválido</div>;
  }

  const sql = `
    SELECT
      u.name as paciente,
      COALESCE(a.titulo, bi.actividad_slug) as actividad,
      bi.completed_at,
      bi.duracion_segundos,
      bi.resumen,
      bi.entrada_estudiante,
      bi.respuesta_ia
    FROM bienestar_intentos bi
    JOIN users u ON bi.estudiante_id = u.id
    LEFT JOIN actividades a ON bi.actividad_slug = a.slug
    WHERE bi.estudiante_id = $1 AND bi.culmino = true
    ORDER BY bi.completed_at DESC
  `;

  const result = await pool.query(sql, [estudianteId]);
  const actividades: CompletedActivityRow[] = result.rows;

  const nombrePaciente = actividades.length > 0 ? actividades[0].paciente : "Paciente";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/psicologo"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Volver al panel
        </a>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#1E4D8C]">
          Actividades Realizadas
        </h1>
        <p className="text-slate-600 mt-1">
          {nombrePaciente} &mdash; {actividades.length} actividad{actividades.length !== 1 ? "es" : ""} completada{actividades.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ActividadesCompletadasClient actividades={actividades} />
    </div>
  );
}
