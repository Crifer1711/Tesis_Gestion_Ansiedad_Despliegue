'use client';

import Image from 'next/image';
import { scrollToIdWithOffset } from '@/presentation/utils/scrollWithOffset';
import { Info, FolderOpen, Activity, Calendar, ChevronRight } from 'lucide-react';

type HeroSectionProps = {
  variant?: 'public' | 'patient';
  onNavigate?: (index: number) => void;
};

type QuickLink = {
  id: string;
  label: string;
  icon: React.ReactNode;
  sectionIndex: number;
  description: string;
  number: number;
};

export function HeroSection({ variant = 'public', onNavigate }: HeroSectionProps) {
  const isPatientView = variant === 'patient';

  const handleScrollToRecursos = () => {
    scrollToIdWithOffset('recursos', 100);
  };

  const handleScrollToInfo = () => {
    scrollToIdWithOffset('info', 100);
  };

  const quickLinks: QuickLink[] = [
    {
      id: 'informate',
      number: 1,
      label: 'Infórmate',
      icon: <Info className="w-5 h-5 inline mr-2 text-[#1E4D8C]" />,
      sectionIndex: 1,
      description: 'información y educación sobre ansiedad y salud mental'
    },
    {
      id: 'recursos',
      number: 2,
      label: 'Recursos',
      icon: <FolderOpen className="w-5 h-5 inline mr-2 text-[#1E4D8C]" />,
      sectionIndex: 2,
      description: 'acceso a guías y herramientas para cuidar tu salud mental'
    },
    {
      id: 'actividades',
      number: 3,
      label: 'Actividades',
      icon: <Activity className="w-5 h-5 inline mr-2 text-[#1E4D8C]" />,
      sectionIndex: 3,
      description: 'encontrarás actividades para la gestión de ansiedad'
    },
    {
      id: 'citas',
      number: 4,
      label: 'Citas',
      icon: <Calendar className="w-5 h-5 inline mr-2 text-[#1E4D8C]" />,
      sectionIndex: 4,
      description: 'agenda una cita con un profesional de la salud'
    }
  ];

  const handleNavigate = (index: number) => {
    if (onNavigate) {
      onNavigate(index);
    }
  };

  return (
    <section id="inicio" className="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <div className={`grid grid-cols-1 ${isPatientView ? '' : 'md:grid-cols-2'} gap-6 ${isPatientView ? 'text-center' : 'items-center'}`}>
        <div className={isPatientView ? 'mx-auto max-w-3xl w-full' : ''}>
          {!isPatientView && (
            <div className="inline-flex items-center gap-2 bg-sky-100 text-[#1E4D8C] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Bienestar emocional
            </div>
          )}

          {/* Logo centrado */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white p-1">
              <Image 
                src="/images/Logo-.png" 
                alt="MindPeace Logo" 
                fill 
                className="object-contain"
                sizes="(max-width: 768px) 64px, 80px"
                priority
              />
            </div>
          </div>

          {/* ✅ Título SIN fuente Georgia y SIN centrado forzado */}
          <h1 className="text-5xl md:text-6xl font-black text-[#1E4D8C] mb-4 leading-tight text-center">
            Tu bienestar emocional importa
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-400 to-[#71A5D9] rounded-full mx-auto mb-6" />

          {isPatientView ? (
            <div className="space-y-5">
              {/* ✅ TEXTO ALINEADO A LA IZQUIERDA */}
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium text-left">
                Bienvenido a MindPeace, un espacio dedicado a la gestión de ansiedad en estudiantes universitarios.
              </p>

              {/* ✅ ENLACES ALINEADOS A LA IZQUIERDA */}
              <div className="text-left space-y-3 mt-5">
                {quickLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavigate(link.sectionIndex)}
                    className="text-lg md:text-xl text-slate-800 hover:text-[#1E4D8C] transition-colors duration-200 w-full text-left cursor-pointer group flex items-start gap-3"
                  >
                    <span className="font-bold text-[#1E4D8C] group-hover:text-[#0f2a4f] text-lg md:text-xl min-w-[2rem] text-right">
                      {link.number}.
                    </span>
                    <span className="flex-1">
                      <span className="font-bold text-[#1E4D8C] group-hover:text-[#0f2a4f] transition-colors">
                        {link.icon}
                        {link.label}:
                      </span>
                      <span className="text-slate-800 group-hover:text-slate-900 transition-colors font-medium">
                        {' '}{link.description}
                      </span>
                    </span>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-300 group-hover:text-[#1E4D8C] transition-colors mt-0.5" />
                  </button>
                ))}
              </div>

              {/* ✅ TEXTO FINAL ALINEADO A LA IZQUIERDA */}
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium text-left mt-6">
                Si lo necesitas, podrás encontrar ayuda profesional de especialistas en salud mental.
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed text-left">
                Bienvenido a MindPeace, un espacio dedicado a la gestión de ansiedad en estudiantes universitarios. Encontrarás:
                <span className="block mt-3">• <strong>Infórmate:</strong> Información y educación sobre ansiedad y salud mental</span>
                <span className="block">• <strong>Recursos:</strong> Guías y herramientas para cuidar tu salud mental</span>
                <span className="block">• <strong>Actividades:</strong> Encontrarás actividades para la gestión de ansiedad</span>
                <span className="block">• <strong>Citas:</strong> Agenda una cita con un profesional de la salud</span>
                <span className="block mt-3">Si lo necesitas, podrás encontrar ayuda profesional de especialistas en salud mental.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleScrollToRecursos}
                  className="text-center px-8 py-4 bg-[#71A5D9] text-white font-bold text-lg rounded-xl hover:bg-[#1E4D8C] shadow-xl transition transform hover:scale-105"
                >
                  Explorar recursos
                </button>
                <button
                  onClick={handleScrollToInfo}
                  className="text-center px-8 py-4 bg-white border-2 border-[#71A5D9] text-[#1E4D8C] font-bold text-lg rounded-xl hover:bg-blue-50 shadow-lg transition"
                >
                  ¿Quieres conocer tu nivel de ansiedad?
                </button>
              </div>
            </>
          )}
        </div>

        {!isPatientView && (
          <div className="relative h-64 md:h-[22rem] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#71A5D9]">
            <Image 
              src="/images/home-ansiedad.png" 
              alt="Bienestar" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}