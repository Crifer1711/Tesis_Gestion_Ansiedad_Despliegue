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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {activities.map(act => (
          <div key={act.id} className="group overflow-hidden rounded-[26px] border border-blue-200 bg-white shadow-[0_10px_28px_rgba(30,77,140,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(30,77,140,0.14)]">
            <div className="h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
            <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-200 flex items-center justify-center text-xl text-[#1E4D8C] font-black shadow-sm">{act.nombre?.charAt(0) || 'A'}</div>
              <div>
                <div className="font-black text-slate-800 leading-tight">{act.nombre}</div>
                <div className="mt-1 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#1E4D8C]">{act.categoria}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
              <span className="rounded-full bg-slate-50 px-3 py-1 border border-slate-100">Duración: {act.duracion || '—'}s</span>
              <span className="rounded-full bg-slate-50 px-3 py-1 border border-slate-100">Usos: {act.usos ?? 0}</span>
            </div>
            <div className="mt-5 flex gap-3">
              <a href={act.embed_url || '#'} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-[#1E4D8C] transition hover:bg-blue-50">Abrir</a>
              <button onClick={() => { setAssigning(act); setMessage(null); }} className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#8FBDEB] bg-[#DDEEFF] px-4 py-3 text-sm font-black text-[#1E4D8C] shadow-sm transition hover:bg-[#CFE5FF] hover:shadow-md">Asignar</button>
            </div>
            </div>
          </div>
        ))}
      </div>

      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-[0_24px_80px_rgba(30,77,140,0.20)]">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#EAF2FF] to-[#DDF0FF] px-6 py-4 text-[#1E4D8C]">
              <h3 className="font-black text-lg">Asignar: {assigning.nombre}</h3>
              <button onClick={() => setAssigning(null)} className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#1E4D8C] shadow-sm transition hover:bg-blue-50">Cerrar ✕</button>
            </div>
            <div className="space-y-4 p-6 text-slate-700">
              {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{message}</div>}
              <div>
                <label className="mb-2 block text-sm font-black text-[#1E4D8C]">Selecciona paciente</label>
                <select value={selectedPatient} onChange={(e)=>setSelectedPatient(e.target.value)} className="w-full rounded-2xl border border-blue-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-[#1E4D8C] focus:bg-white">
                  <option value="">-- Seleccionar --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} — {p.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setAssigning(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                <button onClick={handleAssign} className="rounded-2xl bg-[#1E4D8C] px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-[#173d6f] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Asignando...' : 'Confirmar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
