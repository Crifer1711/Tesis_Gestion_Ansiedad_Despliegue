'use client';

import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: {
    subtitle: string;
    sections: Array<{
      heading: string;
      items: string[];
    }>;
  };
}

export function InformateDetailModal({ isOpen, onClose, title, content }: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-4 z-50 md:inset-20 bg-white rounded-2xl shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1E4D8C] to-[#71A5D9] text-white p-6 md:p-8 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-black">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={32} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          <p className="text-xl text-[#1E4D8C] font-bold mb-8">{content.subtitle}</p>

          <div className="space-y-8">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-2xl font-black text-[#1E4D8C] mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-[#71A5D9] rounded-full"></div>
                  {section.heading}
                </h3>
                <ul className="space-y-3 ml-4">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-lg">
                      <span className="text-[#71A5D9] font-bold text-xl mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 p-6 bg-blue-50 rounded-xl border-2 border-[#71A5D9]">
            <p className="text-slate-700 text-lg mb-4">
              ¿Necesitas ayuda profesional? Te recomendamos conectar con los especialistas en salud mental de nuestra plataforma.
            </p>
            <button className="px-6 py-3 bg-[#71A5D9] text-white font-bold rounded-lg hover:bg-[#1E4D8C] transition">
              Buscar ayuda profesional
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
