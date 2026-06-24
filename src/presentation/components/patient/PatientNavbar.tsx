"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { LogOut, Bell, X, Calendar, CheckSquare, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function PatientNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks = [
    { name: "Inicio", href: "/dashboard/paciente" },
    { name: "Mis tareas", href: "/paciente/tareas" },
    { name: "Agendar citas", href: "/paciente/citas" },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notificaciones');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount((data.data || []).length);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    signOut({ redirect: true, callbackUrl: '/' });
  };

  // Función para determinar el enlace según el tipo de notificación
  const getNotificationLink = (notif: any) => {
    if (notif.type === 'appointment' || notif.id?.startsWith('apt-') || notif.id?.startsWith('link-')) {
      return '/paciente/citas';
    }
    if (notif.type === 'task' || notif.id?.startsWith('task-')) {
      return '/paciente/tareas';
    }
    return '/paciente/citas';
  };

  // Función para obtener el badge de tipo
  const getNotificationBadge = (notif: any) => {
    if (notif.type === 'appointment' || notif.id?.startsWith('apt-') || notif.id?.startsWith('link-')) {
      return { text: '📅 Cita', color: 'text-blue-600 bg-blue-50' };
    }
    if (notif.type === 'task' || notif.id?.startsWith('task-')) {
      return { text: '📋 Tarea', color: 'text-purple-600 bg-purple-50' };
    }
    return { text: '📌 General', color: 'text-gray-600 bg-gray-50' };
  };

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
        {/* 🔔 CAMPANITA DE NOTIFICACIONES */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-blue-50 transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-blue-800" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* PANEL DE NOTIFICACIONES */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* HEADER */}
              <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                <h3 className="font-bold text-gray-700 text-sm">Notificaciones</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 🔥 ACCESOS RÁPIDOS */}
              <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-400"></span>
                  Accesos rápidos
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/paciente/citas"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition text-xs font-bold text-blue-700 shadow-sm flex-1 justify-center"
                  >
                    <Calendar size={14} />
                    Citas
                  </Link>
                  <Link
                    href="/paciente/tareas"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition text-xs font-bold text-purple-700 shadow-sm flex-1 justify-center"
                  >
                    <CheckSquare size={14} />
                    Tareas
                  </Link>
                  <Link
                    href="/dashboard/paciente"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-bold text-slate-600 shadow-sm flex-1 justify-center"
                  >
                    <Home size={14} />
                    Inicio
                  </Link>
                </div>
              </div>

              {/* LISTA DE NOTIFICACIONES */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">🔔</div>
                    <p className="text-gray-500 text-sm font-medium">Sin notificaciones nuevas</p>
                    <p className="text-gray-400 text-xs mt-1">Las notificaciones aparecerán aquí</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const link = getNotificationLink(notif);
                    const badge = getNotificationBadge(notif);
                    return (
                      <Link
                        key={notif.id}
                        href={link}
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
                                {badge.text}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(notif.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-300 group-hover:text-blue-500 transition text-xs mt-1">→</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* FOOTER */}
              <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                <Link
                  href="/paciente/citas"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition hover:underline"
                >
                  Ver todas las notificaciones →
                </Link>
              </div>
            </div>
          )}
        </div>

        <span className="font-black text-gray-800 text-lg uppercase tracking-tight">Estudiante</span>
        <button 
          onClick={handleSignOut}
          className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase">Salir</span>
        </button>
      </div>
    </header>
  );
}