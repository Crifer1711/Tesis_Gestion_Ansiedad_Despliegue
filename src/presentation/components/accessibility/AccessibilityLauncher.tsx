'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AccessibilityPanel } from '@/presentation/components/accessibility/AccessibilityPanel';
import { Palette, X } from 'lucide-react';

const routesWithLocalAccessibilityButton = ['/', '/saber-mas', '/dashboard/paciente'];

export function AccessibilityLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const shouldHide = useMemo(() => {
    return routesWithLocalAccessibilityButton.some((route) => pathname === route);
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isAdminDashboard = pathname.startsWith('/dashboard/admin');
  const isPsychologistDashboard = pathname.startsWith('/dashboard/psicologo');
  const isDenseDashboard = isAdminDashboard || isPsychologistDashboard;

  if (shouldHide || isAdminDashboard || isPsychologistDashboard) {
    return null;
  }

  return (
    <>
      <div className={`accessibility-launcher fixed z-[70] flex flex-col items-center gap-1 ${isPsychologistDashboard ? 'right-5 top-28' : 'left-5 top-28'}`}>
        {!isDenseDashboard && (
          <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
            Accesibilidad
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir opciones de accesibilidad"
          className="accessibility-fab flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg transition-colors hover:bg-sky-400"
        >
          <Palette className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Panel de accesibilidad">
          <button
            type="button"
            aria-label="Cerrar opciones de accesibilidad"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <aside className="relative h-full w-full max-w-sm overflow-y-auto border-r border-slate-500 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-black text-sky-300">Opciones de accesibilidad</h2>
              <button
                type="button"
                aria-label="Cerrar opciones de accesibilidad"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-sky-300 p-1 text-sky-300 transition hover:bg-sky-300 hover:text-slate-950"
              >
                <X size={16} />
              </button>
            </div>
            <AccessibilityPanel />
          </aside>
        </div>
      )}
    </>
  );
}
