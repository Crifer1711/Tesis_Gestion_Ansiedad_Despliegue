"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export function PatientNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Inicio", href: "/dashboard/paciente" },
    { name: "Mis tareas", href: "/paciente/tareas" },
    { name: "Agendar citas", href: "/paciente/citas" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-blue-100 px-8 py-3 flex items-center justify-between font-sans">
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center">
          <Image src="/images/Logo.png" alt="Mindpeace Logo" width={50} height={50} className="rounded-full" />
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-tighter">Mindpeace</span>
        </div>

        <nav className="flex items-center bg-blue-50 rounded-lg p-1 border border-blue-100">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.name} className="flex items-center">
                <Link
                  href={link.href}
                  className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                    isActive ? "bg-blue-500 text-white font-bold shadow-sm" : "text-gray-600 hover:text-blue-800"
                  }`}
                >
                  {link.name}
                </Link>
                {index < navLinks.length - 1 && <div className="w-[1px] h-4 bg-gray-300 mx-2" />}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <span className="font-black text-gray-800 text-lg uppercase tracking-tight">Estudiante</span>
        <button className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors">
          <LogOut size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase">Salir</span>
        </button>
      </div>
    </header>
  );
}