'use client';

import { Suspense } from 'react';
import { GAD7Content } from '@/presentation/components/educational/GAD7Content';

export default function TestPage() {
  return (
    <Suspense fallback={<TestLoading />}>
      <TestContent />
    </Suspense>
  );
}

function TestLoading() {
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100" />;
}

function TestContent() {
  return <GAD7Content />;
}