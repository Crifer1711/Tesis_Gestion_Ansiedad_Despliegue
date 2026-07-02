'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Palette, UserPlus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { InformateSection } from '@/presentation/components/home';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';
import { SessionProvider } from 'next-auth/react';
import AnsiedadPage from '@/app/ansiedad/page';
import SaludMentalPage from '@/app/salud-mental/page';
import TestPage from '@/app/test/page';

type ModalView = 'ansiedad' | 'salud-mental' | 'analisis' | null;

export default function SaberMasPage() {
  const router = useRouter();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>(null);

  const sections = [
    { id: 'ansiedad', label: 'Ansiedad', component: <AnsiedadPage /> },
    { id: 'salud-mental', label: 'Salud mental', component: <SaludMentalPage /> },
    { id: 'analisis', label: 'Análisis personal', component: <TestPage /> },
  ];

  const currentIndex = sections.findIndex(s => s.id === modalView);
  const currentSection = modalView ? sections[currentIndex] : null;

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!modalView) return;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % sections.length 
      : (currentIndex - 1 + sections.length) % sections.length;
    setModalView(sections[newIndex].id as ModalView);
  };

  const handleVolver = () => {
    setModalView(null);
    setIsModalOpen(false);
    router.push('/saber-mas');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className={`saber-mas-nav fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl transition-transform duration-300 ${isModalOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="app-logo-badge relative h-10 w-10 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-inner">
              <Image
                src="/images/Logo2.png"
                alt="MindPeace"
                fill
                className="app-logo-image object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-white">
              MindPeace
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/login"
              className="saber-mas-nav-btn saber-mas-nav-btn-login flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 md:px-6"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
            <Link
              href="/register"
              className="saber-mas-nav-btn saber-mas-nav-btn-register flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sky-500 md:px-6"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Crear Cuenta</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* BOTÓN ACCESIBILIDAD */}
      <button
        type="button"
        onClick={() => setIsAccessibilityOpen(true)}
        aria-label="Abrir opciones de accesibilidad"
        className="fixed left-5 top-28 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg transition-colors hover:bg-sky-400"
      >
        <Palette className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* PANEL ACCESIBILIDAD */}
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="saber-mas-main relative z-10 min-h-screen bg-cover bg-center pb-10 pt-28 text-slate-950"
        style={{
          backgroundImage:
            "url('https://www.visual-planning.com/es/wp-content/uploads/2021/05/Como-identificar-los-recursos-necesarios-para-el-exito-de-un-proyecto-Visual-Planning.jpg')",
        }}
      >
        <div className="saber-mas-overlay absolute inset-0 bg-white/88 backdrop-blur-[1px]" aria-hidden="true" />

        <div className="saber-mas-sections relative space-y-8 pt-8">
          <div className="mx-auto w-full max-w-7xl px-6">
            <Link
              href="/"
              className="saber-mas-home-back inline-flex items-center gap-2 rounded-xl bg-[#1d42fb] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#163bd1] hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>

          <InformateSection 
            description="Información y educación sobre ansiedad y salud mental"
            onModalChange={setIsModalOpen}
            onSectionClick={(section) => {
              setModalView(section as ModalView);
              setIsModalOpen(true);
            }}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="saber-mas-footer relative z-10 bg-[#71A5D9] py-4 text-sm text-center">
        <div className="mx-auto max-w-7xl px-5">
          <p className="saber-mas-footer-text font-semibold text-[#1E4D8C]">© 2026 MindPeace • Todos los derechos reservados</p>
        </div>
      </footer>

      {/* MODAL - BARRA DE NAVEGACIÓN SIN TÍTULO */}
      {modalView && currentSection && (
        <div className="saber-mas-modal fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen">
            {/* ✅ BARRA DE NAVEGACIÓN: SOLO BOTONES, SIN TÍTULO */}
            <div className="saber-mas-modal-header sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
              {/* ✅ Solo botón Volver a la izquierda */}
              <button
                onClick={handleVolver}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E4D8C] text-white font-bold hover:bg-[#163B6B] transition shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              {/* ✅ Solo botones Anterior/Siguiente a la derecha */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('prev')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <span className="text-xs font-bold text-slate-400 px-1">
                  {currentIndex + 1}/{sections.length}
                </span>
                <button
                  onClick={() => handleNavigate('next')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1E4D8C] text-white font-medium hover:bg-[#163B6B] transition"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CONTENIDO */}
            <SessionProvider>
              <div className="p-6">
                {currentSection.component}
              </div>
            </SessionProvider>
          </div>
        </div>
      )}
    </div>
  );
}
