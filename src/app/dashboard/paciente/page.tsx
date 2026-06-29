'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Palette, X, Calendar, ClipboardList, Clock, CheckCircle2, ArrowUpRight, ListChecks, FileEdit, Bell, CircleAlert, ArrowRight, CalendarDays, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  HeroSection,
  InformateSection,
  RecursosSection,
} from '@/presentation/components/home';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import PacienteAnsiedadPage from '@/app/paciente/ansiedad/page';
import PacienteSaludMentalPage from '@/app/paciente/salud-mental/page';
import PacienteTestPage from '@/app/paciente/test/page';
import PacienteBibliotecaPage from '@/app/paciente/biblioteca/page';
import PacienteVideosPage from '@/app/paciente/videos/page';

type AppointmentItem = {
  id: string;
  fecha: string;
  hora: string;
  modalidad: string;
  psicologoName?: string;
  status: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';
};

type ModalView = 'ansiedad' | 'salud-mental' | 'analisis' | 'biblioteca' | 'videos' | null;

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'informacion', label: 'Información' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'actividades', label: 'Actividades' },
  { id: 'citas', label: 'Citas' },
];

const parseDateTime = (fecha: string, hora: string) => {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hour, minute] = hora.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
};

const formatDateTime = (fecha: string, hora: string) => {
  try {
    return parseDateTime(fecha, hora).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return fecha;
  }
};

