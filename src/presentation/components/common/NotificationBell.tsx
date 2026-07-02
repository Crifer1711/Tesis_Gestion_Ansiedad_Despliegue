// src/presentation/components/common/NotificationBell.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, CheckSquare, Home, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type NotificationItem = {
  id: string;
  type: 'task' | 'appointment';
  title: string;
  message: string;
  created_at: string;
};

  type NotificationBadge = {
  text: string;
  color: string;
  Icon: typeof Calendar;
};

type Props = {
  compact?: boolean;
};

export function NotificationBell({ compact = false }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const storageKey = useMemo(() => {
    if (!session?.user?.id || !session?.user?.role) {
      return null;
    }
    return `notification-seen:${session.user.role}:${session.user.id}`;
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setSeenIds(new Set(parsed));
    } catch {
      setSeenIds(new Set());
    }
  }, [storageKey]);

  useEffect(() => {
    if (!session?.user?.role) return;

    let alive = true;

    const load = async () => {
      try {
        const res = await fetch('/api/notificaciones', { cache: 'no-store' });
        const data = await res.json();
        if (alive && res.ok && data.success) {
          setItems(data.data || []);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    load();
    const interval = setInterval(load, 20000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [session?.user?.role]);

  const unreadItems = useMemo(
    () => items.filter((item) => !seenIds.has(item.id)),
    [items, seenIds]
  );

  const unreadCount = unreadItems.length;

  const persistSeenIds = (nextSeenIds: Set<string>) => {
    setSeenIds(nextSeenIds);

    if (!storageKey || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(Array.from(nextSeenIds)));
    } catch {
      // Ignore storage failures.
    }
  };

  const markItemAsSeen = (itemId: string) => {
    if (seenIds.has(itemId)) {
      return;
    }

    const next = new Set(seenIds);
    next.add(itemId);
    persistSeenIds(next);
  };

  const getNotificationLink = (item: NotificationItem) => {
    if (item.type === 'appointment') {
      return '/paciente/citas';
    }
    if (item.type === 'task') {
      return '/paciente/tareas';
    }
    return '/paciente/citas';
  };

  const getNotificationBadge = (item: NotificationItem): NotificationBadge => {
    if (item.type === 'appointment') {
      return { text: 'Cita', color: 'text-blue-600 bg-blue-50', Icon: Calendar };
    }
    if (item.type === 'task') {
      return { text: 'Tarea', color: 'text-purple-600 bg-purple-50', Icon: CheckSquare };
    }
    return { text: 'General', color: 'text-gray-600 bg-gray-50', Icon: Bell };
  };

  return (
    <div className="notification-bell-root relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`relative flex items-center justify-center rounded-full border border-blue-200 bg-white text-[#1E4D8C] transition hover:bg-blue-50 ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
        aria-label="Notificaciones"
      >
        <Bell size={compact ? 18 : 20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell-panel absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl">
          {/* HEADER */}
          <div className="notification-bell-panel__header border-b border-blue-100 bg-[#EAF2FF] px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-black text-[#1E4D8C]">Notificaciones</p>
                <p className="text-[11px] text-slate-600">Tareas, citas aceptadas, rechazadas y enlaces</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="notification-bell-panel__quicklinks border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-purple-50/80 px-4 py-3">
            <p className="notification-bell-panel__quicklinks-label text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-blue-400"></span>
              Accesos rápidos
            </p>
            <div className="flex gap-2">
              <Link
                href="/paciente/citas"
                onClick={() => setOpen(false)}
                className="notification-bell-panel__quicklink notification-bell-panel__quicklink--citas flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition text-xs font-bold text-blue-700 shadow-sm flex-1 justify-center"
              >
                <Calendar size={14} />
                Citas
              </Link>
              <Link
                href="/paciente/tareas"
                onClick={() => setOpen(false)}
                className="notification-bell-panel__quicklink notification-bell-panel__quicklink--tasks flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition text-xs font-bold text-purple-700 shadow-sm flex-1 justify-center"
              >
                <CheckSquare size={14} />
                Tareas
              </Link>
              <Link
                href="/dashboard/paciente"
                onClick={() => setOpen(false)}
                className="notification-bell-panel__quicklink notification-bell-panel__quicklink--home flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-bold text-slate-600 shadow-sm flex-1 justify-center"
              >
                <Home size={14} />
                Inicio
              </Link>
            </div>
          </div>

          {/* LISTA DE NOTIFICACIONES */}
          <div className="notification-bell-panel__list max-h-64 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="notification-bell-panel__empty p-4 text-center text-sm text-slate-500">Sin notificaciones nuevas</div>
            ) : (
              items.map((item) => {
                const link = getNotificationLink(item);
                const badge = getNotificationBadge(item);
                const isSeen = seenIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={link}
                    onClick={() => {
                      markItemAsSeen(item.id);
                      setOpen(false);
                    }}
                    className={`notification-bell-panel__item mb-2 block w-full rounded-xl border px-3 py-3 text-left last:mb-0 transition ${
                      isSeen
                        ? 'border-slate-200 bg-slate-50/70 opacity-55 hover:bg-slate-50/80'
                        : 'border-[#71A5D9] bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm hover:border-[#1E4D8C] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isSeen ? 'text-slate-500' : 'text-[#103A73]'}`}>
                          {item.title}
                        </p>
                        <p className={`text-xs leading-relaxed ${isSeen ? 'text-slate-500' : 'text-slate-800'}`}>
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`notification-bell-badge inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
                            {(() => {
                              const BadgeIcon = badge.Icon;
                              return <BadgeIcon size={10} className="shrink-0" />;
                            })()}
                            {badge.text}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSeen ? 'text-slate-400' : 'text-[#1E4D8C]'}`}>
                            {isSeen ? 'Visto' : 'Nuevo'}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-300 group-hover:text-blue-500 transition text-xs">→</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}