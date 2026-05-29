import { BookOpen, Play, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InfoCard } from '@/presentation/components/home/InfoCard';

const RESOURCE_CARDS = [
  {
    icon: <BookOpen size={56} />,
    title: 'Guías de autoayuda',
    description: 'Material práctico y verificado para manejar ansiedad académica, social y personal con estrategias probadas.',
    buttonText: 'Ver guías',
  },
  {
    icon: <Play size={56} />,
    title: 'Videos educativos',
    description: 'Contenido audiovisual sobre técnicas de respiración, atención plena y regulación emocional.',
    buttonText: 'Ver videos',
  },
  {
    icon: <Zap size={56} />,
    title: 'Técnicas rápidas',
    description: 'Estrategias de estabilización inmediata que puedes aplicar en momentos de ansiedad intensa para recuperar el control.',
    buttonText: 'Ver técnicas',
  },
];

export function PacienteRecursosSection() {
  const router = useRouter();

  return (
    <section id="recursos" className="bg-gradient-to-r from-[#dfe9f8] to-[#e8f1ff] py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6 md:mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Recursos</h2>
          <div className="h-1 w-32 bg-[#71A5D9] rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {RESOURCE_CARDS.map((card, index) => (
            <InfoCard 
              key={index} 
              {...card} 
              onButtonClick={
                index === 0 ? () => router.push('/paciente/biblioteca') :
                index === 1 ? () => router.push('/paciente/videos') :
                index === 2 ? () => router.push('/tecnicas-rapidas') :
                undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
