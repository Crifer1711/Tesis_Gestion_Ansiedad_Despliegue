'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Send, Lock, Video, Link2, XCircle, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Asegúrate de agregar 'Home' a tu lista de íconos de lucide-react
interface Cita {
  id: string;
  fecha: string;
  hora: string;
  psicologo: string;
  modalidad: 'Presencial' | 'Virtual';
  motivo: string;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';
  requestLink?: boolean;
  meetingLink?: string | null;
  cancelReason?: string | null;
}

interface Psicologo {
  id: string;
  name: string;
  email: string;
}

// Generar horarios de 07:00 a 18:00 (hora por hora)
const HORAS = Array.from({ length: 12 }, (_, i) => {
  const hour = 7 + i;
  return `${String(hour).padStart(2, '0')}:00`;
});

const MAX_MOTIVO_WORDS = 200;

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
};

// Función para parsear fecha sin timezone issues
const parseDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const normalizeAppointmentStatus = (status: string | null | undefined): Cita['estado'] => {
  const value = (status || '').trim().toLowerCase();

  if (value === 'aceptada') {
    return 'Aceptada';
  }

  if (value === 'cancelada') {
    return 'Cancelada';
  }

  if (value === 'rechazada') {
    return 'Rechazada';
  }

  return 'Pendiente';
};

