// src/app/dashboard/psicologo/citas/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar as CalendarIcon, Search, ChevronDown, ChevronLeft, ChevronRight, MessageSquareText, TriangleAlert, ArrowRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  psychologistId: string;
  fecha: string;
  hora: string;
  modalidad: string;
  motivo: string;
  requestLink?: boolean;
  meetingLink?: string | null;
  cancelReason?: string | null;
  status: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';
}

// Función para parsear fecha sin timezone issues
const parseDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Formatea una fecha local a YYYY-MM-DD usando componentes locales
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateFromYYYYMMDD = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getAppointmentDateTime = (fecha: string, hora: string) => {
  const dt = parseDateFromYYYYMMDD(fecha);
  const [hour, minute] = hora.split(':').map(Number);
  dt.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return dt;
};

export default function PsychologistCitasPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date()); // Para navegar entre meses
  const [meetingLinkDrafts, setMeetingLinkDrafts] = useState<Record<string, string>>({});
  const [savingLinkIds, setSavingLinkIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setSelectedDate(getLocalDateString(new Date()));
    setCalendarMonth(new Date());
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/appointments?psychologistId=${session.user.id}`, { cache: 'no-store' });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener citas');
        }
        
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
        setMeetingLinkDrafts((prev) => {
          const next: Record<string, string> = {};
          for (const apt of Array.isArray(data) ? data : []) {
            next[apt.id] = apt.meetingLink || prev[apt.id] || '';
          }
          return next;
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleStatusChange = async (appointmentId: string, newStatus: 'Aceptada' | 'Rechazada') => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Error al actualizar cita');
      
      // Actualizar estado localmente
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt)
      );
      
      setSelectedAppointmentId((current) => (current === appointmentId ? null : current));

      console.log(`Cita ${appointmentId} actualizada a ${newStatus}`);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al actualizar cita');
    }
  };

  const handleSaveMeetingLink = async (appointmentId: string) => {
    const meetingLink = (meetingLinkDrafts[appointmentId] || '').trim();

    // marcar como guardando
    setSavingLinkIds(prev => new Set(prev).add(appointmentId));

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingLink: meetingLink || null }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar enlace');
      }

      // Actualizar el estado local de citas y el draft
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, meetingLink: data.meetingLink || null } : apt)
      );
      setMeetingLinkDrafts(prev => ({ ...prev, [appointmentId]: data.meetingLink || '' }));

      toast.success(meetingLink ? '✅ Enlace guardado' : '✅ Enlace eliminado');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar el enlace');
    } finally {
      // quitar flag de guardando
      setSavingLinkIds(prev => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };


  // Calcular estadísticas
  const pendingCount = appointments.filter(a => a.status === 'Pendiente').length;
  const acceptedCount = appointments.filter(a => a.status === 'Aceptada').length;
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
  const pendingAppointments = appointments
    .filter((a) => a.status === 'Pendiente')
    .sort((a, b) => getAppointmentDateTime(a.fecha, a.hora).getTime() - getAppointmentDateTime(b.fecha, b.hora).getTime());
  const nextPendingAppointment = pendingAppointments[0] ?? null;
  // Obtener hoy en formato YYYY-MM-DD (local)
  const today = getLocalDateString(new Date());

  // Filtrar citas para la fecha seleccionada, excluyendo citas que ya pasaron
  const now = new Date();
  const isAppointmentInFuture = (fecha: string, hora: string) => {
    try {
      const [hour, minute] = hora.split(':').map(Number);
      const dt = parseDateFromYYYYMMDD(fecha);
      dt.setHours(hour ?? 0, minute ?? 0, 0, 0);
      return dt >= now;
    } catch (e) {
      return true;
    }
  };

  const todayAppointments = appointments.filter(a => {
    if (a.fecha !== selectedDate) return false;
    // Si la fecha seleccionada es anterior a hoy, no mostrar citas
    if (selectedDate < today) return false;
    // Si la fecha es hoy, mostrar solo citas en el futuro o ahora
    if (selectedDate === today) return isAppointmentInFuture(a.fecha, a.hora);
    // Fecha futura: mostrar todas las citas
    return true;
  });

  const upcomingAppointments = appointments
    .filter((a) => a.status !== 'Cancelada' && isAppointmentInFuture(a.fecha, a.hora))
    .sort((a, b) => {
      const aDate = parseDateFromYYYYMMDD(a.fecha);
      const bDate = parseDateFromYYYYMMDD(b.fecha);
      const [aHour, aMinute] = a.hora.split(':').map(Number);
      const [bHour, bMinute] = b.hora.split(':').map(Number);
      aDate.setHours(aHour ?? 0, aMinute ?? 0, 0, 0);
      bDate.setHours(bHour ?? 0, bMinute ?? 0, 0, 0);
      return aDate.getTime() - bDate.getTime();
    });

  const nextAppointment = upcomingAppointments[0] ?? null;
  const todayAppointmentsCount = appointments.filter(
    (a) => a.fecha === today && a.status !== 'Cancelada'
  ).length;
  
  // Filtrar citas por búsqueda y fecha
  const filteredAppointments = todayAppointments.filter(apt =>
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const order: Record<Appointment['status'], number> = {
      Pendiente: 0,
      Aceptada: 1,
      Rechazada: 2,
      Cancelada: 3,
    };

    const statusDiff = order[a.status] - order[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return getAppointmentDateTime(a.fecha, a.hora).getTime() - getAppointmentDateTime(b.fecha, b.hora).getTime();
  });

  // Generar calendario
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  // Usar calendarMonth para mostrar el mes correcto
  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  
  
  // Obtener días que tienen citas (usando la fecha directa en formato YYYY-MM-DD)
  const daysWithAppointments = new Set(
    appointments.map(apt => apt.fecha) // apt.fecha ya está en formato YYYY-MM-DD
  );

  const selectedAppointment = useMemo(
    () => filteredAppointments.find((apt) => apt.id === selectedAppointmentId) ?? null,
    [filteredAppointments, selectedAppointmentId]
  );

  useEffect(() => {
    if (selectedAppointmentId && !filteredAppointments.some((apt) => apt.id === selectedAppointmentId)) {
      setSelectedAppointmentId(null);
    }
  }, [filteredAppointments, selectedAppointmentId]);
  
  // Función para generar fecha en formato YYYY-MM-DD desde día del calendario
  const getDayDateStr = (day: number) => {
    return `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Navegar a mes anterior/siguiente
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarMonth(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#71A5D9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-black text-[#1E4D8C]">Citas Agendadas</h1>
        <p className="text-slate-600 mt-1">Gestiona tus citas con los pacientes</p>
      </div>

      {/* Estadísticas */}
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Gestión de agenda clínica</p>
              <h2 className="text-xl md:text-2xl font-black text-[#1E4D8C] mt-1">Revisa y responde las citas recién agendadas</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Infórmate sobre las citas recién agendadas que aún están pendientes de tu respuesta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm min-w-[180px]">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                <MessageSquareText size={14} />
                Pendientes por responder
              </p>
              <p className="mt-1 text-3xl font-black text-amber-600">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm min-w-[240px]">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Siguiente cita pendiente</p>
              {nextPendingAppointment ? (
                <>
                  <p className="mt-1 text-base font-black text-emerald-700">
                    {nextPendingAppointment.hora} · {nextPendingAppointment.patientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {parseDate(nextPendingAppointment.fecha).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-500">No hay solicitudes nuevas esperando respuesta.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm ring-1 ring-amber-100/60">
          <p className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
            <TriangleAlert size={16} className="text-amber-600" />
            Pendientes por responder
          </p>
          <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-600 mb-2">Próxima cita</p>
          <p className="text-lg font-black text-emerald-700 leading-tight">
            {nextAppointment
              ? `${nextAppointment.hora} · ${nextAppointment.patientName}`
              : 'Sin citas próximas'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {nextAppointment
              ? parseDate(nextAppointment.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
              : 'Revisa el calendario para ver más detalles'}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-600 mb-2">Citas de hoy</p>
          <p className="text-3xl font-black text-violet-700">{todayAppointmentsCount}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
            <User size={16} className="text-sky-600" />
            Pacientes totales
          </p>
          <p className="text-3xl font-black text-[#1E4D8C]">{uniquePatients}</p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna Izquierda - Calendario */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-black text-[#1E4D8C] mb-4">MI CALENDARIO</h3>
            
            {/* Mini Calendario */}
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
              {/* Header con navegación */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-200 rounded transition"
                >
                  <ChevronLeft size={20} className="text-[#1E4D8C]" />
                </button>
                <div className="text-center font-bold text-sm text-[#1E4D8C] flex-1">
                  {calendarMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                </div>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-200 rounded transition"
                >
                  <ChevronRight size={20} className="text-[#1E4D8C]" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-600 py-1">{day}</div>
                ))}
                  {days.map((day, idx) => {
                  const dateStr = day ? getDayDateStr(day) : '';
                  const isToday = dateStr === today;
                    const hasAppointments = Boolean(day && daysWithAppointments.has(dateStr));
                  const isSelected = dateStr === selectedDate;
                    const isPast = Boolean(dateStr && dateStr < today);

                  return (
                    <div key={idx} className="text-center py-1">
                      {day ? (
                        <button
                          onClick={() => !isPast && setSelectedDate(dateStr)}
                          disabled={isPast}
                          className={`w-full h-8 rounded text-sm font-semibold transition relative flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#71A5D9] text-white shadow-lg'
                              : isToday
                              ? 'ring-2 ring-[#71A5D9] bg-[#EAF6FF] text-[#1E4D8C] font-bold'
                              : hasAppointments && !isPast
                              ? 'bg-[#E3F2FF] text-[#0F3B5E] border-2 border-[#9CC7EE]'
                              : isPast
                              ? 'text-gray-300 bg-transparent cursor-not-allowed opacity-60'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="select-none">{day}</span>
                          {hasAppointments && !isSelected && !isToday && !isPast && (
                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#71A5D9] rounded-full"></span>
                          )}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Citas del Día */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4 sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-3">
              <h3 className="text-lg font-black text-[#1E4D8C] mb-4">CITAS DEL DÍA</h3>
              
              {/* Buscador */}
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por paciente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71A5D9] text-sm"
                />
              </div>

              {/* Fecha Seleccionada */}
              <div className="text-sm font-semibold text-gray-600 mb-4">
                {parseDate(selectedDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Lista de Citas */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-semibold">No hay citas para esta fecha</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
                {filteredAppointments.map(apt => {
                  // Estadísticas del paciente
                  const appointmentsForPatient = appointments.filter(a => a.patientId === apt.patientId);
                  const pendingForPatient = appointmentsForPatient.filter(a => a.status === 'Pendiente').length;
                  const totalForPatient = appointmentsForPatient.length;
                  const isSelected = selectedAppointment?.id === apt.id;

                  return (
                    <div 
                      key={apt.id} 
                      className={`border-2 rounded-lg overflow-hidden hover:border-[#71A5D9] hover:shadow-md transition bg-white ${isSelected ? 'border-[#71A5D9] shadow-md' : 'border-gray-200'}`}
                    >
                      {/* Header de Cita - abre modal centrado */}
                      <div 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${isSelected ? 'bg-sky-50' : ''}`}
                        onClick={() => setSelectedAppointmentId(prev => (prev === apt.id ? null : apt.id))}
                      >
                        <div className="flex items-center justify-between">
                          {/* Paciente Info */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#71A5D9] to-[#1E4D8C] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {apt.patientName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1E4D8C]">{apt.patientName}</p>
                              <p className="text-xs text-gray-500 truncate">{apt.patientEmail}</p>
                            </div>
                          </div>

                          {/* Stats pequeñas */}
                          <div className="flex gap-2 items-center ml-3">
                            <div className="text-right text-xs">
                              <span className="font-bold text-[#1E4D8C] block">{totalForPatient}</span>
                              <span className="text-gray-500 text-xs">Citas Totales</span>
                            </div>
                            <div className="text-right text-xs">
                              <span className="font-bold text-yellow-600 block">{pendingForPatient}</span>
                              <span className="text-gray-500 text-xs">Pendientes</span>
                            </div>
                          </div>

                          {/* Chevron y Status */}
                          <div className="flex items-center gap-2 ml-3">
                            {apt.status === 'Pendiente' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                Pendiente
                              </span>
                            )}
                            {apt.status === 'Aceptada' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                Aceptada
                              </span>
                            )}
                            {apt.status === 'Rechazada' && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                Rechazada
                              </span>
                            )}
                            {apt.status === 'Cancelada' && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                  Cancelada por el estudiante
                              </span>
                            )}
                            <ChevronDown 
                              size={20} 
                              className={`text-gray-600 transition transform ${isSelected ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Detalles Básicos siempre visibles */}
                        <div className="mt-3 bg-gray-50 rounded p-3 text-sm flex gap-4 hidden md:flex">
                          <div>
                            <span className="font-semibold text-gray-600 text-xs">HORA</span>
                            <p className="text-[#1E4D8C] font-bold">{apt.hora}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600 text-xs">TIPO</span>
                            <p className="text-[#1E4D8C] font-bold capitalize">{apt.modalidad}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600 text-xs">FECHA</span>
                            <p className="text-[#1E4D8C] font-bold">{apt.fecha}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm" onClick={() => setSelectedAppointmentId(null)}>
          <div
            className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-sky-700">Detalle de cita</p>
                <h3 className="mt-1 text-2xl font-black text-[#1E4D8C]">{selectedAppointment.patientName}</h3>
                <p className="text-sm text-slate-600">{selectedAppointment.patientEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointmentId(null)}
                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase">Fecha</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {parseDate(selectedAppointment.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase">Hora</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedAppointment.hora}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase">Tipo</p>
                  <p className="mt-1 font-semibold text-slate-900 capitalize">{selectedAppointment.modalidad}</p>
                </div>
              </div>

              {selectedAppointment.status === 'Cancelada' && selectedAppointment.cancelReason && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-black uppercase text-red-700 mb-1">Cancelada por el estudiante</p>
                  <p className="text-sm text-red-800">{selectedAppointment.cancelReason}</p>
                </div>
              )}

              {selectedAppointment.modalidad === 'Virtual' && (
                <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-black uppercase text-sky-700 mb-2">Videollamada</p>
                  <p className="text-sm text-slate-700 mb-3">
                    {selectedAppointment.requestLink ? 'El paciente solicitó enlace de Google Meet.' : 'Cita virtual sin solicitud de enlace.'}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={meetingLinkDrafts[selectedAppointment.id] ?? selectedAppointment.meetingLink ?? ''}
                      onChange={(e) => setMeetingLinkDrafts(prev => ({ ...prev, [selectedAppointment.id]: e.target.value }))}
                      placeholder="Pega aquí el enlace de Google Meet"
                      className="w-full px-4 py-3 border border-sky-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.meetingLink ? (
                        <a
                          href={selectedAppointment.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-sky-700 border border-sky-200 rounded-xl text-sm font-semibold hover:bg-sky-50"
                        >
                          <CalendarIcon size={14} />
                          Abrir enlace
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleSaveMeetingLink(selectedAppointment.id)}
                        disabled={savingLinkIds.has(selectedAppointment.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 ${savingLinkIds.has(selectedAppointment.id) ? 'bg-slate-300 text-white cursor-wait' : 'bg-sky-600 text-white hover:bg-sky-700'} rounded-xl text-sm font-semibold`}
                      >
                        {savingLinkIds.has(selectedAppointment.id) ? 'Guardando...' : 'Guardar enlace'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedAppointment.motivo && (
                <div className="mt-4 rounded-2xl bg-white p-4 border-l-4 border-[#71A5D9] border border-slate-100">
                  <p className="text-xs font-black text-gray-600 uppercase mb-2">Motivo de la consulta</p>
                  <p className="text-sm text-gray-800 italic">{selectedAppointment.motivo}</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {selectedAppointment.status === 'Pendiente' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, 'Aceptada')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                    >
                      <CheckCircle size={16} />
                      Aceptar cita
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, 'Rechazada')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                    >
                      <XCircle size={16} />
                      Rechazar cita
                    </button>
                  </>
                )}
                {selectedAppointment.status !== 'Pendiente' && selectedAppointment.modalidad === 'Virtual' && (
                  <p className="text-xs text-slate-500 self-center">
                    Usa el campo superior para guardar o actualizar el enlace.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
