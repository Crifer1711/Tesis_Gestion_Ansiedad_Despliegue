"use client";

import { useState } from "react";
import type { CompletedActivityRow } from "./page";

function parseEntrada(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

function renderRespuesta(ia: any): React.ReactNode {
  if (!ia) return "—";
  if (typeof ia === "string") {
    try {
      const parsed = JSON.parse(ia);
      return renderRespuesta(parsed);
    } catch {
      return ia;
    }
  }
  if (typeof ia === "object") {
    return (
      <div className="space-y-2">
        {ia.distorsion && (
          <div>
            <span className="font-bold text-gray-600">Distorsión:</span>{" "}
            <span>{ia.distorsion}</span>
          </div>
        )}
        {ia.sugerencia && (
          <div>
            <span className="font-bold text-gray-600">Sugerencia:</span>{" "}
            <span>{ia.sugerencia}</span>
          </div>
        )}
        {Object.entries(ia)
          .filter(([k]) => k !== "distorsion" && k !== "sugerencia")
          .map(([k, v]) => (
            <div key={k}>
              <span className="font-bold text-gray-600 capitalize">{k}:</span>{" "}
              <span>{String(v)}</span>
            </div>
          ))}
      </div>
    );
  }
  return String(ia);
}

interface Props {
  actividades: CompletedActivityRow[];
}

export function ActividadesCompletadasClient({ actividades }: Props) {
  const [selected, setSelected] = useState<CompletedActivityRow | null>(null);

  return (
    <>
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actividad</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Completado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Duración (s)</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Resumen</th>
              </tr>
            </thead>
            <tbody>
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                    No hay actividades completadas para este paciente
                  </td>
                </tr>
              ) : (
                actividades.map((act, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => setSelected(act)}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{act.actividad}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {act.completed_at
                        ? new Date(act.completed_at).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {act.duracion_segundos ? `${act.duracion_segundos}s` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {act.resumen
                        ? typeof act.resumen === "string"
                          ? act.resumen
                          : JSON.stringify(act.resumen)
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#D1E7FF] px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-bold text-gray-800">{selected.actividad}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-600 hover:text-gray-900 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-gray-600">Completado:</span>{" "}
                  {selected.completed_at
                    ? new Date(selected.completed_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </div>
                <div>
                  <span className="font-bold text-gray-600">Duración:</span>{" "}
                  {selected.duracion_segundos ? `${selected.duracion_segundos}s` : "—"}
                </div>
              </div>

              {selected.resumen && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-1">Resumen</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {typeof selected.resumen === "string"
                      ? selected.resumen
                      : JSON.stringify(selected.resumen, null, 2)}
                  </p>
                </div>
              )}

              {selected.entrada_estudiante && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-1">Entrada del Estudiante</h4>
                  <div className="bg-gray-50 p-3 rounded space-y-1">
                    {Object.entries(parseEntrada(selected.entrada_estudiante)).map(([k, v]) => (
                      <p key={k} className="text-sm text-gray-600">
                        <span className="font-semibold capitalize">{k}:</span> {v}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selected.respuesta_ia && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-1">Respuesta de la IA</h4>
                  <div className="bg-blue-50 p-3 rounded text-sm text-gray-700">
                    {renderRespuesta(selected.respuesta_ia)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
