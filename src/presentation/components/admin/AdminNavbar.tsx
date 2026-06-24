'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function AdminNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 20) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/dashboard/admin' },
    { name: 'Psicólogos', href: '/dashboard/admin/psicologos' },
    { name: 'Pacientes', href: '/dashboard/admin/pacientes' },
    { name: 'Actividades', href: '/dashboard/admin/actividades' },
    { name: 'Reportes', href: '/dashboard/admin/reportes' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link href="/dashboard/admin" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-inner">
            <Image
              src="/images/Logo.png"
              alt="MindPeace"
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <span className="text-3xl font-semibold tracking-tight text-white [font-family:Georgia,serif]">
            MindPeace
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-semibold text-sm px-4 py-2 rounded-full transition ${
                  pathname === link.href
                    ? 'bg-white/25 text-white'
                    : 'text-white/70 hover:bg-white/15 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 ml-4">
            <div className="text-right">
              <p className="font-bold text-white text-sm">{session?.user?.name || 'Admin'}</p>
              <p className="text-xs text-white/60 uppercase font-semibold tracking-wide">ADMINISTRADOR</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/', redirect: true })}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
