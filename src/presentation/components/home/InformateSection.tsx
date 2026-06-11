'use client';

import { useState } from 'react';
import { Brain, FileText, Heart } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { InformateDetailModal } from './InformateDetailModal';

const INFO_CARDS = [
  {
    icon: <Brain size={56} />,
    title: 'Ansiedad',
    description: 'Entiende qué es la ansiedad, identifica sus síntomas y aprende estrategias inmediatas para manejarla en tu día a día.',
    buttonText: 'Más información →',
    path: '/ansiedad',
  },
  {
    icon: <Heart size={56} />,
    title: 'Salud mental',
    description: 'Reconoce signos de alerta, accede a recursos de apoyo y aprende cuándo buscar ayuda de un profesional de salud mental.',
    buttonText: 'Más información →',
    path: '/salud-mental',
  },
  {
    icon: <FileText size={56} />,
    title: 'Análisis personal',
    description: 'Completa el cuestionario GAD-7 para conocer tu nivel de ansiedad y obtener información valiosa sobre tu salud mental con recomendaciones personalizadas.',
    buttonText: 'Realizar test →',
    path: '/test',
  },
];

interface InformateSectionProps {
  description?: string;
  onModalChange?: (isOpen: boolean) => void;
}

export function InformateSection({ description, onModalChange }: InformateSectionProps = {}) {
  const [selectedCard, setSelectedCard] = useState<(typeof INFO_CARDS)[number] | null>(null);

  return (
    <section id="info" className="max-w-7xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-6 md:mb-8">
        <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Infórmate</h2>
        <div className="h-1 w-32 bg-[#71A5D9] rounded-full"></div>
        {description && (
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-slate-700">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {INFO_CARDS.map((card) => (
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
