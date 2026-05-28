"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import { ArrowLeft } from 'lucide-react';
import { scrollToTop } from '@/presentation/utils/scrollWithOffset';

export default function TareasPage() {
  const [activeSection, setActiveSection] = useState('tareas');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loadingAsign, setLoadingAsign] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<any | null>(null);
  const [currentIntentoId, setCurrentIntentoId] = useState<string | null>(null);

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
              // Close the modal automatically as requested
              handleCloseAsignacion();
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

  const handleVolver = () => {
    router.push('/dashboard/paciente');
    setTimeout(() => scrollToTop(), 150);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <PatientHeader
        activeSection={activeSection}
        onNavClick={setActiveSection}
        userName={session?.user?.name || 'Paciente'}
        userRole={session?.user?.role || 'ESTUDIANTE'}
      />
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6">
            <button
              onClick={handleVolver}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1E4D8C] font-semibold rounded-lg shadow-sm border border-[#71A5D9] hover:bg-[#71A5D9] hover:text-white transition"
            >
              <ArrowLeft size={18} /> Volver a Inicio
            </button>
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
              <div className="grid grid-cols-1 gap-4 mt-4">
                {asignaciones.map(a => (
                  <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{a.titulo || 'Actividad'}</div>
                        <div className="text-sm text-gray-600">{a.descripcion || ''}</div>
                        <div className="text-xs text-gray-500 mt-2">Estado: {a.estado}</div>
                        {a.instrucciones_psicologo && <div className="mt-2 text-sm text-gray-700">Instrucciones: {a.instrucciones_psicologo}</div>}
                        {a.fecha_limite && <div className="mt-1 text-xs text-red-600">Fecha límite: {new Date(a.fecha_limite).toLocaleString()}</div>}
                      </div>
                      <div className="flex flex-col gap-2">
                        {a.embed_url ? (
                          <button onClick={() => handleOpenAsignacion(a)} className="px-3 py-2 bg-green-600 text-white rounded">Abrir</button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Modal to open assigned activity */}
          {selectedAsignacion && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl md:max-w-6xl overflow-hidden flex flex-col max-h-[92vh] border border-[#71A5D9]">
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
                <div className="flex-1 p-0 overflow-hidden relative">
                  {selectedAsignacion.embed_url ? (
                    <div className="w-full h-[78vh] bg-white overflow-y-auto">
                      <iframe 
                        src={getIframeUrl()} 
                        title={selectedAsignacion.titulo} 
                        className="w-full h-full border-0" 
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
    </div>
  );
}
