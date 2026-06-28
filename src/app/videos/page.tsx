'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VideosEducativos } from '@/presentation/components/videos';
import { ArrowLeft } from 'lucide-react';
import { navigateAndScroll } from '@/presentation/utils/scrollWithOffset';

export default function VideosPage() {
  return (
    <Suspense fallback={<VideosLoading />}>
      <VideosContent />
    </Suspense>
  );
}

function VideosLoading() {
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100" />;
}

function VideosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModal = searchParams.get('modal') === '1';

  const handleHomeClick = () => {
    navigateAndScroll(router, '/#recursos', 'recursos', 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {!isModal && (
          <div className="mb-6">
          </div>
        )}
      </div>
      <VideosEducativos onHomeClick={handleHomeClick} />
    </div>
  );
}
