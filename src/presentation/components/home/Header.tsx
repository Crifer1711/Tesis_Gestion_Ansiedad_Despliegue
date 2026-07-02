'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  activeSection: string;
  onNavClick: (section: string) => void;
}

export function Header({ activeSection, onNavClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md border-b-2 border-[#71A5D9]">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image 
              src="/images/Logo2.png" 
              alt="MindPeace" 
              fill 
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <span className="font-black text-xl text-[#1E4D8C]">MindPeace</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auth Links */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-[#1E4D8C] px-4 py-2 rounded-lg hover:bg-blue-100 transition">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-sm font-bold text-white bg-[#71A5D9] px-5 py-2 rounded-lg hover:bg-[#1E4D8C] shadow-lg transition">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

