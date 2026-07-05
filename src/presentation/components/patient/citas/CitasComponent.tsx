'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AppointmentBookingForm } from './AppointmentBookingForm';
import { AppointmentListPanel } from './AppointmentListPanel';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import type { AppointmentApiItem, AppointmentFormData, AppointmentTab, Cita, HistoryFilter, Psicologo } from './types';
import { countWords, getAppointmentDateTime, getLocalDateString, MAX_MOTIVO_WORDS, normalizeAppointmentStatus } from './utils';

const APPOINTMENTS_POLL_INTERVAL_MS = 30000;

export function CitasComponent() {
  // ✅ Agregar 'update' del hook useSession
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState<AppointmentFormData>({
    psicologo: '',
    fecha: '',
    hora: '',
    modalidad: 'Presencial',
    motivo: '',
  });

  const [citasAgendadas, setCitasAgendadas] = useState<Cita[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<AppointmentTab>('proximas');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('Todas');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isPsychologistMenuOpen, setIsPsychologistMenuOpen] = useState(false);
  const psychologistSelectRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const today = now ? getLocalDateString(now) : '';
  const motivoWords = countWords(formData.motivo);
  const selectedPsychologistName = psicologos.find((p) => p.id === formData.psicologo)?.name || '';

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const isHoraPasada = (fecha: string, hora: string) => {
    if (!fecha || !hora || !now) {
      return false;
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const [hour] = hora.split(':').map(Number);
    const slot = new Date(year, month - 1, day, hour, 0, 0, 0);
    return slot < now;
  };

  const isAppointmentUpcoming = (cita: Cita) => {
    if (!now) return false;
    const dt = getAppointmentDateTime(cita.fecha, cita.hora);
    return dt >= now && cita.estado !== 'Cancelada' && cita.estado !== 'Rechazada';
  };

  const horaSeleccionadaInvalida =
    Boolean(formData.fecha && formData.hora) &&
    (horasOcupadas.includes(formData.hora) || isHoraPasada(formData.fecha, formData.hora));

  const upcomingAppointments = citasAgendadas
    .filter(isAppointmentUpcoming)
    .sort((a, b) => getAppointmentDateTime(a.fecha, a.hora).getTime() - getAppointmentDateTime(b.fecha, b.hora).getTime());

  const historyAppointments = citasAgendadas
    .filter((cita) => cita.estado === 'Cancelada' || cita.estado === 'Aceptada')
    .filter((cita) => historyFilter === 'Todas' || cita.estado === historyFilter)
    .sort((a, b) => getAppointmentDateTime(b.fecha, b.hora).getTime() - getAppointmentDateTime(a.fecha, a.hora).getTime());

  useEffect(() => {
    // Establece la hora inicialmente en el cliente y actualiza cada minuto
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!formData.fecha || !formData.hora) {
      return;
    }

    if (horaSeleccionadaInvalida) {
      setFormData((prev) => (prev.hora ? { ...prev, hora: '' } : prev));
    }
  }, [formData.fecha, formData.hora, horaSeleccionadaInvalida]);

  useEffect(() => {
    const fetchPsicologos = async () => {
      try {
        const res = await fetch('/api/auth/psychologists');
        const data = await res.json();
        setPsicologos(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsicologos();
  }, []);

  // ✅ MODIFICADO: Agregar lógica para actualizar sesión cuando hay cita aceptada
  const fetchCitasDelPaciente = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/appointments?patientId=${session.user.id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const citasFormateadas: Cita[] = (data as AppointmentApiItem[]).map((apt) => ({
          id: apt.id,
          fecha: apt.fecha,
          hora: apt.hora,
          psicologo: apt.psychologistName || 'Psicólogo',
          modalidad: apt.modalidad,
          motivo: apt.motivo || 'Sin especificar',
          estado: normalizeAppointmentStatus(apt.status),
          requestLink: apt.requestLink,
          meetingLink: apt.meetingLink,
          cancelReason: apt.cancelReason || null,
        }));
        setCitasAgendadas(citasFormateadas);

        // ✅ NUEVO: Verificar si hay alguna cita aceptada
        const hasAcceptedAppointment = citasFormateadas.some(
          (cita) => cita.estado === 'Aceptada'
        );

        // ✅ NUEVO: Si hay cita aceptada y el rol NO es PACIENTE, actualizar sesión
        if (hasAcceptedAppointment && session?.user?.role !== 'PACIENTE') {
          console.log('🔔 Cita aceptada detectada. Actualizando rol a PACIENTE...');
          await update(); // Forzar actualización de la sesión
          toast.success('✅ ¡Tu cita ha sido aceptada! Ahora eres paciente.', {
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
    }
  }, [session?.user?.id, session?.user?.role, update]); // ✅ Agregar 'update' a las dependencias

  // Cargar citas del paciente desde el servidor
  useEffect(() => {
    fetchCitasDelPaciente();

    const pollAppointments = () => {
      if (document.visibilityState === 'visible') {
        fetchCitasDelPaciente();
      }
    };

    const interval = setInterval(pollAppointments, APPOINTMENTS_POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', pollAppointments);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', pollAppointments);
    };
  }, [fetchCitasDelPaciente]);

  // Cargar horas ocupadas cuando cambia psicólogo o fecha
  useEffect(() => {
    const fetchHorasOcupadas = async () => {
      if (!formData.psicologo || !formData.fecha) {
        setHorasOcupadas([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/appointments?psychologistId=${formData.psicologo}&fecha=${formData.fecha}`
        );
        const data = await res.json();
        
        // Extraer horas de las citas que NO están canceladas (Pendiente, Aceptada, etc)
        const citas = Array.isArray(data) ? (data as AppointmentApiItem[]) : [];
        const horas = citas
          .filter((cita) => cita.status !== 'Cancelada' && cita.status !== 'Rechazada')
          .map((cita) => cita.hora);
        setHorasOcupadas(horas);
      } catch (error) {
        console.error('Error fetching occupied hours:', error);
        setHorasOcupadas([]);
      }
    };

    fetchHorasOcupadas();
  }, [formData.psicologo, formData.fecha]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!psychologistSelectRef.current) return;
      if (!psychologistSelectRef.current.contains(event.target as Node)) {
        setIsPsychologistMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPsychologistMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.psicologo || !formData.fecha || !formData.hora) {
      toast.error('⚠️ Por favor completa: Psicólogo, Fecha y Hora');
      return;
    }

    if (isHoraPasada(formData.fecha, formData.hora)) {
      toast.error('⚠️ No puedes agendar una cita en una hora que ya pasó');
      return;
    }

    if (horasOcupadas.includes(formData.hora)) {
      toast.error('⚠️ Esa hora ya está reservada');
      return;
    }

    if (motivoWords > MAX_MOTIVO_WORDS) {
      toast.error(`⚠️ El motivo no puede superar las ${MAX_MOTIVO_WORDS} palabras`);
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psychologistId: formData.psicologo,
          fecha: formData.fecha,
          hora: formData.hora,
          modalidad: formData.modalidad,
          motivo: formData.motivo || 'Sin especificar',
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        const nuevaCita: Cita = {
          id: responseData.id || Date.now().toString(),
          fecha: formData.fecha,
          hora: formData.hora,
          psicologo: psicologos.find(p => p.id === formData.psicologo)?.name || 'Psicólogo',
          modalidad: formData.modalidad,
          motivo: formData.motivo || 'Sin especificar',
          estado: 'Pendiente',
        };

        setCitasAgendadas([nuevaCita, ...citasAgendadas]);
        setFormData({
          psicologo: formData.psicologo,
          fecha: formData.fecha,
          hora: '',
          modalidad: formData.modalidad,
          motivo: '',
        });

        await fetchCitasDelPaciente();
        
        toast.success('✅ Cita agendada correctamente');
      } else {
        toast.error(`❌ Error: ${responseData.error || 'No se pudo agendar la cita'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error al agendar la cita');
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    setCancellingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelada', cancelReason: reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cancelar la cita');
      }

      setCitasAgendadas((prev) => prev.map((cita) => (cita.id === appointmentId ? { ...cita, estado: 'Cancelada', cancelReason: reason } : cita)));
      await fetchCitasDelPaciente();
      toast.success('✅ Cita cancelada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('❌ No se pudo cancelar la cita');
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelDialog = (appointmentId: string) => {
    setCancelDialogId(appointmentId);
    setCancelReason('');
  };

  const closeCancelDialog = () => {
    if (cancellingId) return;
    setCancelDialogId(null);
    setCancelReason('');
  };

  const confirmCancelDialog = async () => {
    if (!cancelDialogId) return;
    const appointmentId = cancelDialogId;
    setCancelDialogId(null);
    await handleCancelAppointment(appointmentId, cancelReason.trim());
  };

  return (
    <>
    <div className="citas-page-shell min-h-screen bg-[radial-gradient(circle_at_15%_20%,#dff1ff_0%,#eef6ff_35%,#f8fbff_70%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1450px] space-y-7 pl-10 md:pl-4 lg:pl-10">
        <section className="rounded-3xl border border-[#c7ddf8] bg-white/85 p-6 shadow-[0_20px_45px_rgba(29,78,140,0.12)] backdrop-blur md:p-8">
          {/* NUEVO BOTÓN: Volver al inicio */}
          <div className="mb-6">
            <Link 
              href="/dashboard/paciente" 
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1d42fb] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#163bd1] hover:shadow-lg"
            >
              <Home size={18} />
              Volver al Inicio
            </Link>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4c82bf]">Agenda Clínica</p>
              <h1 className="mt-2 text-3xl font-black text-[#1E4D8C] md:text-5xl">Agendamiento de cita</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
                Selecciona el/la psicólogo/a, fecha, modalidad y horario para agendar tu cita.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-[#f4f9ff] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Próximas</p>
                <p className="mt-1 text-2xl font-black text-[#1E4D8C]">{upcomingAppointments.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Aceptadas</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{citasAgendadas.filter((c) => c.estado === 'Aceptada').length}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pendientes</p>
                <p className="mt-1 text-2xl font-black text-amber-700">{citasAgendadas.filter((c) => c.estado === 'Pendiente').length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Historial</p>
                <p className="mt-1 text-2xl font-black text-slate-700">{historyAppointments.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          <section className="xl:col-span-7">
            <AppointmentBookingForm
              formData={formData}
              setFormData={setFormData}
              psicologos={psicologos}
              loading={loading}
              selectedPsychologistName={selectedPsychologistName}
              isPsychologistMenuOpen={isPsychologistMenuOpen}
              setIsPsychologistMenuOpen={setIsPsychologistMenuOpen}
              psychologistSelectRef={psychologistSelectRef}
              dateInputRef={dateInputRef}
              today={today}
              horasOcupadas={horasOcupadas}
              openDatePicker={openDatePicker}
              isHoraPasada={isHoraPasada}
              motivoWords={motivoWords}
              enviando={enviando}
              horaSeleccionadaInvalida={horaSeleccionadaInvalida}
              onSubmit={handleSubmit}
            />
          </section>

          <section className="xl:col-span-5">
            <AppointmentListPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              historyFilter={historyFilter}
              setHistoryFilter={setHistoryFilter}
              upcomingAppointments={upcomingAppointments}
              historyAppointments={historyAppointments}
              cancellingId={cancellingId}
              onOpenCancelDialog={openCancelDialog}
            />
          </section>
        </div>
      </div>
    </div>

    <CancelAppointmentDialog
      open={Boolean(cancelDialogId)}
      cancelReason={cancelReason}
      onCancelReasonChange={setCancelReason}
      cancellingId={cancellingId}
      cancelDialogId={cancelDialogId}
      onClose={closeCancelDialog}
      onConfirm={confirmCancelDialog}
    />
    </>
  );
}