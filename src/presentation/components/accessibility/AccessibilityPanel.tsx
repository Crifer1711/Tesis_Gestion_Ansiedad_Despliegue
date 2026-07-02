'use client';
import { useEffect, useState } from 'react';
import { useAccessibility } from '@/presentation/context/AccessibilityContext';
import { Settings, Type, Palette, Scaling } from 'lucide-react';

export function AccessibilityPanel() {
  const { settings, setSettings } = useAccessibility();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  if (!mounted) return null;

  const panelButtonClass = (isActive: boolean, activeClass: string) =>
    `accessibility-panel-btn py-2 px-2 text-xs font-bold rounded-md border transition-all duration-200 ${
      isActive
        ? `${activeClass} border-transparent shadow-md`
        : 'accessibility-panel-btn--idle'
    }`;

  return (
    <div className="accessibility-panel mt-2 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Settings size={22} className="accessibility-panel-title-icon" />
        <h4 className="accessibility-panel-title text-lg font-black">
          Accesibilidad
        </h4>
      </div>
      <div className="accessibility-panel-divider mb-5 h-0.5 w-16 rounded-full"></div>

      <div className="space-y-6">
        <div>
          <label className="accessibility-panel-label mb-2 flex items-center gap-2 text-sm font-bold">
            <Palette size={16} className="opacity-90" /> Color de Pantalla
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => updateSetting('theme', 'light')}
              aria-pressed={settings.theme === 'light'}
              className={panelButtonClass(settings.theme === 'light', 'accessibility-panel-btn--active-light')}
            >Claro</button>
            <button 
              onClick={() => updateSetting('theme', 'dark')}
              aria-pressed={settings.theme === 'dark'}
              className={panelButtonClass(settings.theme === 'dark', 'accessibility-panel-btn--active-dark')}
            >Oscuro</button>
            <button 
              onClick={() => updateSetting('theme', 'high-contrast')}
              aria-pressed={settings.theme === 'high-contrast'}
              className={panelButtonClass(settings.theme === 'high-contrast', 'accessibility-panel-btn--active-contrast')}
            >Contraste</button>
          </div>
        </div>

        <div>
          <label className="accessibility-panel-label mb-2 flex items-center gap-2 text-sm font-bold">
            <Type size={16} className="opacity-90" /> Tipo de Letra
          </label>
          <select 
            value={settings.fontFamily}
            onChange={(e) => updateSetting('fontFamily', e.target.value)}
            className="accessibility-font-select w-full cursor-pointer rounded-md border border-slate-500 bg-slate-700 p-2.5 text-sm text-slate-100 outline-none transition-all focus:ring-2 focus:ring-yellow-300"
          >
            <option value="sans">Predeterminada</option>
            <option value="serif">Lectura (Serif)</option>
            <option value="dyslexic">OpenDyslexic</option>
          </select>
        </div>

        <div>
          <label className="accessibility-panel-label mb-2 flex items-center gap-2 text-sm font-bold">
            <Scaling size={16} className="opacity-90" /> Tamaño de Letra
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => updateSetting('fontSize', 'small')}
              aria-pressed={settings.fontSize === 'small'}
              className={panelButtonClass(settings.fontSize === 'small', 'accessibility-panel-btn--active-light')}
            >A-</button>
            <button 
              onClick={() => updateSetting('fontSize', 'medium')}
              aria-pressed={settings.fontSize === 'medium'}
              className={panelButtonClass(settings.fontSize === 'medium', 'accessibility-panel-btn--active-light')}
            >A</button>
            <button 
              onClick={() => updateSetting('fontSize', 'large')}
              aria-pressed={settings.fontSize === 'large'}
              className={panelButtonClass(settings.fontSize === 'large', 'accessibility-panel-btn--active-light')}
            >A+</button>
          </div>
        </div>

      </div>
    </div>
  );
}