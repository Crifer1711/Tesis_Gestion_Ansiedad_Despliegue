'use client'

import { useEffect, useMemo, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity } from "@/domain/dtos/activity.dto";
import { Search, Edit2, Eye, Trash2, Upload } from "lucide-react";
import { useConfirm } from '@/presentation/components/common/ConfirmProvider';

export function ActivityManagement({ initialActivities = [] }: { initialActivities: Activity[] }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [importMode, setImportMode] = useState<'zip'|'url'>('zip');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [assigningActivity, setAssigningActivity] = useState<Activity | null>(null);
  const [assignPatientInput, setAssignPatientInput] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const confirm = useConfirm();

  const categories = ['Todos', 'Respiración', 'Visualizacion', 'Sonidos', 'Interaccion', 'Otros'];

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const normalizeEstado = (estado: string) => {
    const value = (estado || '').toString().trim().toLowerCase();
    if (value === 'aprobada' || value === 'activo') return 'Aprobada';
    if (value === 'rechazada' || value === 'inactivo') return 'Rechazada';
    return 'Pendiente';
  };

  const isApproved = (estado: string) => normalizeEstado(estado) === 'Aprobada';

  const updateActivity = (id: string | number, patch: Partial<Activity>) => {
    setActivities(prev => prev.map(activity => (
      activity.id === id ? { ...activity, ...patch } : activity
    )));
  };

  const removeActivity = (id: string | number) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const filteredActivities = useMemo(() => activities.filter(a => {
    const matchesFilter = filter === 'Todos' ? true : (a.categoria === filter);
    const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [activities, filter, searchTerm]);

  return (
    <div className="p-6 bg-[#E3F2FD] min-h-screen space-y-6 font-sans">
      
      {/* Contenedor principal */}
      <div className="bg-[#D1E7FF] p-8 rounded-xl border border-blue-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase mb-1">
          Gestión de Actividades
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Breve resumen de lo que hará este apartado de actividades
        </p>

        {/* Barra de Búsqueda */}
        <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-400 text-sm focus:outline-none text-gray-900 bg-white"
              />
            </div>
          <button className="px-6 py-2 bg-gray-200 border border-gray-400 rounded-lg font-bold text-sm text-gray-800 hover:bg-gray-300 transition-colors">
            Buscar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-1 rounded-full border border-gray-400 text-xs font-bold transition-all ${
                filter === cat 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tabla de Actividades */}
        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-lg shadow-blue-100/30">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#1E4D8C] to-[#2A6AB5] text-xs font-bold text-white">
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Categoría</th>
                <th className="p-4 text-center">Duración</th>
                <th className="p-4 text-center">Usos</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act, i) => (
                  <tr key={act.id} className={`border-b border-blue-100 transition-all hover:bg-blue-50/60 ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                    <td className="p-4 font-semibold text-gray-800">{act.nombre}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        act.categoria === 'Respiración' ? 'bg-cyan-100 text-cyan-800' :
                        act.categoria === 'Visualizacion' ? 'bg-violet-100 text-violet-800' :
                        act.categoria === 'Sonidos' ? 'bg-amber-100 text-amber-800' :
                        act.categoria === 'Interaccion' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {act.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-gray-600">{act.duracion || '—'}s</td>
                    <td className="p-4 text-center">
                      {session?.user?.role === 'ADMINISTRADOR' ? (
                        <select
                          value={act.usos}
                          onChange={async (e) => {
                            const newVal = e.target.value;
                            try {
                              const res = await fetch(`/api/actividades/${act.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ usos: newVal }),
                              });
                              if (!res.ok) { setMessage('Error actualizando usos'); }
                              else {
                                setMessage(null);
                                updateActivity(act.id, { usos: newVal as 'asignar' | 'tecnicas' });
                                router.refresh();
                              }
                            } catch (err) { console.error(err); setMessage('Error en la solicitud'); }
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold border-0 cursor-pointer outline-none ring-2 transition ${
                            act.usos === 'tecnicas'
                              ? 'ring-purple-300 bg-purple-50 text-purple-800'
                              : 'ring-blue-300 bg-blue-50 text-blue-800'
                          }`}
                        >
                          <option value="asignar" className="bg-white text-blue-800">Asignar</option>
                          <option value="tecnicas" className="bg-white text-purple-800">Técnicas</option>
                        </select>
                      ) : (
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          act.usos === 'tecnicas' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {act.usos === 'tecnicas' ? 'Técnicas' : 'Asignar'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {session?.user?.role === 'ADMINISTRADOR' ? (
                        <select
                          value={normalizeEstado(act.estado)}
                          onChange={async (e) => {
                            const newVal = e.target.value;
                            const mapToDb = (v: string) => v.toLowerCase() === 'aprobada' ? 'aprobada' : v.toLowerCase() === 'rechazada' ? 'rechazada' : 'pendiente';
                            try {
                              const res = await fetch(`/api/actividades/${act.id}/status`, { method: 'PATCH', body: JSON.stringify({ estado: mapToDb(newVal) }), headers: { 'Content-Type': 'application/json' } });
                              const data = await res.json();
                              if (!res.ok) { setMessage(data.error || 'Error actualizando estado'); }
                              else {
                                setMessage(null);
                                updateActivity(act.id, { estado: normalizeEstado(data.estado || newVal) as Activity['estado'] });
                                router.refresh();
                              }
                            } catch (err) { console.error(err); setMessage('Error en la solicitud'); }
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold border-0 cursor-pointer outline-none ring-2 transition ${
                            normalizeEstado(act.estado) === 'Aprobada'
                              ? 'ring-green-300 bg-green-50 text-green-800'
                              : normalizeEstado(act.estado) === 'Rechazada'
                                ? 'ring-red-300 bg-red-50 text-red-800'
                                : 'ring-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option className="bg-white text-amber-800">Pendiente</option>
                          <option className="bg-white text-green-800">Aprobada</option>
                          <option className="bg-white text-red-800">Rechazada</option>
                        </select>
                      ) : (
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          act.estado === 'Aprobada' ? 'bg-green-100 text-green-800 ring-1 ring-green-200' :
                          act.estado === 'Rechazada' ? 'bg-red-100 text-red-800 ring-1 ring-red-200' :
                          'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                        }`}>
                          {act.estado}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditingActivity(act); setMessage(null); }} className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 hover:text-blue-900" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => {
                          if (isApproved(act.estado)) {
                            setViewingActivity(act);
                          } else {
                            setMessage('Solo actividades aprobadas se pueden ejecutar');
                          }
                        }} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-900" title="Ver">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={async () => {
                          const ok = await confirm({ title: 'Eliminar actividad', description: '¿Eliminar actividad? Esta acción es irreversible.', confirmText: 'Eliminar', cancelText: 'Cancelar' });
                          if (!ok) return;
                          try {
                            const res = await fetch(`/api/actividades/${act.id}`, { method: 'DELETE' });
                            const data = await res.json();
                            if (!res.ok) setMessage(data.error || 'Error eliminando');
                            else {
                              removeActivity(act.id);
                              setMessage(null);
                              router.refresh();
                            }
                          } catch (err) { console.error(err); setMessage('Error en la solicitud'); }
                        }} className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 hover:text-red-900" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-blue-50 p-3">
                        <Search className="h-6 w-6 text-blue-400" />
                      </div>
                      <p className="font-bold text-gray-500">No hay actividades registradas</p>
                      <p className="text-xs text-gray-400">Importa actividades usando los botones de abajo</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones Inferiores */}
      <div className="flex gap-6">
        <button onClick={() => setShowImportModal(true)} className="flex-1 bg-[#D1E7FF] border border-gray-400 p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-200 transition-all group">
          <span className="font-bold uppercase text-sm text-gray-800">Importar Actividades</span>
          <Upload className="h-6 w-6 text-gray-700" />
        </button>
        <button onClick={() => setShowViewModal(true)} className="flex-1 bg-[#D1E7FF] border border-gray-400 p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-200 transition-all group">
          <span className="font-bold uppercase text-sm text-gray-800">Ver Actividades</span>
          <Eye className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black">Importar Actividad</h3>
                <p className="text-sm text-black font-bold">Elige si importas por enlace público o subes un ZIP.</p>
              </div>
              <button onClick={() => { setShowImportModal(false); setMessage(null); }} className="text-black font-bold opacity-90 hover:opacity-100">Cerrar ✕</button>
            </div>

            <div className="p-6 text-black">
              {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{message}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
                  <div className="flex items-center gap-3 mb-2"><span className="text-2xl">🔗</span><strong>Por Enlace</strong></div>
                  <input placeholder="https://..." value={url} onChange={(e)=>setUrl(e.target.value)} className="w-full p-3 border rounded mb-3 text-black font-bold" />
                  <button onClick={async ()=>{
                    if (!url.trim()) { setMessage('Ingresa una URL válida'); return; }
                    setLoading(true); setMessage(null);
                    try {
                      const form = new FormData(); form.append('url', url);
                      const res = await fetch('/api/actividades/import', { method: 'POST', body: form });
                      const data = await res.json();
                      if (!res.ok) setMessage(data.error || 'Error al importar');
                      else { setMessage('Importado'); router.refresh(); setTimeout(()=>{ setShowImportModal(false); setMessage(null); setUrl(''); },700); }
                    } catch (e) { console.error(e); setMessage('Error en la solicitud'); }
                    finally { setLoading(false); }
                  }} className="mt-auto bg-blue-600 text-white p-3 rounded">Importar Enlace</button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
                  <div className="flex items-center gap-3 mb-2"><span className="text-2xl">📦</span><strong>Por Archivo ZIP</strong></div>
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded bg-white relative mb-3" style={{minHeight:120}}>
                    <input type="file" accept=".zip" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-center p-3">{file ? <div className="text-sm text-black font-bold">{file.name}</div> : <div className="text-sm text-slate-400">Haz clic para seleccionar un ZIP</div>}</div>
                  </div>
                  <button onClick={async ()=>{
                    if (!file) { setMessage('Selecciona un archivo ZIP'); return; }
                    setLoading(true); setMessage(null);
                    try {
                      const form = new FormData(); form.append('file', file as any);
                      const res = await fetch('/api/actividades/import', { method: 'POST', body: form });
                      const data = await res.json();
                      if (!res.ok) setMessage(data.error || 'Error al importar');
                      else { setMessage('Importado'); router.refresh(); setTimeout(()=>{ setShowImportModal(false); setMessage(null); setFile(null); },700); }
                    } catch (e) { console.error(e); setMessage('Error en la solicitud'); }
                    finally { setLoading(false); }
                  }} className="mt-auto bg-blue-600 text-white p-3 rounded">Importar ZIP</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-black">{viewingActivity.nombre}</h3>
              <button onClick={() => setViewingActivity(null)} className="text-black font-bold">Cerrar ✕</button>
            </div>
            <div className="p-4">
              <div className="w-full h-96 bg-black">
                <iframe src={viewingActivity.embed_url || ''} title={viewingActivity.nombre} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ver Actividades Modal (solo aprobadas) */}
      {showViewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-auto max-h-[80vh]">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-black">Actividades Aprobadas</h3>
              <button onClick={() => setShowViewModal(false)} className="text-black font-bold">Cerrar ✕</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.filter(a => isApproved(a.estado)).length === 0 && (
                <div className="p-6 text-center text-gray-500 col-span-full">No hay actividades aprobadas</div>
              )}
              {activities.filter(a => isApproved(a.estado)).map(act => (
                <div key={act.id} className="border rounded-lg p-4 flex flex-col bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-blue-50 rounded-md flex items-center justify-center text-2xl text-blue-700 font-bold">{act.nombre?.charAt(0) || 'A'}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{act.nombre}</div>
                      <div className="text-xs text-gray-600 mt-1">{act.descripcion || 'Sin descripción disponible'}</div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-700">
                        <span className="px-2 py-1 bg-blue-50 rounded-full">{act.categoria}</span>
                        <span className="px-2 py-1 bg-green-50 rounded-full">Dur: {act.duracion || '—'}s</span>
                        <span className="px-2 py-1 bg-gray-50 rounded-full">Usos: {act.usos === 'tecnicas' ? 'Técnicas' : 'Asignar'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => { setViewingActivity(act); setShowViewModal(false); }} className="px-3 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition">Abrir</button>
                    {session?.user?.role === 'PSICOLOGO' && (
                      <button onClick={() => { setAssigningActivity(act); setAssignPatientInput(''); setAssignMessage(null); }} className="px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition">Asignar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal (psicologo only) */}
      {assigningActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-black">Asignar: {assigningActivity.nombre}</h3>
              <button onClick={() => setAssigningActivity(null)} className="text-black font-bold">Cerrar ✕</button>
            </div>
                <div className="p-6 text-black space-y-3">
              {assignMessage && <div className="text-sm text-red-600">{assignMessage}</div>}
              <div>
                <label className="block text-sm font-medium text-black font-bold">Paciente (ID o correo)</label>
                <input value={assignPatientInput} onChange={(e)=>setAssignPatientInput(e.target.value)} placeholder="escribe id o correo del paciente" className="w-full p-2 border rounded text-black" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssigningActivity(null)} className="px-4 py-2 bg-gray-100 text-black font-bold rounded">Cancelar</button>
                <button onClick={async ()=>{
                  if (!assignPatientInput.trim()) { setAssignMessage('Ingresa un paciente'); return; }
                  setAssignLoading(true); setAssignMessage(null);
                  try {
                    const res = await fetch(`/api/actividades/${assigningActivity.id}/assign`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ patient: assignPatientInput.trim() }) });
                    const data = await res.json();
                    if (!res.ok) setAssignMessage(data.error || 'Error asignando');
                    else { setAssignMessage('Asignada correctamente'); setTimeout(()=>{ setAssigningActivity(null); },800); }
                  } catch (err) { console.error(err); setAssignMessage('Error en la solicitud'); }
                  finally { setAssignLoading(false); }
                }} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={assignLoading}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-black">Editar Actividad</h3>
              <button onClick={() => setEditingActivity(null)} className="text-black font-bold">Cerrar ✕</button>
            </div>
            <div className="p-6 text-black space-y-3">
              <div>
                <label className="block text-sm font-medium text-black font-bold">Título</label>
                <input id="edit-titulo" defaultValue={editingActivity.nombre} className="w-full p-2 border rounded mb-1 text-black font-bold" />
              </div>

              <div>
                <label className="block text-sm font-medium text-black font-bold">Categoría</label>
                <select id="edit-categoria" defaultValue={editingActivity.categoria} className="w-full p-2 border rounded mb-1 text-black font-bold">
                  {categories.filter(c=>c!=='Todos').map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black font-bold">Duración (s)</label>
                  <input id="edit-duracion" defaultValue={editingActivity.duracion || ''} className="w-full p-2 border rounded text-black font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black font-bold">Usos</label>
                  <select id="edit-usos" defaultValue={editingActivity.usos || 'asignar'} className="w-full p-2 border rounded text-black font-bold">
                    <option value="asignar">Asignar</option>
                    <option value="tecnicas">Técnicas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black font-bold">Estado</label>
                  <select id="edit-estado" defaultValue={editingActivity.estado} className="w-full p-2 border rounded text-black font-bold">
                    <option>Pendiente</option>
                    <option>Aprobada</option>
                    <option>Rechazada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black font-bold">Embed URL</label>
                <input id="edit-embed" defaultValue={(editingActivity as any).embed_url || ''} className="w-full p-2 border rounded mb-1 text-black font-bold" />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingActivity(null)} className="px-4 py-2 bg-gray-100 text-black font-bold rounded">Cancelar</button>
                <button onClick={async () => {
                  const titulo = (document.getElementById('edit-titulo') as HTMLInputElement).value;
                  const categoria = (document.getElementById('edit-categoria') as HTMLSelectElement).value;
                  const duracion = (document.getElementById('edit-duracion') as HTMLInputElement).value;
                  const usos = (document.getElementById('edit-usos') as HTMLSelectElement).value;
                  const estado = (document.getElementById('edit-estado') as HTMLSelectElement).value;
                  const embed = (document.getElementById('edit-embed') as HTMLInputElement).value;
                  try {
                    const body = { titulo, categoria, duracion, usos, estado, embed_url: embed };
                    const res = await fetch(`/api/actividades/${editingActivity.id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
                    const data = await res.json();
                    if (!res.ok) { setMessage(data.error || 'Error actualizando'); }
                    else {
                      setEditingActivity(null);
                      updateActivity(editingActivity.id, {
                        nombre: titulo,
                        categoria: categoria as Activity['categoria'],
                        duracion,
                        usos: usos as 'asignar' | 'tecnicas',
                        estado: normalizeEstado(estado) as Activity['estado'],
                        embed_url: embed,
                      });
                      setMessage(null);
                      router.refresh();
                    }
                  } catch (err) { console.error(err); setMessage('Error en la solicitud'); }
                }} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}