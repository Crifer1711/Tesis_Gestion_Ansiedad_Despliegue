import Image from 'next/image';
import { scrollToIdWithOffset } from '@/presentation/utils/scrollWithOffset';

type HeroSectionProps = {
  variant?: 'public' | 'patient';
};

export function HeroSection({ variant = 'public' }: HeroSectionProps) {
  const isPatientView = variant === 'patient';

  const handleScrollToRecursos = () => {
    scrollToIdWithOffset('recursos', 100);
  };

  const handleScrollToInfo = () => {
    scrollToIdWithOffset('info', 100);
  };

  return (
    <section id="inicio" className="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <div className={`grid grid-cols-1 ${isPatientView ? '' : 'md:grid-cols-2'} gap-6 ${isPatientView ? 'text-center' : 'items-center'}`}>
        {/* Text Content */}
        <div className={isPatientView ? 'mx-auto max-w-3xl' : ''}>
          <div className="inline-flex items-center gap-2 bg-sky-100 text-[#1E4D8C] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Panel del paciente
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#1E4D8C] mb-4 leading-tight [font-family:Georgia,serif]">
            Tu bienestar emocional importa
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-400 to-[#71A5D9] rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed">
            Bienvenido a MindPeace, un espacio dedicado a la gestión de ansiedad en estudiantes universitarios. Encontrarás:
            <span className="block mt-3">• <strong>Infórmate:</strong> Información y educación sobre ansiedad y salud mental</span>
            <span className="block">• <strong>Recursos:</strong> Guías y herramientas para cuidar tu salud mental</span>
            {isPatientView ? (
              <>
                <span className="block mt-3 text-sky-700 font-semibold">En tu panel de navegación rápida encontrarás también:</span>
                <span className="block">• <strong>Agendar citas:</strong> Reserva citas con psicólogos según su disponibilidad</span>
                <span className="block">• <strong>Mis tareas:</strong> Revisa las tareas asignadas por tu psicólogo</span>
              </>
            ) : null}
            <span className="block mt-3">Si lo necesitas, podrás encontrar ayuda profesional de especialistas en salud mental.</span>
          </p>

          {!isPatientView && (
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
          )}
        </div>

        {/* Image - hidden in patient view */}
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
