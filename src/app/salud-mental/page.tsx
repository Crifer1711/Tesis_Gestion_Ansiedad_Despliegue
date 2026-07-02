'use client';

import { Suspense } from 'react';
import { MentalHealthContent } from '@/presentation/components/educational/MentalHealthContent';

export default function SaludMentalPage() {
  return (
    <Suspense fallback={<SaludMentalLoading />}>
      <SaludMentalContent />
    </Suspense>
  );
}

function SaludMentalLoading() {
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100" />;
}

function SaludMentalContent() {
  return <MentalHealthContent />;
}