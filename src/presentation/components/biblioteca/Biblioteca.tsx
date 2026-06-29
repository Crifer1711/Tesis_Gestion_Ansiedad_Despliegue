'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GuideCardProps {
  title: string;
  image: string;
  url: string;
  resourceType?: string;
  onClick: (url: string, title: string) => void;
}
function GuideCard({ title, image, url, resourceType, onClick }: GuideCardProps) {
  const handleClick = () => {
    onClick(url, title);
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition duration-300 hover:shadow-xl relative"
    >
      <img src={image} alt={title} className="w-full h-96 object-cover" />
      {/* Resource type badge - visible on hover and on small screens */}
      {resourceType && (
        <div
          aria-hidden
          className="absolute top-4 right-4 z-30 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-sm font-semibold text-[#1E4D8C] px-3 py-1 rounded-full border border-[#dceffb] shadow"
        >
          {resourceType}
        </div>
      )}

      <div className="absolute inset-0 z-20 bg-[#71A5D9] bg-opacity-70 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <h4 className="text-white text-lg font-semibold text-center px-4">{title}</h4>
      </div>
    </div>
  );
}

const ACADEMIC_GUIDES = [
  {
    title: 'Manejo de ansiedad académica',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3Ak-TOyX1tOiXYnjEMYbLb35_7wiLpEzZAA&s',
    url: 'https://cada.udd.cl/files/2018/11/2.-A.pdf',
    resourceType: 'Guía',
  },
  {
    title: 'Guía para el estrés académico',
    image: 'https://psiconecta.org/wp-content/uploads/2023/05/Captura-de-Pantalla-2023-05-03-a-las-16.26.05.png',
    url: 'https://www.uv.es/iqdocent/guias/estres.pdf',
    resourceType: 'Guía',
  },
  {
    title: 'Taller de psicoeducación: la ansiedad',
    image: 'https://imgv2-1-f.scribdassets.com/img/document/772084007/original/f0e99f8c0c/1?v=1',
    url: 'https://www.plenainclusioncanarias.org/wp-content/uploads/2022/12/Taller-de-psicoeducacion.-La-ansiedad-Guia-de-actividades.pdf',
    resourceType: 'Guía',
  },
];

const SOCIAL_GUIDES = [
  {
    title: 'Ansiedad social: cómo superarla',
    image: 'https://claralopezpsicologia.com/wp-content/uploads/2024/10/ansiedad-social-portada.png',
    url: 'https://www.fundacionforo.com/uploads/pdfs/manual-tas.pdf', 
    resourceType: 'Guía',
  },
  {
    title: 'Competencia socioemocional: ansiedad social',
    image: 'https://upbility.es/cdn/shop/articles/Copy_of_5._9_9e7ebed4-e935-4354-9a19-ef134311a559.png?v=1742473431&width=1600',
    url: 'https://www.alcazarenformacion.es/wp-content/uploads/2024/07/GT_ansiedad-social_MCH.pdf', 
    resourceType: 'Guía',
  },
  {
    title: 'Timidez y fobia social: estrategias',
    image: 'https://itaepsicologia.com/wp-content/uploads/2018/07/blog-timidez-fobia-social.jpg',
    url: 'https://www.edesclee.com/img/cms/pdfs/9788433027115.pdf', 
    resourceType: 'Libro',
  },
];

const PERSONAL_GUIDES = [
  {
    title: 'Guías de autoayuda: depresión y ansiedad',
    image: 'https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/sites/default/files/styles/sas_200x/public/sincfiles/wsas-media-imagen_publicacion/2020/pub_567_1.jpg?itok=9zDGMg4D',
    url: 'https://consaludmental.org/publicaciones/Guiasautoayudadepresionansiedad.pdf',
    resourceType: 'Guía',
  },
  {
    title: 'Manejo integral de la ansiedad',
    image: 'https://www.espainun.com/wp-content/uploads/2024/02/ataques-de-ansiedad-768x768.jpg',
    url: 'https://semergen.es/files/docs/biblioteca/docConsultaRapida/2024/manejodelaAnsiedad.pdf',
    resourceType: 'Artículo',
  },
  {
    title: 'Cómo controlar la ansiedad en tu vida',
    image: 'https://img.freepik.com/vector-premium/persona-siente-derrotada-abrumada-mientras-lucha-encontrar-paz-medio-caos-emocional_216520-131353.jpg?semt=ais_incoming&w=740&q=80',
    url: 'https://www.osakidetza.euskadi.eus/contenidos/informacion/salud_mental/es_4050/adjuntos/ansiedadComoControlarla_c.pdf',
    resourceType: 'Guía',
  },
];

export function Biblioteca({ onHomeClick }: { onHomeClick: () => void }) {
  const [selectedPdf, setSelectedPdf] = useState<{ url: string, title: string } | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleOpenPdf = (url: string, title: string) => {
    setIsPdfLoading(true);
    // Usamos el visor de Google Docs para evitar bloqueos por X-Frame-Options de sitios externos
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    setSelectedPdf({ url: viewerUrl, title });
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-[#1E4D8C] mb-4">Guía de Autoayuda</h1>
        <p className="text-xl text-slate-700">Recursos prácticos y verificados para manejar ansiedad, depresión y mejorar tu salud mental.</p>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">Área académica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ACADEMIC_GUIDES.map((guide, index) => (
            <GuideCard key={index} {...guide} onClick={handleOpenPdf} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">Área social</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SOCIAL_GUIDES.map((guide, index) => (
            <GuideCard key={index} {...guide} onClick={handleOpenPdf} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">Área personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PERSONAL_GUIDES.map((guide, index) => (
            <GuideCard key={index} {...guide} onClick={handleOpenPdf} />
          ))}
        </div>
      </section>

      {/* Modal to open PDF */}
      {selectedPdf && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-2 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] md:max-w-[90vw] lg:max-w-6xl h-[95vh] md:h-[90vh] overflow-hidden flex flex-col border border-[#71A5D9]">
            <div className="bg-[#D1E7FF] text-gray-800 px-6 py-4 flex items-center justify-between border-b border-[#71A5D9] flex-shrink-0">
              <h3 className="font-black text-xl text-[#1E4D8C] truncate pr-4">{selectedPdf.title}</h3>
              <button 
                onClick={handleClosePdf} 
                className="text-[#1E4D8C] bg-white/50 hover:bg-white p-2 rounded-full font-bold transition flex items-center justify-center w-9 h-9 flex-shrink-0 shadow-sm"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 w-full relative bg-slate-100">
              {isPdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#1E4D8C] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#1E4D8C] font-bold">Cargando documento...</p>
                  </div>
                </div>
              )}
              <iframe 
                src={selectedPdf.url} 
                className="absolute inset-0 w-full h-full border-0" 
                onLoad={() => setIsPdfLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}