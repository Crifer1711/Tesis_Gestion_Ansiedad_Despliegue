"use client"

import { useState } from "react";
import { Activity } from '@/domain/dtos/activity.dto';
import { PatientListItemDTO } from '@/domain/dtos/patient-management.dto';

export default function PsychologistActivitiesClient({ activities, patients }: { activities: Activity[]; patients: PatientListItemDTO[] }) {
  const [assigning, setAssigning] = useState<Activity | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAssign() {
    if (!assigning) return;
    if (!selectedPatient) { setMessage('Selecciona un paciente'); return; }
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`/api/actividades/${assigning.id}/assign`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ patient: selectedPatient }) });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || 'Error asignando');
      else { setMessage('Asignación realizada'); setTimeout(()=>{ setAssigning(null); setSelectedPatient(''); setMessage(null); },900); }
    } catch (err) { console.error(err); setMessage('Error en la solicitud'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(act => (
          <div key={act.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center text-xl text-blue-700 font-bold">{act.nombre?.charAt(0) || 'A'}</div>
              <div>
                <div className="font-semibold text-gray-900">{act.nombre}</div>
                <div className="text-xs text-gray-600 mt-1">{act.categoria}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700">Duración: {act.duracion || '—'}s • Usos: {act.usos ?? 0}</div>
            <div className="mt-4 flex gap-2">
              <a href={act.embed_url || '#'} target="_blank" rel="noreferrer" className="px-3 py-2 bg-green-600 text-white rounded-md">Abrir</a>
              <button onClick={() => { setAssigning(act); setMessage(null); }} className="px-3 py-2 bg-blue-600 text-white rounded-md">Asignar</button>
            </div>
          </div>
        ))}
      </div>

      {assigning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-black">Asignar: {assigning.nombre}</h3>
              <button onClick={() => setAssigning(null)} className="text-black font-bold">Cerrar ✕</button>
            </div>
            <div className="p-6 text-black space-y-3">
              {message && <div className="text-sm text-red-600">{message}</div>}
              <div>
                <label className="block text-sm font-medium text-black font-bold">Selecciona paciente</label>
                <select value={selectedPatient} onChange={(e)=>setSelectedPatient(e.target.value)} className="w-full p-2 border rounded text-black">
                  <option value="">-- Seleccionar --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} — {p.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssigning(null)} className="px-4 py-2 bg-gray-100 text-black font-bold rounded">Cancelar</button>
                <button onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Asignando...' : 'Confirmar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
