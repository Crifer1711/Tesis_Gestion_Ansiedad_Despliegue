'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, Palette, UserPlus, X } from 'lucide-react';
import { InformateSection, RecursosSection } from '@/presentation/components/home';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';

export default function SaberMasPage() {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white [font-family:Inter,system-ui,sans-serif]">
      <nav className={`fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl transition-transform duration-300 ${isModalOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-inner">
              <Image
                src="/images/Logo-.png"
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
          </Link>

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

      <button
        type="button"
        onClick={() => setIsAccessibilityOpen(true)}
        aria-label="Abrir opciones de accesibilidad"
        className="fixed left-5 top-28 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg transition-colors hover:bg-sky-400"
      >
        <Palette className="h-6 w-6" aria-hidden="true" />
      </button>

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

      <main
        className="relative z-10 min-h-screen bg-cover bg-center pb-10 pt-28 text-slate-950"
        style={{
          backgroundImage:
            "url('https://www.visual-planning.com/es/wp-content/uploads/2021/05/Como-identificar-los-recursos-necesarios-para-el-exito-de-un-proyecto-Visual-Planning.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-white/88 backdrop-blur-[1px]" aria-hidden="true" />

        <div className="relative space-y-8 pt-8">
          <InformateSection description="Información y educación sobre ansiedad y salud mental" onModalChange={setIsModalOpen} />
        </div>
      </main>

      <footer className="relative z-10 bg-[#71A5D9] py-4 text-sm text-center">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-semibold text-[#1E4D8C]">© 2026 MindPeace • Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
