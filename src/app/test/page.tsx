'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GAD7Test } from '@/presentation/components/test';
import { ArrowLeft } from 'lucide-react';
import { navigateAndScroll } from '@/presentation/utils/scrollWithOffset';

export default function TestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModal = searchParams.get('modal') === '1';

  const handleHomeClick = () => {
    navigateAndScroll(router, '/#info', 'info', 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {!isModal && (
          <div className="mb-6">
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1E4D8C] font-semibold rounded-lg shadow-sm border border-[#71A5D9] hover:bg-[#71A5D9] hover:text-white transition"
            >
              <ArrowLeft size={18} /> Volver a Infórmate
            </button>
          </div>
        )}
        <GAD7Test onHomeClick={handleHomeClick} />
      </div>
    </div>
  );
}