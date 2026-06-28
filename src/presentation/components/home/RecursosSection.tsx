'use client';

import { BookOpen, Play } from 'lucide-react';
import { InfoCard } from './InfoCard';

type RecursosSectionProps = {
  description?: string;
  transparent?: boolean;
  onModalChange?: (isOpen: boolean) => void;
  onSectionClick?: (section: string) => void;
};

const RESOURCE_CARDS = [
  {
    id: 'biblioteca',
    icon: <BookOpen size={56} />,
    title: 'Guías de autoayuda',
    description: 'Material práctico y verificado para manejar ansiedad académica, social y personal con estrategias probadas.',
    buttonText: 'Ver guías',
  },
  {
    id: 'videos',
    icon: <Play size={56} />,
    title: 'Videos educativos',
    description: 'Contenido audiovisual sobre técnicas de respiración, atención plena y regulación emocional.',
    buttonText: 'Ver videos',
  },
];

export function RecursosSection({ 
  description, 
  transparent = false, 
  onModalChange, 
  onSectionClick 
}: RecursosSectionProps = {}) {

  const handleCardClick = (cardId: string) => {
    if (onSectionClick) {
      onSectionClick(cardId);
      onModalChange?.(true);
    }
  };

  return (
    <section id="recursos" className="max-w-7xl mx-auto px-6 py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Recursos</h2>
        <div className="h-1 w-32 bg-[#71A5D9] rounded-full"></div>
        {description && description.trim() !== "" && (
          <p className="mt-3 max-w-3xl text-base md:text-lg font-medium leading-relaxed text-slate-700">
            {description}
          </p>
        )}
      </div>

      {/* ✅ CENTRADO - MISMO ESTILO QUE INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        {RESOURCE_CARDS.map((card) => (
          <InfoCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            onButtonClick={() => {
              handleCardClick(card.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}