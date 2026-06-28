'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { GAD7Test } from '@/presentation/components/test';

export default function PacienteTestPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* ❌ ELIMINADO botón "Volver a Infórmate" */}
        <GAD7Test />
      </div>
    </div>
  );
}