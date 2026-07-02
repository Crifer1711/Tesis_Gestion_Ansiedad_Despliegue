'use client';

import { XCircle } from 'lucide-react';
import { MAX_MOTIVO_WORDS, countWords } from './utils';

type CancelAppointmentDialogProps = {
  open: boolean;
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  cancellingId: string | null;
  cancelDialogId: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function CancelAppointmentDialog({
  open,
  cancelReason,
  onCancelReasonChange,
  cancellingId,
  cancelDialogId,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  if (!open) {
    return null;
  }

  return (
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
            onChange={(event) => {
              const nextValue = event.target.value;
              if (countWords(nextValue) <= MAX_MOTIVO_WORDS) {
                onCancelReasonChange(nextValue);
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
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!cancelReason.trim() || cancellingId === cancelDialogId}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  );
}