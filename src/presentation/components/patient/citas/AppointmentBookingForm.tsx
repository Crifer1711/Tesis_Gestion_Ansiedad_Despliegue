'use client';

import type { Dispatch, FormEvent, MutableRefObject, SetStateAction } from 'react';
import { Calendar, CalendarDays, ChevronDown, Clock, Lock, Send, User } from 'lucide-react';
import { AppointmentFormData, Psicologo } from './types';
import { HORAS, MAX_MOTIVO_WORDS, countWords } from './utils';

type AppointmentBookingFormProps = {
  formData: AppointmentFormData;
  setFormData: Dispatch<SetStateAction<AppointmentFormData>>;
  psicologos: Psicologo[];
  loading: boolean;
  selectedPsychologistName: string;
  isPsychologistMenuOpen: boolean;
  setIsPsychologistMenuOpen: Dispatch<SetStateAction<boolean>>;
  psychologistSelectRef: MutableRefObject<HTMLDivElement | null>;
  dateInputRef: MutableRefObject<HTMLInputElement | null>;
  today: string;
  horasOcupadas: string[];
  openDatePicker: () => void;
  isHoraPasada: (fecha: string, hora: string) => boolean;
  motivoWords: number;
  enviando: boolean;
  horaSeleccionadaInvalida: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function AppointmentBookingForm({
  formData,
  setFormData,
  psicologos,
  loading,
  selectedPsychologistName,
  isPsychologistMenuOpen,
  setIsPsychologistMenuOpen,
  psychologistSelectRef,
  dateInputRef,
  today,
  horasOcupadas,
  openDatePicker,
  isHoraPasada,
  motivoWords,
  enviando,
  horaSeleccionadaInvalida,
  onSubmit,
}: AppointmentBookingFormProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#c7ddf8] bg-white shadow-[0_18px_35px_rgba(21,74,130,0.12)]">
      <div className="bg-gradient-to-r from-[#2f6ca9] via-[#4e8ecf] to-[#79b0e3] px-6 py-5 text-white md:px-8">
        <h2 className="text-2xl font-black">Solicitar nueva cita</h2>
        <p className="mt-1 text-sm text-white/90">Completa el formulario y confirma una hora disponible.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">
              <User size={16} className="mr-1 inline" />
              Psicólogo
            </label>
            <div ref={psychologistSelectRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPsychologistMenuOpen((prev) => !prev)}
                className="citas-field citas-select-trigger flex w-full items-center justify-between rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
                aria-haspopup="listbox"
                aria-expanded={isPsychologistMenuOpen}
                aria-label="Seleccionar psicólogo"
              >
                <span>{selectedPsychologistName || (loading ? 'Cargando psicólogos...' : psicologos.length === 0 ? 'No hay psicólogos disponibles' : 'Selecciona un/a psicólogo/a')}</span>
                <ChevronDown size={16} className={`transition-transform ${isPsychologistMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPsychologistMenuOpen && (
                <ul
                  role="listbox"
                  className="citas-select-menu absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-blue-100 bg-white p-1 shadow-xl"
                >
                  {psicologos.length === 0 ? (
                    <li className="citas-select-option px-3 py-2 text-sm">No hay psicólogos disponibles</li>
                  ) : (
                    psicologos.map((psicologo) => (
                      <li key={psicologo.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={formData.psicologo === psicologo.id}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, psicologo: psicologo.id }));
                            setIsPsychologistMenuOpen(false);
                          }}
                          className={`citas-select-option w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${formData.psicologo === psicologo.id ? 'citas-select-option--selected bg-blue-50 text-[#1E4D8C]' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          {psicologo.name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">
              <Calendar size={16} className="mr-1 inline" />
              Fecha
            </label>
            <div className="citas-date-wrapper relative">
              <input
                ref={dateInputRef}
                type="date"
                value={formData.fecha}
                onChange={(event) => setFormData((prev) => ({ ...prev, fecha: event.target.value }))}
                min={today}
                className="citas-field citas-date-field w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 pr-11 text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
              />
              <button
                type="button"
                onClick={openDatePicker}
                aria-label="Abrir calendario"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71A5D9]"
              >
                <CalendarDays size={16} className="citas-date-icon text-[#1E4D8C]" />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1E4D8C]">Modalidad</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Presencial', 'Virtual'] as const).map((modalidad) => {
                const isSelected = formData.modalidad === modalidad;
                return (
                  <label
                    key={modalidad}
                    className={`citas-modalidad-option ${isSelected ? 'citas-modalidad-option--selected' : ''} flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-sm font-semibold transition ${isSelected ? 'text-[#0f3f74]' : 'text-slate-700'}`}
                    style={{
                      borderColor: isSelected ? '#71A5D9' : '#d8e8f9',
                      background: isSelected ? '#ebf4ff' : '#f8fbff',
                    }}
                  >
                    <input
                      type="radio"
                      value={modalidad}
                      checked={isSelected}
                      onChange={(event) => setFormData((prev) => ({ ...prev, modalidad: event.target.value as AppointmentFormData['modalidad'] }))}
                      className="mr-2 h-4 w-4 accent-[#1E4D8C]"
                    />
                    {modalidad}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-600">
              Presencial: atencion en consultorio. 
            </p>
            <p className="mt-2 text-xs font-medium text-slate-600">
              Virtual: atencion por videollamada.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-[#f7fbff] p-4 md:p-5">
          <label className="mb-3 block text-sm font-bold text-[#1E4D8C]">
            <Clock size={16} className="mr-1 inline" />
            Selecciona una hora
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {HORAS.map((hora) => {
              const estaOcupada = horasOcupadas.includes(hora);
              const estaPasada = isHoraPasada(formData.fecha, hora);
              const estaInhabilitada = estaOcupada || estaPasada;
              return (
                <button
                  key={hora}
                  type="button"
                  onClick={() => !estaInhabilitada && setFormData((prev) => ({ ...prev, hora }))}
                  disabled={estaInhabilitada}
                  className={`citas-hour-slot ${formData.hora === hora ? 'citas-hour-slot--selected' : ''} ${estaPasada ? 'citas-hour-slot--past' : ''} ${estaOcupada ? 'citas-hour-slot--busy' : ''} rounded-lg border-2 px-2 py-2 text-sm font-bold transition ${
                    estaPasada
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : estaOcupada
                        ? 'cursor-not-allowed border-slate-300 bg-gray-200 text-gray-400 line-through'
                        : formData.hora === hora
                          ? 'border-[#1E4D8C] bg-[#71A5D9] text-white'
                          : 'border-[#89b7e8] bg-white text-[#1E4D8C] hover:bg-blue-50'
                  }`}
                >
                  {estaPasada ? <Clock size={13} className="mr-1 inline" /> : estaOcupada ? <Lock size={13} className="mr-1 inline" /> : null}
                  {hora}
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
            onChange={(event) => {
              const nextValue = event.target.value;
              if (countWords(nextValue) <= MAX_MOTIVO_WORDS) {
                setFormData((prev) => ({ ...prev, motivo: nextValue }));
              }
            }}
            placeholder="Describe brevemente lo que deseas tratar en la sesión..."
            rows={4}
            className="citas-field w-full resize-none rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#71A5D9] focus:bg-white"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Opcional, pero útil para orientar la sesión.</span>
            <span className={`${motivoWords > MAX_MOTIVO_WORDS ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{motivoWords}/{MAX_MOTIVO_WORDS}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando || !formData.psicologo || !formData.fecha || !formData.hora || horaSeleccionadaInvalida || motivoWords > MAX_MOTIVO_WORDS}
          className="citas-submit-btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f6ca9] to-[#1E4D8C] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:from-[#25588a] hover:to-[#163b68] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {enviando ? 'Agendando...' : 'Confirmar solicitud de cita'}
        </button>
      </form>
    </div>
  );
}