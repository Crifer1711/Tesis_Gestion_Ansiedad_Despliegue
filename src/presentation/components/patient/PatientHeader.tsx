'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { NotificationBell } from '@/presentation/components/common/NotificationBell';

interface PatientHeaderProps {
  activeSection?: string;
  onNavClick?: (section: string) => void;
  userName?: string;
  userRole?: string;
}

export function PatientHeader({ activeSection, onNavClick, userName = 'Paciente', userRole = 'ESTUDIANTE' }: PatientHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md border-b-2 border-[#71A5D9]">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/dashboard/paciente" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="relative h-12 w-12">
            <Image 
              src="/images/Logo-.png" 
              alt="MindPeace" 
              fill 
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <span className="font-black text-xl text-[#1E4D8C]">MindPeace</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <NotificationBell compact />
          <div className="text-right">
            <p className="font-bold text-[#1E4D8C] text-sm">Hola, {userName}</p>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">{userRole}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-semibold"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
