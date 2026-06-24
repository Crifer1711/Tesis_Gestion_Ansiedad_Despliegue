'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Link2, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VideollamadaPage() {
  const params = useParams<{ id: string }>();
  const appointmentId = params?.id || '';
  const roomUrl = useMemo(() => `${typeof window !== 'undefined' ? window.location.origin : ''}/videollamada/${appointmentId}`, [appointmentId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      toast.success('Enlace copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-sky-100 p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-sky-900">Sala virtual</h1>
            <p className="text-sm text-slate-600">Enlace interno de la plataforma para la cita {appointmentId}</p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 mb-4">
          <p className="text-xs font-bold uppercase text-sky-700 mb-2 flex items-center gap-2">
            <Link2 size={14} />
            Enlace de la sala
          </p>
          <p className="text-sm text-slate-700 break-all">{roomUrl}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
          >
            <Copy size={16} />
            Copiar enlace
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Este enlace es generado dentro del sistema. Si necesitas una reunión real en Google Meet, hace falta integración con Google.
        </p>
      </div>
    </div>
  );
}