export function CitasComponent() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
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
  const [now, setNow] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<'proximas' | 'historial'>('proximas');
  const [historyFilter, setHistoryFilter] = useState<'Todas' | 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada'>('Todas');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const today = getLocalDateString(now);
  const motivoWords = countWords(formData.motivo);

  const isHoraPasada = (fecha: string, hora: string) => {
    if (!fecha || !hora) {
      return false;
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const [hour] = hora.split(':').map(Number);
    const slot = new Date(year, month - 1, day, hour, 0, 0, 0);
    return slot < now;
  };

  const getAppointmentDateTime = (fecha: string, hora: string) => {
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute] = hora.split(':').map(Number);
    return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
  };

  const isAppointmentUpcoming = (cita: Cita) => {
    const dt = getAppointmentDateTime(cita.fecha, cita.hora);
    return dt >= now && cita.estado !== 'Cancelada' && cita.estado !== 'Rechazada';
  };

  const isAppointmentRecentHistory = (cita: Cita) => {
    const dt = getAppointmentDateTime(cita.fecha, cita.hora);
    const diffDays = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
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
        console.log('Psicólogos cargados:', data);
        setPsicologos(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsicologos();
  }, []);

  const fetchCitasDelPaciente = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/appointments?patientId=${session.user.id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const citasFormateadas: Cita[] = data.map((apt: any) => ({
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
      }
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
    }
  }, [session?.user?.id]);

  // Cargar citas del paciente desde el servidor
  useEffect(() => {
    fetchCitasDelPaciente();

    // Re-fetch cada 5 segundos para detectar cambios (cuando psicólogo acepta o se cancela)
    const interval = setInterval(fetchCitasDelPaciente, 5000);
    return () => clearInterval(interval);
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
        const citas = Array.isArray(data) ? data : [];
        const horas = citas
          .filter((cita: any) => cita.status !== 'Cancelada' && cita.status !== 'Rechazada')
          .map((cita: any) => cita.hora);
        console.log('Horas ocupadas para', formData.fecha, ':', horas);
        setHorasOcupadas(horas);
      } catch (error) {
        console.error('Error fetching occupied hours:', error);
        setHorasOcupadas([]);
      }
    };

    fetchHorasOcupadas();
  }, [formData.psicologo, formData.fecha]);

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
          // requestLink no se solicita desde UI: el psicólogo compartirá el enlace directamente si aplica
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        const nuevaCita: Cita = {
          id: responseData.id || Date.now().toString(),
          fecha: formData.fecha,
          hora: formData.hora,
          psicologo: psicologos.find(p => p.id === formData.psicologo)?.name || 'Psicólogo',
          modalidad: formData.modalidad as 'Presencial' | 'Virtual',
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Aceptada':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Cancelada':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Rechazada':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#dff1ff_0%,#eef6ff_35%,#f8fbff_70%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1450px] space-y-7">
        <section className="rounded-3xl border border-[#c7ddf8] bg-white/85 p-6 shadow-[0_20px_45px_rgba(29,78,140,0.12)] backdrop-blur md:p-8">
          {/* NUEVO BOTÓN: Volver al inicio */}
          <div className="mb-6">
            <Link 
              href="/dashboard/paciente" 
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1d42fb] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#D95536] hover:shadow-lg"
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
                Selecciona el psicólogo, fecha, modalidad y horario para agendar tu cita.
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
            <div className="overflow-hidden rounded-3xl border border-[#c7ddf8] bg-white shadow-[0_18px_35px_rgba(21,74,130,0.12)]">
              <div className="bg-gradient-to-r from-[#2f6ca9] via-[#4e8ecf] to-[#79b0e3] px-6 py-5 text-white md:px-8">
                <h2 className="text-2xl font-black">Solicitar nueva cita</h2>
                <p className="mt-1 text-sm text-white/90">Completa el formulario y confirma una hora disponible.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">
                      <User size={16} className="mr-1 inline" />
                      Psicólogo
                    </label>
                    <select
                      value={formData.psicologo}
                      onChange={(e) => setFormData({ ...formData, psicologo: e.target.value })}
                      className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
                    >
                      <option value="">{loading ? 'Cargando psicólogos...' : psicologos.length === 0 ? 'No hay psicólogos disponibles' : 'Selecciona un psicólogo'}</option>
                      {psicologos.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">
                      <Calendar size={16} className="mr-1 inline" />
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      min={today}
                      className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">Modalidad</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-sm font-semibold transition ${
                        formData.modalidad === 'Presencial' ? 'text-[#0f3f74]' : 'text-slate-700'
                      }`}
                        style={{ borderColor: formData.modalidad === 'Presencial' ? '#71A5D9' : '#d8e8f9', background: formData.modalidad === 'Presencial' ? '#ebf4ff' : '#f8fbff' }}>
                        <input
                          type="radio"
                          value="Presencial"
                          checked={formData.modalidad === 'Presencial'}
                          onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                          className="mr-2 h-4 w-4 accent-[#1E4D8C]"
                        />
                        Presencial
                      </label>
                      <label className={`flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-sm font-semibold transition ${
                        formData.modalidad === 'Virtual' ? 'text-[#0f3f74]' : 'text-slate-700'
                      }`}
                        style={{ borderColor: formData.modalidad === 'Virtual' ? '#71A5D9' : '#d8e8f9', background: formData.modalidad === 'Virtual' ? '#ebf4ff' : '#f8fbff' }}>
                        <input
                          type="radio"
                          value="Virtual"
                          checked={formData.modalidad === 'Virtual'}
                          onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                          className="mr-2 h-4 w-4 accent-[#1E4D8C]"
                        />
                        Virtual
                      </label>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-600">
                      Presencial: atencion en consultorio. Virtual: sesion por Google Meet.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-[#f7fbff] p-4 md:p-5">
                  <label className="mb-3 block text-sm font-bold text-[#1E4D8C]">
                    <Clock size={16} className="mr-1 inline" />
                    Selecciona una hora
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {HORAS.map((h) => {
                      const estaOcupada = horasOcupadas.includes(h);
                      const estaPasada = isHoraPasada(formData.fecha, h);
                      const estaInhabilitada = estaOcupada || estaPasada;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => !estaInhabilitada && setFormData({ ...formData, hora: h })}
                          disabled={estaInhabilitada}
                          className={`rounded-lg border-2 px-2 py-2 text-sm font-bold transition ${
                            estaPasada
                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              : estaOcupada
                              ? 'cursor-not-allowed border-slate-300 bg-gray-200 text-gray-400 line-through'
                              : formData.hora === h
                              ? 'border-[#1E4D8C] bg-[#71A5D9] text-white'
                              : 'border-[#89b7e8] bg-white text-[#1E4D8C] hover:bg-blue-50'
                          }`}
                        >
                          {estaPasada ? <Clock size={13} className="mr-1 inline" /> : estaOcupada ? <Lock size={13} className="mr-1 inline" /> : null}
                          {h}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    <p className="flex items-center gap-1"><Lock size={12} /> Tachadas: espacio reservado</p>
                    <p className="flex items-center gap-1"><Clock size={12} /> En gris: hora vencida</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">
                    Motivo de la consulta (opcional, máximo {MAX_MOTIVO_WORDS} palabras)
                  </label>
                  <textarea
                    value={formData.motivo}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      if (countWords(nextValue) <= MAX_MOTIVO_WORDS) {
                        setFormData({ ...formData, motivo: nextValue });
                      }
                    }}
                    placeholder="Describe brevemente lo que deseas tratar en la sesión..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Opcional, pero útil para orientar la sesión.</span>
                    <span className={`${motivoWords > MAX_MOTIVO_WORDS ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{motivoWords}/{MAX_MOTIVO_WORDS}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando || !formData.psicologo || !formData.fecha || !formData.hora || horaSeleccionadaInvalida || motivoWords > MAX_MOTIVO_WORDS}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f6ca9] to-[#1E4D8C] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:from-[#25588a] hover:to-[#163b68] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />
                  {enviando ? 'Agendando...' : 'Confirmar solicitud de cita'}
                </button>
              </form>
            </div>
          </section>

          <section className="xl:col-span-5">
            <div className="space-y-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,70,128,0.10)] md:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-black text-[#1E4D8C]">Mis Citas</h2>
              <div className="inline-flex rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('proximas')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'proximas' ? 'bg-[#71A5D9] text-white' : 'text-slate-600 hover:text-[#1E4D8C]'}`}
                >
                  Próximas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('historial')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'historial' ? 'bg-[#71A5D9] text-white' : 'text-slate-600 hover:text-[#1E4D8C]'}`}
                >
                  Historial
                </button>
              </div>
            </div>

            {activeTab === 'proximas' ? (
              upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                  <Calendar size={52} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-gray-700 text-base font-semibold">No hay citas próximas</p>
                  <p className="text-gray-500 text-sm mt-2">Agenda tu primera cita llenando el formulario</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((cita) => (
                    <div
                      key={cita.id}
                      className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-5 hover:shadow-lg transition hover:border-[#71A5D9]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-[#1E4D8C] text-lg">{cita.psicologo}</p>
                        </div>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getEstadoColor(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Fecha y Hora</p>
                          <p className="text-sm font-semibold text-[#1E4D8C] mt-1.5">
                            {parseDate(cita.fecha).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })} a las {cita.hora}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Modalidad</p>
                          <p className="text-sm font-semibold text-[#1E4D8C] mt-1.5 capitalize">{cita.modalidad}</p>
                        </div>
                      </div>

                      {cita.modalidad === 'Virtual' && (
                        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3">
                          <p className="text-xs font-bold uppercase text-sky-700 mb-2 flex items-center gap-2">
                            <Video size={14} />
                            Videollamada Google Meet
                          </p>
                          {cita.meetingLink ? (
                            <a
                              href={cita.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline break-all"
                            >
                              <Link2 size={14} />
                              Unirse a la sesión
                            </a>
                          ) : (
                            <p className="text-sm text-sky-700">El psicólogo aún no ha compartido el enlace de Google Meet.</p>
                          )}
                        </div>
                      )}

                      {cita.motivo && cita.motivo !== 'Sin especificar' && (
                        <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200">
                          <p className="text-xs font-bold text-gray-500 uppercase">Motivo</p>
                          <p className="text-sm text-gray-700 mt-1.5">{cita.motivo}</p>
                        </div>
                      )}

                      {cita.estado === 'Cancelada' && cita.cancelReason && (
                        <div className="mt-3 bg-red-50 p-3.5 rounded-lg border border-red-200">
                          <p className="text-xs font-bold text-red-700 uppercase">Cancelada por ti</p>
                          <p className="text-sm text-red-800 mt-1.5">{cita.cancelReason}</p>
                        </div>
                      )}

                      {cita.estado === 'Rechazada' && (
                        <div className="mt-3 bg-rose-50 p-3.5 rounded-lg border border-rose-200">
                          <p className="text-xs font-bold text-rose-700 uppercase">Rechazada por la psicóloga</p>
                          <p className="text-sm text-rose-800 mt-1.5">
                            La cita fue rechazada y no podrá continuar.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          disabled={cancellingId === cita.id}
                          onClick={() => openCancelDialog(cita.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} />
                          {cancellingId === cita.id ? 'Cancelando...' : 'Cancelar cita'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-blue-100 bg-[#f5f9ff] px-4 py-3">
                  <p className="text-sm text-slate-600">Aquí verás tus citas aceptadas y canceladas.</p>
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value as 'Todas' | 'Aceptada' | 'Cancelada')}
                    className="px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm text-slate-700"
                  >
                    <option>Todas</option>
                    <option>Aceptada</option>
                    <option>Cancelada</option>
                  </select>
                </div>

                {historyAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                    <Calendar size={52} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-gray-700 text-base font-semibold">No hay citas en este historial</p>
                    <p className="text-gray-500 text-sm mt-2">Cuando se acepten o cancelen, aparecerán aquí</p>
                  </div>
                ) : (
                  historyAppointments.map((cita) => (
                    <div key={cita.id} className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-[#1E4D8C] text-lg">{cita.psicologo}</p>
                        </div>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getEstadoColor(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Fecha y Hora</p>
                          <p className="text-sm font-semibold text-[#1E4D8C] mt-1.5">
                            {parseDate(cita.fecha).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })} a las {cita.hora}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Modalidad</p>
                          <p className="text-sm font-semibold text-[#1E4D8C] mt-1.5 capitalize">{cita.modalidad}</p>
                        </div>
                      </div>

                      {cita.modalidad === 'Virtual' && cita.meetingLink && (
                        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3">
                          <p className="text-xs font-bold uppercase text-sky-700 mb-2 flex items-center gap-2">
                            <Video size={14} />
                            Enlace de Google Meet
                          </p>
                          <a
                            href={cita.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline break-all"
                          >
                            <Link2 size={14} />
                            Abrir enlace
                          </a>
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            )}
            </div>
          </section>
        </div>
      </div>
    </div>

    {cancelDialogId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Cancelar cita</h3>
              <p className="text-sm text-slate-600">Puedes cancelar esta cita ahora y volver a agendar después.</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 mb-6">¿Deseas cancelar esta cita?</p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Motivo de cancelación
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (countWords(nextValue) <= MAX_MOTIVO_WORDS) {
                  setCancelReason(nextValue);
                }
              }}
              rows={4}
              placeholder="Explica brevemente por qué cancelas esta cita"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#71A5D9] focus:ring-2 focus:ring-[#71A5D9]/20"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Requerido para cancelar la cita.</span>
              <span>{countWords(cancelReason)}/{MAX_MOTIVO_WORDS}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeCancelDialog}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={confirmCancelDialog}
              disabled={!cancelReason.trim() || cancellingId === cancelDialogId}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sí, cancelar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
