'use client';

import { Calendar, Link2, Video, XCircle } from 'lucide-react';
import { Cita, HistoryFilter, AppointmentTab } from './types';
import { getEstadoColor, parseDate } from './utils';

type AppointmentListPanelProps = {
  activeTab: AppointmentTab;
  setActiveTab: (tab: AppointmentTab) => void;
  historyFilter: HistoryFilter;
  setHistoryFilter: (filter: HistoryFilter) => void;
  upcomingAppointments: Cita[];
  historyAppointments: Cita[];
  cancellingId: string | null;
  onOpenCancelDialog: (appointmentId: string) => void;
};

export function AppointmentListPanel({
  activeTab,
  setActiveTab,
  historyFilter,
  setHistoryFilter,
  upcomingAppointments,
  historyAppointments,
  cancellingId,
  onOpenCancelDialog,
}: AppointmentListPanelProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,70,128,0.10)] md:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-black text-[#1E4D8C]">Mis Citas</h2>
        <div className="inline-flex rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('proximas')}
            className={`citas-tab-btn ${activeTab === 'proximas' ? 'citas-tab-btn--active' : ''} px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'proximas' ? 'bg-[#71A5D9] text-white' : 'text-slate-600 hover:text-[#1E4D8C]'}`}
          >
            Próximas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`citas-tab-btn ${activeTab === 'historial' ? 'citas-tab-btn--active' : ''} px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'historial' ? 'bg-[#71A5D9] text-white' : 'text-slate-600 hover:text-[#1E4D8C]'}`}
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
              <AppointmentCard
                key={cita.id}
                cita={cita}
                cancellingId={cancellingId}
                onOpenCancelDialog={onOpenCancelDialog}
              />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-blue-100 bg-[#f5f9ff] px-4 py-3">
            <p className="text-sm text-slate-600">Aquí verás tus citas aceptadas y canceladas.</p>
            <select
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value as HistoryFilter)}
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
            historyAppointments.map((cita) => <AppointmentCard key={cita.id} cita={cita} />)
          )}
        </div>
      )}
    </div>
  );
}

type AppointmentCardProps = {
  cita: Cita;
  cancellingId?: string | null;
  onOpenCancelDialog?: (appointmentId: string) => void;
};

function AppointmentCard({ cita, cancellingId, onOpenCancelDialog }: AppointmentCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-5 hover:shadow-lg transition hover:border-[#71A5D9]">
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
            {cita.meetingLink ? 'Videollamada Google Meet' : 'Enlace pendiente'}
          </p>
          {cita.meetingLink ? (
            <a
              href={cita.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline break-all"
            >
              <Link2 size={14} />
              {onOpenCancelDialog ? 'Unirse a la sesión' : 'Abrir enlace'}
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
          <p className="text-sm text-rose-800 mt-1.5">La cita fue rechazada y no podrá continuar.</p>
        </div>
      )}

      {onOpenCancelDialog && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={cancellingId === cita.id}
            onClick={() => onOpenCancelDialog(cita.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <XCircle size={16} />
            {cancellingId === cita.id ? 'Cancelando...' : 'Cancelar cita'}
          </button>
        </div>
      )}
    </div>
  );
}