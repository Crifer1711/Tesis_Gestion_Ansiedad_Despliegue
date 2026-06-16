'use client';

import { useState } from 'react';
import { BookOpen, Play, Zap } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { InformateDetailModal } from './InformateDetailModal';

const RESOURCE_CARDS = [
  {
    icon: <BookOpen size={56} />,
    title: 'Guías de autoayuda',
    description: 'Material práctico y verificado para manejar ansiedad académica, social y personal con estrategias probadas.',
    buttonText: 'Ver guías',
    path: '/biblioteca',
  },
  {
    icon: <Play size={56} />,
    title: 'Videos educativos',
    description: 'Contenido audiovisual sobre técnicas de respiración, atención plena y regulación emocional.',
    buttonText: 'Ver videos',
    path: '/videos',
  },
  {
    icon: <Zap size={56} />,
    title: 'Técnicas rápidas',
    description: 'Estrategias de estabilización inmediata que puedes aplicar en momentos de ansiedad intensa para recuperar el control.',
    buttonText: 'Ver técnicas',
    path: '/ansiedad#tecnicas',
  },
];

interface RecursosSectionProps {
  description?: string;
  transparent?: boolean;
  onModalChange?: (isOpen: boolean) => void;
}

export function RecursosSection({ description, transparent = false, onModalChange }: RecursosSectionProps = {}) {
  const [selectedCard, setSelectedCard] = useState<(typeof RESOURCE_CARDS)[number] | null>(null);

  return (
    <section
      id="recursos"
      className={`${transparent ? 'bg-transparent' : 'bg-gradient-to-r from-[#dfe9f8] to-[#e8f1ff]'} py-10 md:py-12`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6 md:mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Recursos</h2>
          <div className="h-1 w-32 bg-[#71A5D9] rounded-full"></div>
          {description && (
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-slate-700">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {RESOURCE_CARDS.map((card) => (
            <InfoCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              onButtonClick={() => {
              setSelectedCard(card);
              onModalChange?.(true);
            }}
            />
          ))}
        </div>
      </div>

      <InformateDetailModal
        isOpen={Boolean(selectedCard)}
        onClose={() => {
          setSelectedCard(null);
          onModalChange?.(false);
        }}
        title={selectedCard?.title ?? ''}
        src={selectedCard?.path ?? ''}
      />
    </section>
  );
}
