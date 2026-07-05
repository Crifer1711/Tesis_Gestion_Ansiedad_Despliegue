'use client';

import { useEffect, useRef, useState, useMemo } from 'react'; // ✅ Agregar useMemo
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { NotificationBell } from '@/presentation/components/common/NotificationBell';

interface PatientHeaderProps {
  activeSection?: string;
  onNavClick?: (section: string) => void;
  isModalOpen?: boolean;
}

export function PatientHeader({ 
  activeSection, 
  onNavClick, 
  isModalOpen = false
}: PatientHeaderProps) {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  
  const [displayRole, setDisplayRole] = useState('ESTUDIANTE');
  const [fullName, setFullName] = useState('Usuario');

  // ✅ useMemo para calcular el nombre completo SOLO cuando cambia la sesión
  const fullNameFromSession = useMemo(() => {
    if (!session?.user) return 'Usuario';
    const name = session.user.name || '';
    // @ts-ignore
    const lastName = session.user.lastname || '';
    return lastName ? `${name} ${lastName}` : name;
  }, [session?.user?.name, session?.user?.lastname]); // ✅ Dependencias específicas

  // ✅ Actualizar header cuando cambia la sesión
  useEffect(() => {
    if (status === 'unauthenticated') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('displayRole');
        localStorage.removeItem('fullName');
      }
      setDisplayRole('ESTUDIANTE');
      setFullName('Invitado');
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const checkAppointments = async () => {
        try {
          const res = await fetch(`/api/appointments?patientId=${session.user.id}`, {
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            const hasAccepted = Array.isArray(data) && data.some(
              (apt: any) => apt.status === 'Aceptada'
            );
            
            const role = session.user.role || 'PACIENTE';
            const newRole = role === 'PACIENTE' && hasAccepted ? 'PACIENTE' : 'ESTUDIANTE';
            
            // ✅ Usar fullNameFromSession en lugar de getFullNameFromSession()
            setDisplayRole(newRole);
            setFullName(fullNameFromSession);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('displayRole', newRole);
              localStorage.setItem('fullName', fullNameFromSession);
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      checkAppointments();
    }
  }, [session, status, fullNameFromSession]); // ✅ Agregar fullNameFromSession a dependencias

  // ✅ Recuperar de localStorage
  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('displayRole');
      const savedName = localStorage.getItem('fullName');
      if (savedRole) setDisplayRole(savedRole);
      if (savedName) setFullName(savedName);
    }
  }, [status]);

  // ✅ Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (status === 'authenticated') {
        if (e.key === 'displayRole' && e.newValue) {
          setDisplayRole(e.newValue);
        }
        if (e.key === 'fullName' && e.newValue) {
          setFullName(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [status]);

  useEffect(() => {
    if (isModalOpen) {
      setIsVisible(true);
      return;
    }

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
  }, [isModalOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link href="/dashboard/paciente" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="app-logo-badge patient-header-logo relative h-10 w-10 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-inner">
            <Image
              src="/images/Logo2.png"
              alt="MindPeace"
              fill
              className="app-logo-image object-contain"
              sizes="40px"
              priority
            />
          </div>
          <span className="text-3xl font-semibold tracking-tight text-white">
            MindPeace
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <NotificationBell compact />
          <div className="text-right">
            <p className="font-bold text-white text-sm">Hola, {fullName}</p>
            <p className="text-xs text-white/60 uppercase font-semibold tracking-wide">
              {displayRole}
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('displayRole');
                localStorage.removeItem('fullName');
              }
              signOut({ callbackUrl: '/' });
            }}
            className="patient-header-logout flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}