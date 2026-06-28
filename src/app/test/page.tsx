'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GAD7Test } from '@/presentation/components/test';

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <GAD7Test />
      </div>
    </div>
  );
}