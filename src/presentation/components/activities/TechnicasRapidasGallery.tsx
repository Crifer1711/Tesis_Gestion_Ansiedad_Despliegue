'use client';

import { useMemo, useState } from 'react';
// 1. Añadimos ArrowLeft a los iconos
import { Zap, PlayCircle, Filter, X, ArrowLeft } from 'lucide-react';
// 2. Importamos Link de Next.js
import Link from 'next/link'; 
import { Activity } from '@/domain/dtos/activity.dto';

type Props = {
  activities: Activity[];
};

const categoryOptions = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Respiración', label: 'Respiración' },
  { value: 'Visualizacion', label: 'Visualización' },
  { value: 'Sonidos', label: 'Sonidos' },
  { value: 'Interaccion', label: 'Interactividad' },
] as const;

const accentByCategory: Record<string, string> = {
  'Respiración': 'from-sky-400 to-blue-500',
  'Visualizacion': 'from-blue-400 to-cyan-500',
  'Sonidos': 'from-indigo-400 to-sky-600',
  'Interaccion': 'from-cyan-400 to-blue-600',
  'Todos': 'from-sky-500 to-blue-600',
};

const categoryLabels: Record<string, string> = {
  'Respiración': 'Respiración',
  'Visualizacion': 'Visualización',
  'Sonidos': 'Sonidos',
  'Interaccion': 'Interactividad',
  'Todos': 'Todos',
};

export function TechnicasRapidasGallery({ activities }: Props) {
  const [category, setCategory] = useState<'Todos' | Activity['categoria']>('Todos');
  const [selected, setSelected] = useState<Activity | null>(null);

  const filtered = useMemo(() => {
    return activities.filter((activity) => category === 'Todos' ? true : activity.categoria === category);
  }, [activities, category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef6ff] via-white to-[#dfeeff]">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
        
        {/* 3. BOTÓN DE REGRESO AQUÍ */}
        <div className="mb-4">
          <Link 
            href="dashboard/paciente" 
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1E4D8C] shadow-sm transition hover:bg-blue-50 border border-blue-200 hover:shadow-md"
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </Link>
        </div>

        <div className="mb-8 rounded-[28px] border border-blue-200 bg-white/80 p-6 shadow-[0_10px_40px_rgba(30,77,140,0.10)] backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#1E4D8C]">
                <Zap size={14} /> Técnicas rápidas
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1E4D8C] leading-tight">Apoyos inmediatos para recuperar el control</h1>
              <p className="mt-3 text-base md:text-lg text-slate-700 leading-relaxed">
                Aquí encuentras actividades del sistema pensadas para practicar en momentos de ansiedad o tensión.
                Explora una técnica, ábrela y úsala cuando necesites un apoyo rápido para estabilizarte.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm border border-slate-200">
            <Filter size={16} /> Filtrar por categoría
          </div>
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              onClick={() => setCategory(item.value as any)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${category === item.value ? 'border-[#1E4D8C] bg-[#1E4D8C] text-white shadow-md' : 'border-blue-200 bg-white text-[#1E4D8C] hover:bg-blue-50'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white/70 p-12 text-center text-slate-600">
            No hay técnicas aprobadas en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((activity) => (
              <article
                key={activity.id}
                className="group overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-[0_12px_32px_rgba(30,77,140,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(30,77,140,0.16)]"
              >
                <div className={`h-36 bg-gradient-to-br ${accentByCategory[activity.categoria] || accentByCategory.Todos} p-6 text-white`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">{categoryLabels[activity.categoria] || activity.categoria}</div>
                      <h2 className="mt-4 text-2xl font-black leading-tight">{activity.nombre}</h2>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                      <PlayCircle size={30} />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setSelected(activity)}
                      className="flex-1 rounded-2xl bg-[#1E4D8C] px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#173d6f]"
                    >
                      Abrir técnica
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-6xl overflow-hidden rounded-[30px] border border-blue-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between border-b border-blue-100 bg-[#EAF2FF] px-6 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1E4D8C]">Técnica rápida</p>
                <h3 className="text-xl font-black text-[#1E4D8C]">{selected.nombre}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full bg-white p-2 text-[#1E4D8C] shadow-sm hover:bg-blue-50" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
              <div className="bg-gradient-to-b from-white to-blue-50 p-6 lg:p-8 lg:col-span-2">
                <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-sm">
                  {selected.embed_url ? (
                    <iframe
                      src={selected.embed_url}
                      title={selected.nombre}
                      className="h-[74vh] w-full rounded-2xl border-0"
                      allow="geolocation; microphone; camera; midi; encrypted-media; xr-spatial-tracking"
                    />
                  ) : (
                    <div className="flex h-[74vh] items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                      Esta técnica no tiene contenido embebido.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}