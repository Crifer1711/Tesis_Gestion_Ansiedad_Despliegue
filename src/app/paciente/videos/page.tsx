'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { VideosEducativos } from '@/presentation/components/videos';

export default function PacienteVideosPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <VideosEducativos onHomeClick={() => {}} />
        </div>
      </div>
    </div>
  );
}