"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
// 1. Importamos los hooks de NextAuth
import { useSession, signOut } from "next-auth/react";

export function AdminNavbar() {
  const pathname = usePathname();
  // 2. Obtenemos los datos de la sesión (nombre de la DB)
  const { data: session } = useSession();

  const navLinks = [
    { name: "Inicio", href: "/dashboard/admin" },
    { name: "Psicólogos", href: "/dashboard/admin/psicologos" },
    { name: "Pacientes", href: "/dashboard/admin/pacientes" },
    { name: "Actividades", href: "/dashboard/admin/actividades" },
    { name: "Reportes", href: "/dashboard/admin/reportes" },
  ];

  // 3. Función para cerrar sesión
  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/", // Redirige al Home principal
      redirect: true 
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-blue-100 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center">
            <Image src="/images/Logo-.png" alt="Mindpeace Logo" width={50} height={50} className="rounded-full" />
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
                      isActive
                        ? "bg-blue-200 text-blue-900 font-bold"
                        : "text-gray-600 hover:text-blue-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {index < navLinks.length - 1 && (
                    <div className="w-[1px] h-4 bg-gray-300 mx-2" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Perfil y Salir */}
        <div className="flex items-center gap-6">
          {/* 4. Mostramos el nombre dinámico o un fallback si está cargando */}
          <span className="font-bold text-gray-700">
            {session?.user?.name || "Cargando..."}
          </span>
          
          {/* 5. Agregamos el onClick para salir */}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-bold">Salir</span>
          </button>
        </div>
      </header>
    </>
  );
}