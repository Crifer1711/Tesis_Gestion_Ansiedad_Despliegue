'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type NotificationItem = {
  id: string;
  type: 'task' | 'appointment';
  title: string;
  message: string;
  created_at: string;
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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`relative flex items-center justify-center rounded-full border border-blue-200 bg-white text-[#1E4D8C] transition hover:bg-blue-50 ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
        aria-label="Notificaciones"
      >
        <Bell size={compact ? 18 : 20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl">
          <div className="border-b border-blue-100 bg-[#EAF2FF] px-4 py-3">
            <p className="text-sm font-black text-[#1E4D8C]">Notificaciones</p>
            <p className="text-[11px] text-slate-600">Tareas asignadas y citas aceptadas</p>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">Sin notificaciones nuevas</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markItemAsSeen(item.id)}
                  className={`mb-2 w-full rounded-xl border px-3 py-3 text-left last:mb-0 transition ${seenIds.has(item.id)
                    ? 'border-slate-200 bg-slate-50/70 opacity-55 hover:bg-slate-50/80'
                    : 'border-[#71A5D9] bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm hover:border-[#1E4D8C] hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    {!seenIds.has(item.id) && (
                      <span className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${item.type === 'appointment' ? 'bg-blue-600' : 'bg-amber-600'}`} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${seenIds.has(item.id) ? 'text-slate-500' : 'text-[#103A73]'}`}>{item.title}</p>
                      <p className={`text-xs leading-relaxed ${seenIds.has(item.id) ? 'text-slate-500' : 'text-slate-800'}`}>{item.message}</p>
                      <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${seenIds.has(item.id) ? 'text-slate-400' : 'text-[#1E4D8C]'}`}>
                        {seenIds.has(item.id) ? 'Visto' : 'Nuevo'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {session?.user?.role === 'PACIENTE' && (
            <div className="border-t border-blue-100 bg-white px-4 py-3 text-right">
              <Link href="/paciente/tareas" className="text-xs font-bold text-[#1E4D8C] hover:underline">
                Ir a mis tareas
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}