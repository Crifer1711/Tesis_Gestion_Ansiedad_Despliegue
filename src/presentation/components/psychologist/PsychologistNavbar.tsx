// src/presentation/components/psychologist/PsychologistNavbar.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function PsychologistNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { id: 'inicio', label: 'Inicio', href: '/dashboard/psicologo' },
    { id: 'pacientes', label: 'Mis Pacientes', href: '/dashboard/psicologo/pacientes' },
    { id: 'asignar', label: 'Asignar', href: '/dashboard/psicologo/actividades' },
    { id: 'citas', label: 'Citas', href: '/dashboard/psicologo/citas' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md border-b-2 border-[#71A5D9]">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/dashboard/psicologo" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="relative h-12 w-12">
            <Image 
              src="/images/Logo.png" 
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
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`font-semibold text-sm px-4 py-2 rounded-full transition ${
                  pathname === item.href
                    ? 'bg-[#71A5D9] text-white'
                    : 'text-[#1E4D8C] hover:bg-blue-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="w-px h-6 bg-[#d0e4fc] mx-1"></div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1E4D8C]">{session?.user?.name || 'Psicólogo'}</p>
              <p className="text-xs text-slate-500 font-bold">PSICÓLOGO</p>
            </div>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="flex items-center gap-2 text-sm font-bold text-white bg-[#71A5D9] px-4 py-2 rounded-lg hover:bg-[#1E4D8C] shadow-lg transition"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}