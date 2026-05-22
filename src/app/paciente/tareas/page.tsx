"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // load asignaciones when mounted and authenticated
    (async function loadAsign() {
      if (status === 'authenticated' && session) {
        setLoadingAsign(true);
        try {
          const res = await fetch('/api/paciente/asignaciones');
          const data = await res.json();
          if (res.ok && data.success) setAsignaciones(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoadingAsign(false); }
      }
    })();
  }, [status, router]);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  const handleVolver = () => {
    router.push('/dashboard/paciente');
    setTimeout(() => scrollToTop(), 150);
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
          <h1 className="text-4xl font-black text-[#1E4D8C] mb-8">Mis Tareas</h1>
          <p className="text-lg text-slate-700">Las tareas asignadas por tu psicólogo aparecerán aquí.</p>
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
                          <button onClick={() => setSelectedAsignacion(a)} className="px-3 py-2 bg-green-600 text-white rounded">Abrir</button>
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
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
                <div className="bg-[#D1E7FF] text-gray-800 px-6 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-black">{selectedAsignacion.titulo || 'Actividad'}</h3>
                  <button onClick={() => setSelectedAsignacion(null)} className="text-black font-bold">Cerrar ✕</button>
                </div>
                <div className="p-4">
                  {selectedAsignacion.embed_url ? (
                    <div className="w-full h-[60vh] bg-black">
                      <iframe src={selectedAsignacion.embed_url} title={selectedAsignacion.titulo} className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-600">No hay contenido embebido disponible para esta actividad.</div>
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
