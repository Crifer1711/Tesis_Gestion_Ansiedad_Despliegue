"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import { scrollToTop } from '@/presentation/utils/scrollWithOffset';
import { EmotionWheelModal, type Emocion } from '@/presentation/components/patient/EmotionWheelModal';
// 1. Agregamos ArrowLeft a lucide-react
import { CheckCircle2, ChevronDown, ChevronUp, ArrowLeft, Home } from 'lucide-react'; 
// 2. Importamos Link
import Link from 'next/link';

export default function TareasPage() {
  const [activeSection, setActiveSection] = useState('tareas');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loadingAsign, setLoadingAsign] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<any | null>(null);
  const [currentIntentoId, setCurrentIntentoId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Estado para la rueda de emociones post-actividad
  const [showEmotionWheel, setShowEmotionWheel] = useState(false);
  const [completedIntentoId, setCompletedIntentoId] = useState<string | null>(null);
  const [completedActividadNombre, setCompletedActividadNombre] = useState<string>('');

  // Load asignaciones from the database
  const loadAsign = useCallback(async () => {
    if (status === 'authenticated' && session) {
      setLoadingAsign(true);
      try {
        const res = await fetch('/api/paciente/asignaciones');
        const data = await res.json();
        if (res.ok && data.success) setAsignaciones(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAsign(false);
      }
    }
  }, [status, session]);

  // Initial load
  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    loadAsign();
  }, [status, router, loadAsign]);

  // Listen for iframe postMessage events to save student interactions and completion
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      const { type } = data;
      if (type === 'BIENESTAR_ACTIVIDAD_INTERACCION' || type === 'BIENESTAR_ACTIVIDAD_COMPLETADA') {
        console.log('Evento de bienestar recibido:', data);

        // Deduce a fallback activity slug from selectedAsignacion or url if missing
        const pathPartsStr = (selectedAsignacion?.embed_url || '').split('/');
        const fallbackSlug = pathPartsStr[pathPartsStr.length - 1] || 'actividad';

        // Normalize fields (accept both snake_case, camelCase or alternate names, with robust fallbacks)
        const normalizedData = {
          type,
          intento_id: data.intento_id ?? data.intentoId ?? currentIntentoId,
          actividad_slug: data.actividad_slug ?? data.actividadSlug ?? data.actividad ?? fallbackSlug,
          estudiante_id: data.estudiante_id ?? data.estudianteId ?? (session?.user?.id ? Number(session.user.id) : undefined),
          asignacion_id: data.asignacion_id ?? data.asignacionId ?? selectedAsignacion?.id,
          entrada_estudiante: data.entrada_estudiante ?? data.entradaEstudiante ?? (data.entrada ? JSON.stringify(data.entrada) : undefined),
          respuesta_ia: data.respuesta_ia ?? data.respuestaIa ?? data.respuesta ?? data.iaResponse ?? data.ia_response ?? null,
          duracion_segundos: data.duracion_segundos ?? data.duracionSegundos ?? data.duracion ?? null,
          resumen: data.resumen ?? null,
          completed_at: data.completed_at ?? data.completedAt ?? data.timestamp ?? new Date().toISOString()
        };

        // If student entry is missing but individual fields are present (runs for all event types)
        if (!normalizedData.entrada_estudiante) {
          const possibleInput = {
            pensamiento: data.pensamiento ?? data.thought,
            situacion: data.situacion ?? data.situation,
            entrada: data.entrada
          };
          if (possibleInput.pensamiento || possibleInput.situacion) {
            normalizedData.entrada_estudiante = JSON.stringify(possibleInput);
          }
        }

        console.log('Datos normalizados para enviar al backend:', normalizedData);

        if (!normalizedData.intento_id) {
          console.error('No se pudo determinar el intento_id para el evento');
          return;
        }

        try {
          const res = await fetch('/api/actividades/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalizedData),
          });
          const result = await res.json();
          if (res.ok && result.success) {
            console.log('Evento guardado en base de datos exitosamente:', result.data);
            if (type === 'BIENESTAR_ACTIVIDAD_COMPLETADA') {
              // Reload task list to show updated state
              loadAsign();
              // Close the activity modal
              handleCloseAsignacion();
              // Show the emotion wheel so the patient can rate how they felt
              setCompletedIntentoId(normalizedData.intento_id ?? null);
              setCompletedActividadNombre(selectedAsignacion?.titulo || 'la actividad');
              setShowEmotionWheel(true);
            }
          } else {
            console.error('Error al guardar el evento en el backend:', result.error);
          }
        } catch (err) {
          console.error('Error de red al registrar el evento:', err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loadAsign, currentIntentoId, selectedAsignacion, session]);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  const handleOpenAsignacion = (asignacion: any) => {
    // Generate a unique Attempt ID for this session
    const newIntentoId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    setCurrentIntentoId(newIntentoId);
    setSelectedAsignacion(asignacion);
  };

  const handleCloseAsignacion = () => {
    setSelectedAsignacion(null);
    setCurrentIntentoId(null);
  };

  const handleEmotionConfirm = async (emocion: Emocion) => {
    setShowEmotionWheel(false);
    if (!completedIntentoId) return;
    try {
      const res = await fetch('/api/actividades/events/resumen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intento_id: completedIntentoId,
          emocion: emocion.nombre,
          categoria: emocion.categoria,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        console.log('Emoción guardada en resumen:', emocion);
      } else {
        console.error('Error al guardar emoción:', result.error);
      }
    } catch (err) {
      console.error('Error de red al guardar emoción:', err);
    } finally {
      setCompletedIntentoId(null);
    }
  };

  const handleEmotionSkip = () => {
    setShowEmotionWheel(false);
    setCompletedIntentoId(null);
  };

  const getIframeUrl = () => {
    if (!selectedAsignacion || !selectedAsignacion.embed_url) return '';
    try {
      const urlObj = new URL(selectedAsignacion.embed_url, window.location.origin);
      if (currentIntentoId) {
        urlObj.searchParams.set('intento_id', currentIntentoId);
        urlObj.searchParams.set('intentoId', currentIntentoId);
      }
      if (session?.user?.id) {
        urlObj.searchParams.set('estudiante_id', String(session.user.id));
        urlObj.searchParams.set('estudianteId', String(session.user.id));
      }
      if (selectedAsignacion.id) {
        urlObj.searchParams.set('asignacion_id', selectedAsignacion.id);
        urlObj.searchParams.set('asignacionId', selectedAsignacion.id);
      }
      // Deduce activity slug from url path (e.g. /embed/pensamientos -> pensamientos)
      const pathParts = urlObj.pathname.split('/');
      const slug = pathParts[pathParts.length - 1] || 'actividad';
      urlObj.searchParams.set('actividad_slug', slug);
      urlObj.searchParams.set('actividadSlug', slug);
      urlObj.searchParams.set('actividad', slug);

      return urlObj.toString();
    } catch (e) {
      console.error('Error constructing iframe URL:', e);
      return selectedAsignacion.embed_url;
    }
  };

  const assignedTasks = asignaciones.filter((task) => String(task.estado || '').toLowerCase() !== 'completada');
  const completedTasks = asignaciones.filter((task) => String(task.estado || '').toLowerCase() === 'completada');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <PatientHeader
        activeSection={activeSection}
        onNavClick={setActiveSection}
        userName={session?.user?.name || 'Paciente'}
        userRole={session?.user?.role || 'ESTUDIANTE'}
      />
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BOTÓN DE REGRESO AQUÍ */}
          <div className="mb-6">
            <Link 
              href="/dashboard/paciente" 
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1d42fb] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#D95536] hover:shadow-lg"
            >
              <Home size={18} />
              Volver al Inicio
            </Link>
          </div>

          <h1 className="text-4xl font-black text-[#1E4D8C] mb-4">Mis Tareas</h1>
          <p className="text-slate-700 leading-relaxed mb-6">
            Aquí se muestran las actividades, ejercicios o tareas que tu psicólogo te haya asignado para acompañar tu proceso. Podrás abrir cada actividad, revisar sus instrucciones, ver su estado y la fecha límite, y completar el contenido desde esta misma pantalla. Si tu psicólogo aún no te ha asignado tareas, verás el aviso de que no tienes asignaciones disponibles.
          </p>
          <div className="mt-6">
            {loadingAsign ? (
              <div className="text-sm text-gray-600">Cargando asignaciones...</div>
            ) : asignaciones.length === 0 ? (
              <div className="text-sm text-gray-600 mt-3">No tienes tareas asignadas.</div>
            ) : (
              <div className="space-y-6 mt-4">
                <section className="rounded-2xl border border-[#71A5D9] bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-black text-[#1E4D8C]">Tareas asignadas</h2>
                    <span className="text-xs font-bold uppercase text-slate-500">{assignedTasks.length} visibles</span>
                  </div>
                  {assignedTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-5 text-sm text-slate-600">
                      No tienes tareas asignadas pendientes.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {assignedTasks.map(a => (
                        <div key={a.id} className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm transition hover:shadow-md">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="font-black text-[#1E4D8C] text-lg">{a.titulo || 'Actividad'}</div>
                              <div className="text-sm text-slate-600 mt-1">{a.descripcion || ''}</div>
                              <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-bold uppercase">
                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">Estado: {a.estado}</span>
                                {a.fecha_limite && <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Límite: {new Date(a.fecha_limite).toLocaleString()}</span>}
                              </div>
                              {a.instrucciones_psicologo && <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">{a.instrucciones_psicologo}</div>}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {a.embed_url ? (
                                <button onClick={() => handleOpenAsignacion(a)} className="rounded-xl bg-[#1E4D8C] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#173d6f]">
                                  Abrir
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-300 bg-slate-100/80 p-4 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowCompleted((value) => !value)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-200 px-4 py-3 text-left"
                  >
                    <div>
                      <h2 className="text-lg font-black text-slate-700">Tareas realizadas</h2>
                    </div>
                    {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {showCompleted && (
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      {completedTasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                          Todavía no has completado tareas.
                        </div>
                      ) : (
                        completedTasks.map(a => (
                          <div key={a.id} className="rounded-2xl border border-slate-400 bg-slate-800/90 p-4 text-slate-100 shadow-sm opacity-90">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-lg font-black">
                                  <CheckCircle2 size={18} className="text-emerald-300" />
                                  {a.titulo || 'Actividad'}
                                </div>
                                <div className="text-sm text-slate-300 mt-1">{a.descripcion || ''}</div>
                                <div className="mt-3 text-[11px] font-bold uppercase text-slate-300">Realizada</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
          {/* Modal to open assigned activity */}
          {selectedAsignacion && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl md:max-w-6xl overflow-y-auto flex flex-col max-h-[92vh] border border-[#71A5D9]">
                <div className="bg-[#D1E7FF] text-gray-800 px-6 py-4 flex items-center justify-between border-b border-[#71A5D9] flex-shrink-0">
                  <h3 className="font-bold text-lg text-[#1E4D8C]">{selectedAsignacion.titulo || 'Actividad'}</h3>
                  <button 
                    onClick={handleCloseAsignacion} 
                    className="text-[#1E4D8C] hover:bg-blue-100 p-2 rounded-full font-bold transition flex items-center justify-center w-8 h-8"
                    aria-label="Cerrar modal"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 p-0 relative">
                  {selectedAsignacion.embed_url ? (
                    <div className="w-full h-[82vh] bg-white overflow-y-auto">
                      <iframe 
                        src={getIframeUrl()} 
                        title={selectedAsignacion.titulo} 
                        className="w-full h-full min-h-[82vh] border-0" 
                        allow="geolocation; microphone; camera; midi; encrypted-media; xr-spatial-tracking"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-600 font-semibold">No hay contenido embebido disponible para esta actividad.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rueda de emociones post-actividad */}
      {showEmotionWheel && (
        <EmotionWheelModal
          actividadNombre={completedActividadNombre}
          onConfirm={handleEmotionConfirm}
          onSkip={handleEmotionSkip}
        />
      )}
    </div>
  );
}