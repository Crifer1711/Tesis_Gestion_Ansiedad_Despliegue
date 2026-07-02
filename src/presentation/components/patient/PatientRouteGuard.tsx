'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type PatientRouteGuardProps = {
  children: ReactNode;
};

export function PatientRouteGuard({ children }: PatientRouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  if (status !== 'authenticated' || !session) {
    return null;
  }

  return <>{children}</>;
}