'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  src: string;
}

export function InformateDetailModal({ isOpen, onClose, title, src }: DetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const [path, hash = ''] = src.split('#');
  const separator = path.includes('?') ? '&' : '?';
  const modalSrc = `${path}${separator}modal=1${hash ? `#${hash}` : ''}`;

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div className="absolute inset-3 overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl md:inset-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-white/10"
        >
          <X className="h-7 w-7" aria-hidden="true" />
        </button>

        <iframe
          src={modalSrc}
          title={title}
          className="h-full w-full bg-white"
        />
      </div>
    </div>,
    document.body
  );
}
