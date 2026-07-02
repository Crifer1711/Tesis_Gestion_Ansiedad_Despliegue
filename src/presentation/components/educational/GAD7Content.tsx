'use client';

import { GAD7Test } from '@/presentation/components/test';

type GAD7ContentProps = {
  padded?: boolean;
};

export function GAD7Content({ padded = true }: GAD7ContentProps) {
  return (
    <div className={padded ? 'min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8' : 'min-h-screen bg-gradient-to-b from-blue-50 to-blue-100'}>
      <div className={padded ? 'max-w-4xl mx-auto px-6' : 'py-8'}>
        <div className={padded ? '' : 'max-w-4xl mx-auto px-6'}>
          <GAD7Test />
        </div>
      </div>
    </div>
  );
}