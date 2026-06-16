'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Palette, X, Calendar, ClipboardList, Clock, CheckCircle2, ArrowUpRight, ListChecks, FileEdit, Bell, CircleAlert, ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import {
  HeroSection,
  InformateSection,
  RecursosSection,
} from '@/presentation/components/home';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';

type AppointmentItem = {
  id: string;
  fecha: string;
  hora: string;
  modalidad: string;
  psicologoName?: string;
  status: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';
};

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'citas', label: 'Citas' },
  { id: 'tareas', label: 'Mis tareas' },
  { id: 'informacion', label: 'Información' },
  { id: 'recursos', label: 'Recursos' },
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
  const router = useRouter();
  const { data: session, status } = useSession();

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

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const now = useMemo(() => new Date(), [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.status !== 'Cancelada' && parseDateTime(item.fecha, item.hora) >= now)
      .sort((a, b) => parseDateTime(a.fecha, a.hora).getTime() - parseDateTime(b.fecha, b.hora).getTime());
  }, [appointments, now]);

  const nextAppointment = upcomingAppointments[0] ?? null;
  const pendingCount = appointments.filter((item) => item.status === 'Pendiente').length;
  const acceptedCount = appointments.filter((item) => item.status === 'Aceptada').length;
  const canceledCount = appointments.filter((item) => item.status === 'Cancelada').length;
  const totalCount = appointments.length;

  const SECTION_HEIGHT = 'min-h-[calc(100dvh-72px)]';

  if (!session || status === 'loading') {
    return null;
  }

  return (
    <div className="flex flex-col bg-slate-50">
      <div className="sticky top-0 z-30 flex justify-center px-4 pt-3 pb-2 bg-white/85 backdrop-blur-md">
        <div className="inline-flex gap-2 rounded-full bg-gradient-to-r from-sky-600/80 to-sky-700/80 px-3 py-2 shadow-lg shadow-black/15 border border-white/20">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(i)}
              className={`rounded-full px-5 py-2 text-base font-semibold tracking-wide transition-all duration-300 ${activeIndex === i
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
          <section className={`min-w-full bg-white/85 flex flex-col ${SECTION_HEIGHT}`}>
            <HeroSection variant="patient" />
            <div className="flex-1 min-h-4" />
          </section>

          <section className={`min-w-full bg-white/85 flex flex-col ${SECTION_HEIGHT}`}>
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
              <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Agendar citas</h2>
              <div className="h-1 w-32 bg-[#71A5D9] rounded-full mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border-2 border-[#71A5D9] bg-white p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-blue-100 p-3">
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

                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-amber-100 p-3">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendiente de aprobar</p>
                      <p className="text-3xl font-black text-amber-800">{pendingCount}</p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700">Esperando confirmación del psicólogo</p>
                </div>

                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-emerald-100 p-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Aceptadas</p>
                      <p className="text-3xl font-black text-emerald-800">{acceptedCount}</p>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700">Citas confirmadas por el psicólogo</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-slate-100 p-3">
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

          <section className={`min-w-full bg-white/85 flex flex-col ${SECTION_HEIGHT}`}>
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
              <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Mis tareas</h2>
              <div className="h-1 w-32 bg-[#71A5D9] rounded-full mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-2xl border-2 border-[#71A5D9] bg-white p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-blue-100 p-3">
                      <ClipboardList className="h-6 w-6 text-[#1E4D8C]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total de tareas</p>
                      <p className="text-3xl font-black text-[#1E4D8C]">12</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Todas tus tareas asignadas</p>
                </div>

                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-amber-100 p-3">
                      <FileEdit className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendientes</p>
                      <p className="text-3xl font-black text-amber-800">5</p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700">Tareas por realizar</p>
                </div>

                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-emerald-100 p-3">
                      <ListChecks className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Completadas</p>
                      <p className="text-3xl font-black text-emerald-800">7</p>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700">Tareas finalizadas con éxito</p>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 rounded-xl border border-[#71A5D9]/40 p-4">
                <p className="text-sm text-slate-600 text-center">
                  <strong className="text-[#1E4D8C]">Progreso:</strong> 7 de 12 tareas completadas (58%)
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-white overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: '58%' }} />
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/paciente/tareas"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#71A5D9] text-white font-bold text-lg rounded-xl hover:bg-[#1E4D8C] shadow-xl transition"
                >
                  <ClipboardList className="h-5 w-5" /> Ir a Mis tareas
                </Link>
              </div>
            </div>
            <div className="flex-1 min-h-4" />
          </section>

          <section className={`min-w-full bg-white/85 flex flex-col ${SECTION_HEIGHT}`}>
            <InformateSection />
            <div className="flex-1 min-h-4" />
          </section>

          <section className={`min-w-full bg-white/85 flex flex-col ${SECTION_HEIGHT}`}>
            <RecursosSection transparent />
            <div className="flex-1 min-h-4" />
          </section>
        </div>
      </div>

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
  );
}
