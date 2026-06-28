'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PatientFooter } from "@/presentation/components/patient/PatientFooter";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState('inicio');
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen flex flex-col bg-cover bg-fixed bg-center" style={{ backgroundImage: "url('/images/Login1-.png')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950/70" aria-hidden="true" />
      <main className="relative z-10 flex-1 pt-[72px]">{children}</main>
      <div className="relative z-10">
        <PatientFooter />
      </div>
    </div>
  );
}