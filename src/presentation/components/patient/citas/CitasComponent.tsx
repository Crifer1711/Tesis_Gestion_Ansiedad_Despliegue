'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Send, CheckCircle, Lock, X } from 'lucide-react';
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
  const [notificacionCerrada, setNotificacionCerrada] = useState<Set<string>>(new Set());

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
            estado: apt.status as 'Pendiente' | 'Aceptada' | 'Cancelada',
          }));
          setCitasAgendadas(citasFormateadas);
          
          // Notificar si hay nuevas citas Aceptadas (y no fueron cerradas por el usuario)
          const citasAceptadas = citasFormateadas.filter(c => c.estado === 'Aceptada');
          if (citasAceptadas.length > 0 && !notificacionCerrada.has(citasAceptadas[0].id)) {
            showAcceptedToast(citasAceptadas[0]);
          }
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
  }, [session?.user?.id, notificacionCerrada]);

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
        const horas = data
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

  // Mostrar toast personalizado cuando una cita es aceptada
  const showAcceptedToast = (cita: Cita) => {
    if (!cita) return;

    const id = toast.custom((t) => (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-500 text-blue-700 px-5 py-4 rounded-lg flex items-start gap-3 shadow-lg">
        <CheckCircle size={22} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <div className="flex-1">
          <p className="font-bold text-base">🎉 ¡Cita Aceptada!</p>
          <p className="text-sm mt-1.5 text-blue-600">{
            `El psicólogo ${cita.psicologo} ha aceptado tu cita para el ${parseDate(cita.fecha).toLocaleDateString('es-ES')} a las ${cita.hora}`
          }</p>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            setNotificacionCerrada(prev => new Set([...prev, cita.id]));
          }}
          className="flex-shrink-0 p-2 hover:bg-blue-200 rounded-lg transition text-blue-500 hover:text-blue-700"
          aria-label="Cerrar notificación"
        >
          <X size={20} className="text-current" />
        </button>
      </div>
    ), { duration: 7000 });

    // auto-marcar como cerrada al expirar
    setTimeout(() => setNotificacionCerrada(prev => new Set([...prev, cita.id])), 7000);
    return id;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1E4D8C] mb-2">Agendar Cita</h1>
          <p className="text-slate-600 text-lg">Selecciona un psicólogo y un horario disponible entre las 07:00 y 18:00 horas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 sticky top-24">
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
                    min={new Date().toISOString().split('T')[0]}
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
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => !estaOcupada && setFormData({ ...formData, hora: h })}
                            disabled={estaOcupada}
                            className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                              estaOcupada
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed line-through'
                                : formData.hora === h
                                ? 'bg-[#71A5D9] text-white border-[#1E4D8C]'
                                : 'bg-white text-[#1E4D8C] border-[#71A5D9] hover:bg-blue-50'
                            }`}
                          >
                            {estaOcupada ? <Lock size={14} className="inline mr-1" /> : null}
                            {h}
                          </button>
                        );
                      })}
                    </div>
                    {horasOcupadas.length > 0 && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <Lock size={12} />
                        Horas tachadas: no disponibles
                      </p>
                    )}
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
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-bold text-[#1E4D8C] mb-2">Motivo de la Consulta (Opcional)</label>
                  <textarea
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Cuéntale al psicólogo por qué deseas esta cita..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A5D9] text-sm text-gray-800 font-medium resize-none placeholder-gray-500 bg-white"
                  />
                </div>

                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={enviando || !formData.psicologo || !formData.fecha || !formData.hora}
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
            <h2 className="text-2xl font-black text-[#1E4D8C]">Mis Citas</h2>

            {/* Las notificaciones de cita ahora se muestran con react-hot-toast */}

            {/* LISTA DE CITAS */}
            {citasAgendadas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <Calendar size={52} className="mx-auto text-slate-300 mb-4" />
                <p className="text-gray-700 text-base font-semibold">No hay citas agendadas</p>
                <p className="text-gray-500 text-sm mt-2">Agenda tu primera cita llenando el formulario</p>
              </div>
            ) : (
              <div className="space-y-4">
                {citasAgendadas.map((cita) => (
                  <div
                    key={cita.id}
                    className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-5 hover:shadow-lg transition hover:border-[#71A5D9]"
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

                    {cita.motivo && cita.motivo !== 'Sin especificar' && (
                      <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-gray-500 uppercase">Motivo</p>
                        <p className="text-sm text-gray-700 mt-1.5">{cita.motivo}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
