'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
// 1. IMPORTAMOS EL PANEL DE ACCESIBILIDAD AQUÍ
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';

interface NavigationSidebarProps {
  isPatient?: boolean;
  lastVisited?: string | null;
}

export function NavigationSidebar({ isPatient = false, lastVisited }: NavigationSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  // Determinar si es paciente basado en la sesión
  const isPacient = isPatient || session?.user?.role === 'PACIENTE';

  // Rutas - Los endpoints son diferentes para pacientes logueados
  const routes = {
    informate: [
      { id: 'ansiedad', label: 'Ansiedad', path: isPacient ? '/paciente/ansiedad' : '/ansiedad' },
      { id: 'salud-mental', label: 'Salud Mental', path: isPacient ? '/paciente/salud-mental' : '/salud-mental' },
      { id: 'analisis-personal', label: 'Análisis Personal', path: isPacient ? '/paciente/test' : '/test' },
    ],
    recursos: [
      { id: 'biblioteca', label: 'Guías de Autoayuda', path: isPacient ? '/paciente/biblioteca' : '/biblioteca' },
      { id: 'videos', label: 'Videos Educativos', path: isPacient ? '/paciente/videos' : '/videos' },
      { id: 'tecnicas', label: 'Técnicas Rápidas', path: '/tecnicas-rapidas' },
    ],
  };

  const sectionLabels: Record<string, string> = {
    inicio: 'Inicio',
    caracteristicas: 'Características',
    'que-es': '¿Qué es MindPeace?',
    info: 'Infórmate',
    recursos: 'Recursos',
    ansiedad: 'Ansiedad',
    'salud-mental': 'Salud Mental',
    'analisis-personal': 'Análisis Personal',
    biblioteca: 'Guías de Autoayuda',
    videos: 'Videos Educativos',
    tecnicas: 'Técnicas Rápidas',
  };

  const lastVisitedLabel = lastVisited ? sectionLabels[lastVisited] ?? lastVisited : null;

  // Ruta de inicio CORRECTA
  const inicioPath = isPacient ? '/dashboard/paciente' : '/#inicio';
  const isHomeContext = pathname === '/' || pathname === '/paciente' || pathname === '/dashboard/paciente';
  const scrollOffset = 96;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: 'smooth' });
      return true;
    }
    return false;
  };

  const handleInicioClick = () => {
    if (isHomeContext && scrollToSection('inicio')) {
      return;
    }

    if (pathname === '/paciente' || pathname === '/dashboard/paciente') {
      router.push('/dashboard/paciente');
      return;
    }

    router.push('/#inicio');
  };

  const handleInfoClick = () => {
    if (isHomeContext && scrollToSection('info')) {
      return;
    }

    router.push(isPacient ? '/dashboard/paciente#info' : '/#info');
  };

  const handleRecursosClick = () => {
    if (isHomeContext && scrollToSection('recursos')) {
      return;
    }

    router.push(isPacient ? '/dashboard/paciente#recursos' : '/#recursos');
  };

  const patientNavItems = [
    { id: 'inicio', label: 'Inicio', href: '/dashboard/paciente' },
    { id: 'tareas', label: 'Mis tareas', href: '/paciente/tareas' },
    { id: 'citas', label: 'Agendar citas', href: '/paciente/citas' },
  ];

  return (
    <nav className="space-y-6">
      {/* Inicio - solo en home público */}
      {!isPacient && (
        <div>
          <button
            type="button"
            onClick={handleInicioClick}
            className="inline-flex items-center rounded-lg bg-[#1E4D8C] px-5 py-3 text-base font-black text-white hover:bg-[#0f3468] transition-all duration-300 shadow-md"
          >
            Inicio
          </button>
        </div>
      )}

      {/* Visitado por última vez */}
      {lastVisitedLabel && (
        <div className="p-4 bg-white/20 backdrop-blur-sm border-l-4 border-blue-300 rounded-lg">
          <p className="text-xs font-black text-[#1E4D8C] uppercase tracking-wide mb-1">Visitado por última vez</p>
          <p className="text-base font-bold text-white leading-snug">{lastVisitedLabel}</p>
        </div>
      )}

      {/* Navegación paciente */}
      {isPacient && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
          <h4 className="text-lg font-black text-[#1E4D8C] mb-3">Navegación rápida</h4>
          <div className="h-0.5 w-12 bg-[#1E4D8C] rounded-full mb-4"></div>
          <ul className="space-y-2">
            {patientNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-semibold transition-all duration-200 text-white hover:bg-[#1E4D8C] hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Infórmate */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
        <button
          type="button"
          onClick={handleInfoClick}
          className="text-lg font-black text-[#1E4D8C] mb-3 text-left hover:underline"
        >
          Infórmate
        </button>
        <div className="h-0.5 w-12 bg-[#1E4D8C] rounded-full mb-4"></div>
        <ul className="space-y-2">
          {routes.informate.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-[#1E4D8C] hover:text-white transition-all duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recursos */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
        <button
          type="button"
          onClick={handleRecursosClick}
          className="text-lg font-black text-[#1E4D8C] mb-3 text-left hover:underline"
        >
          Recursos
        </button>
        <div className="h-0.5 w-12 bg-[#1E4D8C] rounded-full mb-4"></div>
        <ul className="space-y-2">
          {routes.recursos.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-[#1E4D8C] hover:text-white transition-all duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* 2. LLAMAMOS AL PANEL DE ACCESIBILIDAD AL FINAL DE LA BARRA LATERAL */}
      <AccessibilityPanel />
    </nav>
  );
}