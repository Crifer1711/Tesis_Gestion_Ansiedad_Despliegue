'use client'

import React, { createContext, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

const ConfirmContext = createContext<(opts?: ConfirmOptions) => Promise<boolean>>(() => Promise.resolve(false));

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<(v: boolean) => void>(() => {});

  const confirm = (opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    resolveRef.current(true);
    setOpen(false);
  };
  const handleCancel = () => {
    resolveRef.current(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {open && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg mb-2 font-bold text-black">{options.title || 'Confirmar'}</h3>
            <p className="mb-4 text-sm text-gray-700">{options.description || '¿Estás seguro?'}</p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancel} className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold">{options.cancelText || 'Cancelar'}</button>
              <button onClick={handleConfirm} className="px-5 py-2 rounded bg-red-600 text-white font-bold">{options.confirmText || 'Confirmar'}</button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
