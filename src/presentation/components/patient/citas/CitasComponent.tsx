'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Send, Lock, Video, Link2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  psicologo: string;
  modalidad: 'Presencial' | 'Virtual';
  motivo: string;
  estado: 'Pendiente' | 'Aceptada' | 'Cancelada';
  requestLink?: boolean;
  meetingLink?: string | null;
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
  const [historyFilter, setHistoryFilter] = useState<'Todas' | 'Pendiente' | 'Aceptada' | 'Cancelada'>('Todas');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);

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
    return dt >= now && cita.estado !== 'Cancelada';
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
    .filter((cita) => !isAppointmentUpcoming(cita) && (cita.estado === 'Cancelada' || isAppointmentRecentHistory(cita)))
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

  // Cargar citas del paciente desde el servidor
  useEffect(() => {
    const fetchCitasDelPaciente = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch(`/api/appointments?patientId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          const citasFormateadas: Cita[] = data.map((apt: any) => ({
            id: apt.id,
            fecha: apt.fecha,
            hora: apt.hora,
            psicologo: apt.psychologistName || 'Psicólogo',
            modalidad: apt.modalidad,
            motivo: apt.motivo || 'Sin especificar',
            estado: apt.status === 'Aceptada' || apt.status === 'Cancelada' ? apt.status : 'Pendiente',
            requestLink: apt.requestLink,
            meetingLink: apt.meetingLink,
          }));
          setCitasAgendadas(citasFormateadas);
        }
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
      }
    };

    // Fetch inicial
    fetchCitasDelPaciente();
    
    // Re-fetch cada 5 segundos para detectar cambios (cuando psicólogo acepta)
    const interval = setInterval(fetchCitasDelPaciente, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

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
          psicologo: '',
          fecha: '',
          hora: '',
          modalidad: 'Presencial',
          motivo: '',
        });
        
        toast.success('✅ Cita Agendada Exitosamente — EN LISTA DE ESPERA');
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

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelada' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cancelar la cita');
      }

      setCitasAgendadas((prev) => prev.map((cita) => (cita.id === appointmentId ? { ...cita, estado: 'Cancelada' } : cita)));
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
  };

  const closeCancelDialog = () => {
    if (cancellingId) return;
    setCancelDialogId(null);
  };

  const confirmCancelDialog = async () => {
    if (!cancelDialogId) return;
    const appointmentId = cancelDialogId;
    setCancelDialogId(null);
    await handleCancelAppointment(appointmentId);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Aceptada':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Cancelada':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1E4D8C] mb-2">Agendar Cita</h1>
          <p className="text-slate-600 leading-relaxed text-lg">
            Elige un psicólogo, selecciona fecha y hora disponibles, y envía tu cita.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky top-24 overflow-hidden">
              <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-r from-[#71A5D9] to-[#9DC3E6] px-6 py-5 text-white">
                <h2 className="text-xl font-black">Completa tu solicitud</h2>
                <p className="text-sm text-white/90 mt-1">Selecciona un espacio disponible y describe, si lo deseas, el motivo de la consulta.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Seleccionar Psicólogo */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-2">
                    <User size={16} className="inline mr-1" />
                    Seleccionar Psicólogo *
                  </label>
                  <select
                    value={formData.psicologo}
                    onChange={(e) => setFormData({ ...formData, psicologo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A5D9] text-sm text-gray-800 font-medium bg-white"
                  >
                    <option value="" className="text-gray-600">
                      {loading ? 'Cargando psicólogos...' : psicologos.length === 0 ? 'No hay psicólogos disponibles' : 'Selecciona un psicólogo'}
                    </option>
                    {psicologos.map((p) => (
                      <option key={p.id} value={p.id} className="text-gray-800">{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    min={today}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A5D9] text-sm text-gray-800 font-medium bg-white"
                  />
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Hora *
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
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
                            className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                              estaPasada
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : estaOcupada
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed line-through'
                                : formData.hora === h
                                ? 'bg-[#71A5D9] text-white border-[#1E4D8C]'
                                : 'bg-white text-[#1E4D8C] border-[#71A5D9] hover:bg-blue-50'
                            }`}
                          >
                            {estaPasada ? <Clock size={14} className="inline mr-1" /> : estaOcupada ? <Lock size={14} className="inline mr-1" /> : null}
                            {h}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                      <p className="flex items-center gap-1">
                        <Lock size={12} />
                        Tachadas — Espacios reservados (no disponibles)
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock size={12} />
                        En gris — Horas vencidas (no disponibles)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-3">Modalidad</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center cursor-pointer bg-gray-50 p-3 rounded-lg border-2 border-gray-200 hover:border-[#71A5D9] transition"
                      style={{ borderColor: formData.modalidad === 'Presencial' ? '#71A5D9' : '#E5E7EB' }}>
                      <input
                        type="radio"
                        value="Presencial"
                        checked={formData.modalidad === 'Presencial'}
                        onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                        className="mr-2 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-800">Presencial</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-gray-50 p-3 rounded-lg border-2 border-gray-200 hover:border-[#71A5D9] transition"
                      style={{ borderColor: formData.modalidad === 'Virtual' ? '#71A5D9' : '#E5E7EB' }}>
                      <input
                        type="radio"
                        value="Virtual"
                        checked={formData.modalidad === 'Virtual'}
                        onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                        className="mr-2 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-800">Virtual</span>
                    </label>
                  </div>
                  {formData.modalidad === 'Virtual' && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="mb-2">Al seleccionar "Virtual", el psicólogo recibirá una notificación y compartirá directamente el enlace de la sesión. El enlace estará disponible en tus notificaciones y en la sección de citas cuando el psicólogo lo haya publicado.</p>
                    </div>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-2">
                    Motivo de la Consulta (Opcional, máximo {MAX_MOTIVO_WORDS} palabras)
                  </label>
                  <textarea
                    value={formData.motivo}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      if (countWords(nextValue) <= MAX_MOTIVO_WORDS) {
                        setFormData({ ...formData, motivo: nextValue });
                      }
                    }}
                    placeholder="Cuéntale al psicólogo por qué deseas esta cita..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A5D9] text-sm text-gray-800 font-medium resize-none placeholder-gray-500 bg-white"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Opcional — escribe un breve motivo si lo deseas.</span>
                    <span className={`${motivoWords > MAX_MOTIVO_WORDS ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {motivoWords}/{MAX_MOTIVO_WORDS}
                    </span>
                  </div>
                </div>

                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={enviando || !formData.psicologo || !formData.fecha || !formData.hora || horaSeleccionadaInvalida || motivoWords > MAX_MOTIVO_WORDS}
                  className="w-full bg-gradient-to-r from-[#71A5D9] to-[#1E4D8C] hover:from-[#1E4D8C] hover:to-[#0F2840] text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send size={18} />
                  {enviando ? 'Agendando...' : 'Agendar Cita'}
                </button>

                <p className="text-xs text-gray-600 text-center mt-3">
                  * Campos requeridos
                </p>
              </form>
            </div>
          </div>

          {/* CITAS AGENDADAS */}
          <div className="lg:col-span-2 space-y-5">
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
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-slate-600">Aquí verás las citas de los últimos 30 días.</p>
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value as 'Todas' | 'Pendiente' | 'Aceptada' | 'Cancelada')}
                    className="px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm text-slate-700"
                  >
                    <option>Todas</option>
                    <option>Pendiente</option>
                    <option>Aceptada</option>
                    <option>Cancelada</option>
                  </select>
                </div>

                {historyAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                    <Calendar size={52} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-gray-700 text-base font-semibold">No hay citas en los últimos 30 días</p>
                    <p className="text-gray-500 text-sm mt-2">Cuando tengas citas recientes, aparecerán aquí</p>
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
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
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
