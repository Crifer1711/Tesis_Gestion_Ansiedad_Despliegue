'use client';

import { Brain, FileText, Heart } from 'lucide-react';
import { InfoCard } from './InfoCard';

const INFO_CARDS = [
  {
    id: 'ansiedad',
    icon: <Brain size={56} />,
    title: 'Ansiedad',
    description: 'Entiende qué es la ansiedad, identifica sus síntomas y aprende estrategias inmediatas para manejarla en tu día a día.',
    buttonText: 'Más información →',
  },
  {
    id: 'salud-mental',
    icon: <Heart size={56} />,
    title: 'Salud mental',
    description: 'Reconoce signos de alerta, accede a recursos de apoyo y aprende cuándo buscar ayuda de un profesional de salud mental.',
    buttonText: 'Más información →',
  },
  {
    id: 'analisis',
    icon: <FileText size={56} />,
    title: 'Análisis personal',
    description: 'Completa el cuestionario GAD-7 para conocer tu nivel de ansiedad y obtener información valiosa sobre tu salud mental con recomendaciones personalizadas.',
    buttonText: 'Realizar test →',
  },
];

interface InformateSectionProps {
  description?: string;
  onModalChange?: (isOpen: boolean) => void;
  onSectionClick?: (sectionId: string) => void;
}

export function InformateSection({ 
  description = "Información y educación sobre ansiedad y salud mental", 
  onModalChange, 
  onSectionClick 
}: InformateSectionProps = {}) {

  const handleCardClick = (cardId: string) => {
    if (onSectionClick) {
      onSectionClick(cardId);
      onModalChange?.(true);
    }
  };

  return (
    <section id="info" className="max-w-7xl mx-auto px-6 py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-4xl md:text-5xl font-black text-[#1E4D8C] mb-2">Infórmate</h2>
        <div className="h-1 w-32 bg-[#71A5D9] rounded-full"></div>
        {/* ✅ SOLO mostrar descripción si existe y no está vacía */}
        {description && description.trim() !== "" && (
          <p className="mt-3 max-w-3xl text-base md:text-lg font-medium leading-relaxed text-slate-700">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {INFO_CARDS.map((card) => (
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