export default function PatientPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [modalView, setModalView] = useState<ModalView>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const sections: { id: ModalView; label: string; component: React.ReactNode }[] = [
    { id: 'ansiedad', label: 'Ansiedad', component: <PacienteAnsiedadPage /> },
    { id: 'salud-mental', label: 'Salud mental', component: <PacienteSaludMentalPage /> },
    { id: 'analisis', label: 'Análisis personal', component: <PacienteTestPage /> },
    { id: 'biblioteca', label: 'Biblioteca', component: <PacienteBibliotecaPage /> },
    { id: 'videos', label: 'Videos educativos', component: <PacienteVideosPage /> },
  ];

  const currentIndex = sections.findIndex(s => s.id === modalView);
  const currentSection = modalView ? sections[currentIndex] : null;

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!modalView) return;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % sections.length 
      : (currentIndex - 1 + sections.length) % sections.length;
    setModalView(sections[newIndex].id as ModalView);
  };

  const handleNavClick = useCallback((index: number) => {
    setActiveIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchAppointments = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoadingAppointments(true);
    try {
      const response = await fetch(`/api/appointments?patientId=${session.user.id}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('No se pudieron cargar tus citas');
      }

      const data = await response.json();
      const mapped: AppointmentItem[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id,
            fecha: item.fecha,
            hora: item.hora,
            modalidad: item.modalidad,
            psicologoName: item.psychologistName || 'Psicólogo',
            status: item.status,
          }))
        : [];
      setAppointments(mapped);
    } catch (error) {
      console.error('Error cargando citas del paciente:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [session?.user?.id]);

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingTasks(true);
    try {
      const response = await fetch('/api/paciente/asignaciones', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudieron cargar las tareas');
      const data = await response.json();
      setTasks(data.data ?? []);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchAppointments();
    fetchTasks();
    // ✅ AUMENTAR EL INTERVALO A 30 SEGUNDOS (en lugar de 5)
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments, fetchTasks]);

  // ✅ USAR useMemo CON DEPENDENCIAS CORRECTAS
  const now = useMemo(() => new Date(), []);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.status !== 'Cancelada' && parseDateTime(item.fecha, item.hora) >= now)
      .sort((a, b) => parseDateTime(a.fecha, a.hora).getTime() - parseDateTime(b.fecha, b.hora).getTime());
  }, [appointments, now]);

  const nextAppointment = useMemo(() => upcomingAppointments[0] ?? null, [upcomingAppointments]);
  const pendingCount = useMemo(() => appointments.filter((item) => item.status === 'Pendiente').length, [appointments]);
  const acceptedCount = useMemo(() => appointments.filter((item) => item.status === 'Aceptada').length, [appointments]);
  const canceledCount = useMemo(() => appointments.filter((item) => item.status === 'Cancelada').length, [appointments]);
  const totalCount = useMemo(() => appointments.length, [appointments]);

  const taskTotal = useMemo(() => tasks.length, [tasks]);
  const taskPending = useMemo(() => tasks.filter((t) => t.estado === 'asignada' || t.estado === 'en_progreso').length, [tasks]);
  const taskCompleted = useMemo(() => tasks.filter((t) => t.estado === 'completada').length, [tasks]);
  const taskProgress = useMemo(() => taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0, [taskTotal, taskCompleted]);

  const SECTION_HEIGHT = 'min-h-[calc(100dvh-72px)]';

  if (!session) {
    return null;
  }

  return (
    <>
      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col bg-white/85">
        <PatientHeader
          activeSection="inicio"
          onNavClick={() => {}}
          userName={session?.user?.name || 'Paciente'}
          userRole={session?.user?.role || 'PACIENTE'}
          isModalOpen={!!modalView}
        />

        <div className="sticky top-0 z-30 flex justify-center px-4 pt-3 pb-2">
          <div className="inline-flex gap-2 rounded-full bg-gradient-to-r from-sky-600/80 to-sky-700/80 px-3 py-2 shadow-lg shadow-black/15 border border-white/20">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(i)}
                className={`rounded-full px-5 py-2 text-base font-semibold tracking-wide transition-all duration-300 ${
                  activeIndex === i
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/15 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {/* SECCIÓN 1: INICIO */}
            <section className={`min-w-full flex flex-col ${SECTION_HEIGHT}`}>
              <HeroSection variant="patient" onNavigate={handleNavClick} />
              <div className="flex-1 min-h-4" />
            </section>

            {/* SECCIÓN 2: INFORMACIÓN */}
            <section className={`min-w-full flex flex-col ${SECTION_HEIGHT}`}>
              <div className="max-w-7xl mx-auto px-6 pt-6 pb-8 md:pb-10 w-full">
                <InformateSection 
                  description=""
                  onSectionClick={(section) => {
                    setModalView(section as ModalView);
                  }}
                />
              </div>
              <div className="flex-1 min-h-4" />
            </section>

            {/* SECCIÓN 3: RECURSOS */}
            <section className={`min-w-full flex flex-col ${SECTION_HEIGHT}`}>
              <div className="max-w-7xl mx-auto px-6 pt-6 pb-8 md:pb-10 w-full">
                <RecursosSection 
                  transparent 
                  onSectionClick={(section) => {
                    if (section === 'biblioteca') setModalView('biblioteca');
                    else if (section === 'videos') setModalView('videos');
                  }}
                />
              </div>
              <div className="flex-1 min-h-4" />
            </section>

            {/* SECCIÓN 4: ACTIVIDADES */}
            {/* SECCIÓN 4: ACTIVIDADES */}
            <section className={`min-w-full flex flex-col ${SECTION_HEIGHT}`}>
              <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Actividades</h2>
                <div className="h-1 w-32 bg-[#71A5D9] rounded-full mb-8" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TARJETA MORADA: Siempre visible */}
                  <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/80 p-6 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-purple-100 p-3">
                        <ClipboardList className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Técnicas rápidas</p>
                        <p className="text-lg font-black text-purple-800">Ejercicios para el manejo de ansiedad</p>
                      </div>
                    </div>
                    <p className="text-sm text-purple-700">Encuentra actividades para la gestión de ansiedad en momentos de tensión.</p>
                    <div className="mt-4">
                      <Link
                        href="/tecnicas-rapidas"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                      >
                        Ir a Actividades <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* TARJETA VERDE: Solo visible si tiene citas (totalCount > 0) */}
                  {totalCount > 0 && (
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="rounded-xl bg-emerald-100 p-3">
                            <CalendarDays className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Tareas</p>
                            <p className="text-lg font-black text-emerald-800">Mis tareas</p>
                          </div>
                        </div>
                        <p className="text-sm text-emerald-700 mb-5">
                          Aquí encontrarás los ejercicios y actividades que tu psicóloga ha preparado para ti. Recuerda completarlos siguiendo las indicaciones de tu sesión.
                        </p>
                      </div>
                      
                      {/* NUEVO BOTÓN PARA MIS TAREAS */}
                      <div>
                        <Link 
                          href="/paciente/tareas" 
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
                        >
                          Ir a Mis Tareas
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
              <div className="flex-1 min-h-4" />
            </section>
            {/* SECCIÓN 5: CITAS */}
            <section className={`min-w-full flex flex-col ${SECTION_HEIGHT}`}>
              <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Citas</h2>
                <div className="h-1 w-32 bg-[#71A5D9] rounded-full mb-8" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {/* Tarjeta 1: Próxima cita */}
                  <div className="rounded-2xl border-2 border-[#71A5D9] bg-white p-4 md:p-6 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-blue-100 p-3 shrink-0">
                        <Calendar className="h-6 w-6 text-[#1E4D8C]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Próxima cita</p>
                        <p className="text-lg font-black text-[#1E4D8C]">
                          {loadingAppointments ? 'Cargando...' : nextAppointment ? `${formatDateTime(nextAppointment.fecha, nextAppointment.hora)}, ${nextAppointment.hora}` : 'Sin citas programadas'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      {loadingAppointments ? 'Actualizando tu agenda...' : nextAppointment
                        ? `${nextAppointment.psicologoName || 'Psicólogo'} — ${nextAppointment.modalidad}`
                        : 'Cuando agendes una nueva cita, aparecerá aquí automáticamente.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Actualizado</span>
                      {nextAppointment && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {nextAppointment.modalidad}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 2: Pendientes */}
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 md:p-6 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-amber-100 p-3 shrink-0">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendiente de aprobar</p>
                        <p className="text-3xl font-black text-amber-800">{pendingCount}</p>
                      </div>
                    </div>
                    <p className="text-sm text-amber-700">Esperando confirmación del psicólogo</p>
                  </div>

                  {/* Tarjeta 3: Aceptadas */}
                  <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-4 md:p-6 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-emerald-100 p-3 shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Aceptadas</p>
                        <p className="text-3xl font-black text-emerald-800">{acceptedCount}</p>
                      </div>
                    </div>
                    <p className="text-sm text-emerald-700">Citas confirmadas por el psicólogo</p>
                  </div>

                  {/* Tarjeta 4: Total */}
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-4 md:p-6 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-slate-100 p-3 shrink-0">
                        <CalendarDays className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total de citas</p>
                        <p className="text-3xl font-black text-slate-700">{totalCount}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      {canceledCount > 0 ? `${canceledCount} cita(s) canceladas en tu historial` : 'Tus citas registradas se muestran aquí'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/paciente/citas"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#71A5D9] text-white font-bold text-lg rounded-xl hover:bg-[#1E4D8C] shadow-xl transition"
                  >
                    <Calendar className="h-5 w-5" /> Ir a Agendar citas
                  </Link>
                </div>
              </div>
              <div className="flex-1 min-h-4" />
            </section>
          </div>
        </div>

        {/* ACCESIBILIDAD */}
        <div className="fixed bottom-8 left-8 z-40 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-white/80 bg-slate-800/60 px-2 py-0.5 rounded-full backdrop-blur-sm">Accesibilidad</span>
          <button
            type="button"
            onClick={() => setIsAccessibilityOpen(true)}
            aria-label="Abrir opciones de accesibilidad"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-xl transition-all hover:bg-sky-400 hover:scale-105"
          >
            <Palette className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>

        {isAccessibilityOpen && (
          <div className="fixed inset-0 z-[60]">
            <button
              type="button"
              aria-label="Cerrar opciones de accesibilidad"
              onClick={() => setIsAccessibilityOpen(false)}
              className="absolute inset-0 bg-black/55"
            />
            <aside className="relative h-full w-full max-w-sm overflow-y-auto border-r border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Accesibilidad</h2>
                <button
                  type="button"
                  onClick={() => setIsAccessibilityOpen(false)}
                  aria-label="Cerrar panel"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <AccessibilityPanel />
            </aside>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalView && currentSection && (
        <div className="fixed inset-0 z-[99999] bg-white overflow-y-auto">
          <div className="min-h-screen">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
              <button
                onClick={() => setModalView(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E4D8C] text-white font-bold hover:bg-[#163B6B] transition shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('prev')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <span className="text-xs font-bold text-slate-400 px-1">
                  {currentIndex + 1}/{sections.length}
                </span>
                <button
                  onClick={() => handleNavigate('next')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1E4D8C] text-white font-medium hover:bg-[#163B6B] transition"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              {currentSection.component}
            </div>
          </div>
        </div>
      )}
    </>
  );
}