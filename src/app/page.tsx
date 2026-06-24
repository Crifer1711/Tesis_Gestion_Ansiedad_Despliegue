'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LogIn, Palette, UserPlus, X } from 'lucide-react';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';

const slides = [
  '/images/psico1.png',
  '/images/psico2.png',
  '/images/psico3.jpg',
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white [font-family:Inter,system-ui,sans-serif]">
      {/* ============ NAVBAR CORREGIDO (SIN DUPLICADOS) ============ */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-inner">
              <Image
                src="/images/Logo.png"
                alt="MindPeace"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-white [font-family:Georgia,serif]">
              MindPeace
            </div>
          </div>

          {/* ✅ SOLO UN BLOQUE DE BOTONES (ELIMINADO EL DUPLICADO) */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 md:px-6"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sky-500 md:px-6"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Crear Cuenta</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ SECCIÓN HERO ============ */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 to-slate-950/60" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pt-32 md:px-8">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-light leading-tight md:text-6xl">
              ¿Qué es <span className="text-sky-300 [font-family:Georgia,serif]">MindPeace</span>?
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-slate-200 md:text-xl">
              MindPeace es una plataforma para acompañarte en el proceso de comprender la ansiedad de manera práctica y accesible.
              Nuestro sistema te ayuda a conocer información acerca de la ansiedad, aprender técnicas, acceder a recursos educativos
              y conectar con profesionales para recibir seguimiento personalizado.
            </p>

            <p className="mb-12 text-slate-300">
              Tu bienestar y la confidencialidad de tus datos son nuestra prioridad, porque creemos que siempre es posible avanzar
              hacia una vida más tranquila y equilibrada.
            </p>

            <Link
              href="/saber-mas"
              className="group inline-flex items-center gap-3 rounded-xl bg-sky-500 px-10 py-4 text-base font-medium tracking-wider text-white transition-all duration-300 hover:bg-sky-400"
            >
              SABER MÁS
              <ArrowRight className="h-5 w-5 transition-transform group-active:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Indicadores del carrusel */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide}
              type="button"
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-sky-400' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============ BOTÓN DE ACCESIBILIDAD ============ */}
      <button
        type="button"
        onClick={() => setIsAccessibilityOpen(true)}
        aria-label="Abrir opciones de accesibilidad"
        className="fixed left-5 bottom-10 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg transition-colors hover:bg-sky-400"
      >
        <Palette className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* ============ PANEL DE ACCESIBILIDAD ============ */}
      {isAccessibilityOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Cerrar opciones de accesibilidad"
            onClick={() => setIsAccessibilityOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="relative h-full w-full max-w-sm overflow-y-auto border-r border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Accesibilidad</h2>
              <button
                type="button"
                onClick={() => setIsAccessibilityOpen(false)}
                aria-label="Cerrar panel"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <AccessibilityPanel />
          </aside>
        </div>
      )}

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#71A5D9] py-4 text-sm text-center">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-semibold text-[#1E4D8C]">© 2026 MindPeace • Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}