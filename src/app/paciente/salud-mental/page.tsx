'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PacienteSaludMentalPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="salud-mental-page-shell min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* ❌ ELIMINADO botón "Volver a Infórmate" */}

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-black text-[#1E4D8C] mb-4">Salud Mental</h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Tu bienestar emocional es fundamental. Descubre los pilares para cuidar tu salud mental integral.
            </p>
          </div>

          {/* 5 Pilares */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">5 pilares de la salud mental</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { title: 'Sueño', image: '/images/educational/SaludMental-Sueño.jpg', desc: '7-8 horas de calidad para recuperarte' },
                { title: 'Actividad', image: '/images/educational/SaludMental-Actividad.jpg', desc: 'Movimiento físico regular' },
                { title: 'Conexiones', image: '/images/educational/SaludMental-Conexiones.jpg', desc: 'Relaciones significativas' },
                { title: 'Nutrición', image: '/images/educational/SaludMental-Nutricion.jpg', desc: 'Alimentación balanceada' },
                { title: 'Estrés', image: '/images/educational/SaludMental-Estre.jpg', desc: 'Gestión consciente del estrés' }
              ].map((pilar, i) => (
                <div key={i} className="bg-white rounded-lg border-2 border-[#71A5D9] overflow-hidden">
                  <div className="relative w-full h-56">
                    <Image
                      src={pilar.image}
                      alt={pilar.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-black text-[#1E4D8C] mb-2 text-lg">{pilar.title}</h3>
                    <p className="text-slate-700 text-base">{pilar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Señales y Estrategias */}
          <div className="mb-16">
            <h2 className="text-4xl font-black text-[#1E4D8C] mb-12 text-center">Reconoce y maneja tu bienestar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border-2 border-[#71A5D9] overflow-hidden">
                <div className="relative w-full h-76">
                  <Image
                    src="/images/educational/Señales-Alerta.jpg"
                    alt="Señales de Alerta"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black text-[#1E4D8C] mb-6">Señales de alerta</h3>
                  <p className="text-black text-base mb-6">Estos signos pueden indicar que necesitas prestar más atención a tu salud mental:</p>
                  <div className="bg-blue-50 rounded-lg p-6">
                    {[
                      'Cambios persistentes de humor, irritabilidad o tristeza sin razón aparente',
                      'Pérdida de interés en actividades que normalmente disfrutabas',
                      'Cambios en patrones de sueño (insomnio o somnolencia) o apetito',
                      'Aislamiento social o evitar contacto con amigos y familia',
                      'Pensamientos negativos recurrentes o autocrítica excesiva',
                      'Dificultad para concentrarse, recordar o tomar decisiones'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <div className="w-1.5 h-1.5 bg-[#71A5D9] rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-black text-base font-medium leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-[#71A5D9] overflow-hidden">
                <div className="relative w-full h-76">
                  <Image
                    src="/images/educational/Estrategias-bienestar.png"
                    alt="Estrategias de Bienestar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black text-[#1E4D8C] mb-6">Estrategias de bienestar</h3>
                  <p className="text-black text-base mb-6">Acciones prácticas que puedes implementar hoy para mejorar tu salud mental:</p>
                  <div className="bg-blue-50 rounded-lg p-6">
                    {[
                      'Practica respiración profunda 5 minutos diarios - calma el sistema nervioso',
                      'Realiza actividades que te traigan alegría o paz cada día',
                      'Mantén horarios consistentes para dormir y comer - estabiliza tu estado emocional',
                      'Busca conversaciones significativas con personas que te apoyan',
                      'Desafía pensamientos negativos cuestionando si son realmente ciertos',
                      'No dudes en consultar con un profesional de salud mental cuando sea necesario'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <div className="w-1.5 h-1.5 bg-[#71A5D9] rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-black text-base font-medium leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Construye Hábitos */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">Construye hábitos saludables</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Rutina diaria',
                  image: '/images/educational/Rutina-diaria.jpeg',
                  items: [
                    'Despierta y acuéstate a la misma hora',
                    'Establece horarios fijos para comidas',
                    'Reserva momentos para ti mismo',
                    'Duerme 7-8 horas cada noche'
                  ]
                },
                {
                  title: 'Autocuidado',
                  image: '/images/educational/Autocuidado.png',
                  items: [
                    'Mantén buena higiene personal',
                    'Realiza actividades que disfrutes',
                    'Practica técnicas de relajación',
                    'Descansa adecuadamente'
                  ]
                },
                {
                  title: 'Crecimiento personal',
                  image: '/images/educational/Crecimiento-personal.png',
                  items: [
                    'Aprende algo nuevo regularmente',
                    'Establece metas pequeñas y alcanzables',
                    'Celebra tus logros, grandes o pequeños',
                    'Practica la autocompasión'
                  ]
                }
              ].map((habito, i) => (
                <div key={i} className="bg-white rounded-lg border-2 border-[#71A5D9] overflow-hidden">
                  <div className="relative w-full h-56">
                    <Image
                      src={habito.image}
                      alt={habito.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-[#1E4D8C] mb-4 text-2xl text-center">{habito.title}</h3>
                    <div className="bg-blue-50 rounded-lg p-6">
                      {habito.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-3 py-2">
                          <div className="w-1.5 h-1.5 bg-[#1E4D8C] rounded-full mt-2.5 flex-shrink-0"></div>
                          <p className="text-black text-base font-medium leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cuándo buscar ayuda */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#1E4D8C] mb-8">Cuándo buscar ayuda profesional</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                'Los síntomas persisten más de 2 semanas sin mejoría',
                'Limitan tu desempeño en tus actividades diarias, trabajo o relaciones',
                'Experimentas pensamientos de autolesión o desesperanza'
              ].map((item, i) => (
                <div key={i} className="bg-blue-50 rounded-lg p-6 border-2 border-[#71A5D9] text-center">
                  <p className="text-black text-base font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}