'use client';

import { Suspense } from 'react';
import { AnxietyContent } from '@/presentation/components/educational/AnxietyContent';

export default function AnsiedadPage() {
  return (
    <Suspense fallback={<AnsiedadLoading />}>
      <AnsiedadContent />
    </Suspense>
  );
}

function AnsiedadLoading() {
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100" />;
}

function AnsiedadContent() {
  return <AnxietyContent />;
}