"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Emocion {
  nombre: string;
  categoria: string;
  color: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const EMOCIONES: {
  categoria: string;
  emoji: string;
  color: string;
  subs: string[];
}[] = [
  {
    categoria: "Ira",
    emoji: "😠",
    color: "#e11d74",
    subs: ["Amenazado", "Odioso", "Desquiciado", "Agresivo", "Frustrado"],
  },
  {
    categoria: "Disgusto",
    emoji: "🤢",
    color: "#ef4444",
    subs: ["Distante", "Crítico", "Desaprobado", "Decepcionado", "Terrible"],
  },
  {
    categoria: "Tristeza",
    emoji: "😢",
    color: "#16a34a",
    subs: ["Evasivo", "Culpable", "Ansioso", "Abandonado", "Desesperado"],
  },
  {
    categoria: "Miedo",
    emoji: "😨",
    color: "#9333ea",
    subs: ["Deprimido", "Solitario", "Aburrido", "Optimista", "Íntimo"],
  },
  {
    categoria: "Felicidad",
    emoji: "😊",
    color: "#ca8a04",
    subs: ["Pacífico", "Poderoso", "Aceptado", "Orgulloso", "Jubiloso"],
  },
  {
    categoria: "Sorpresa",
    emoji: "😲",
    color: "#2563eb",
    subs: ["Efusivo", "Asombrado", "Confundido", "Sorprendido", "Interesado"],
  },
  {
    categoria: "Humillado",
    emoji: "😔",
    color: "#ea580c",
    subs: ["Herido", "Rechazado", "Sumiso", "Inseguro", "Asustado"],
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  onConfirm: (emocion: Emocion) => void;
  onSkip: () => void;
  actividadNombre?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function EmotionWheelModal({ onConfirm, onSkip, actividadNombre }: Props) {
  const [activeCategoria, setActiveCategoria] = useState<string | null>(null);
  const [selected, setSelected]               = useState<Emocion | null>(null);

  const activaData = EMOCIONES.find((e) => e.categoria === activeCategoria);

  function pickCategoria(em: typeof EMOCIONES[number]) {
    setActiveCategoria(em.categoria);
    setSelected({ nombre: em.categoria, categoria: em.categoria, color: em.color });
  }

  function pickSub(sub: string, em: typeof EMOCIONES[number]) {
    setSelected({ nombre: sub, categoria: em.categoria, color: em.color });
  }

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(186,230,253,0.4)", backdropFilter: "blur(20px)" }}
    >
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position:"absolute", top:"-80px", left:"-80px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle,#38bdf8,transparent 70%)", filter:"blur(60px)", opacity:0.45 }} />
        <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle,#818cf8,transparent 70%)", filter:"blur(60px)", opacity:0.35 }} />
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(28px) saturate(1.8)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 24px 64px rgba(14,165,233,0.18), 0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-7 pt-6 pb-5 text-center"
          style={{ borderBottom: "1.5px solid rgba(186,230,253,0.5)" }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-3"
            style={{ background: "linear-gradient(90deg,#e0f2fe,#f0fdf4)", color: "#0369a1", border: "1px solid #bae6fd" }}
          >
            ✨ ¡Actividad completada!
          </span>

          <h2
            className="text-2xl font-black leading-tight"
            style={{ color: "#0c4a6e", fontFamily: "'Inter','Segoe UI',sans-serif" }}
          >
            ¿Cómo te sentiste?
          </h2>

          {actividadNombre && (
            <p className="text-sky-600 font-semibold text-sm mt-1">"{actividadNombre}"</p>
          )}
          <p className="text-slate-400 text-sm mt-1.5">
            Selecciona la emoción que mejor describe tu experiencia
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* ── Step 1: Category grid ── */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5"
              style={{ color: "#94a3b8" }}
            >
              Paso 1 — Elige una categoría
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {EMOCIONES.map((em) => {
                const active = activeCategoria === em.categoria;
                return (
                  <button
                    key={em.categoria}
                    onClick={() => pickCategoria(em)}
                    className="flex flex-col items-center gap-1 py-3 px-1 rounded-2xl text-center font-bold text-xs transition-all duration-200"
                    style={{
                      background: active ? em.color : "rgba(240,249,255,0.85)",
                      border: `2px solid ${active ? em.color : "#bae6fd"}`,
                      color: active ? (isLight(em.color) ? "#1e293b" : "white") : "#0369a1",
                      boxShadow: active ? `0 6px 20px ${em.color}50` : "none",
                      transform: active ? "translateY(-2px)" : "translateY(0)",
                    }}
                  >
                    <span className="text-2xl leading-none">{em.emoji}</span>
                    <span className="leading-tight" style={{ fontSize: "10px" }}>{em.categoria}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step 2: Sub-emotions table (visible only when a category is picked) ── */}
          <div
            style={{
              maxHeight: activaData ? "220px" : "0px",
              opacity: activaData ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s ease, opacity 0.25s ease",
            }}
          >
            {activaData && (
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5"
                  style={{ color: "#94a3b8" }}
                >
                  Paso 2 — Afina tu emoción en{" "}
                  <span style={{ color: activaData.color }}>{activaData.categoria}</span>
                </p>

                {/* Header row */}
                <div
                  className="grid grid-cols-5 gap-2 mb-2 rounded-xl p-2"
                  style={{ background: `${activaData.color}15`, border: `1.5px solid ${activaData.color}30` }}
                >
                  {/* Category badge on left */}
                  <div
                    className="col-span-1 flex flex-col items-center justify-center rounded-xl py-3 gap-1 font-black text-center text-xs"
                    style={{
                      background: activaData.color,
                      color: isLight(activaData.color) ? "#1e293b" : "white",
                      boxShadow: `0 4px 14px ${activaData.color}50`,
                    }}
                  >
                    <span className="text-2xl">{activaData.emoji}</span>
                    <span style={{ fontSize: "9px" }}>{activaData.categoria}</span>
                  </div>

                  {/* Sub-emotion cards */}
                  {activaData.subs.map((sub, idx) => {
                    const isSelected = selected?.nombre === sub;
                    // Gradient from solid to lighter across the 5 subs
                    const opacity = 1 - idx * 0.13;
                    return (
                      <button
                        key={sub}
                        onClick={() => pickSub(sub, activaData)}
                        className="flex flex-col items-center justify-center rounded-xl py-3 text-center font-bold transition-all duration-150"
                        style={{
                          background: isSelected
                            ? activaData.color
                            : `${activaData.color}${Math.round(opacity * 38).toString(16).padStart(2,"0")}`,
                          border: `2px solid ${isSelected ? activaData.color : `${activaData.color}55`}`,
                          color: isSelected
                            ? (isLight(activaData.color) ? "#1e293b" : "white")
                            : activaData.color,
                          fontSize: "11px",
                          boxShadow: isSelected ? `0 4px 16px ${activaData.color}45` : "none",
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Selected display ── */}
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${selected.color}12, ${selected.color}28)`
                : "rgba(240,249,255,0.7)",
              border: selected
                ? `2px solid ${selected.color}60`
                : "2px dashed #bae6fd",
              minHeight: "72px",
            }}
          >
            {selected ? (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow"
                  style={{ background: selected.color }}
                >
                  {EMOCIONES.find((e) => e.categoria === selected.categoria)?.emoji ?? "😐"}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-black text-lg leading-tight truncate"
                    style={{ color: "#0c4a6e", fontFamily: "'Inter','Segoe UI',sans-serif" }}
                  >
                    {selected.nombre}
                  </p>
                  {selected.nombre !== selected.categoria && (
                    <span
                      className="inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${selected.color}20`,
                        color: selected.color,
                        border: `1px solid ${selected.color}50`,
                      }}
                    >
                      {selected.categoria}
                    </span>
                  )}
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 text-sm font-medium w-full justify-center">
                <span className="text-2xl">👆</span>
                <span>Selecciona una categoría para continuar</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-7 py-4 flex items-center justify-between gap-4"
          style={{ borderTop: "1.5px solid rgba(186,230,253,0.5)" }}
        >
          <button
            onClick={onSkip}
            className="text-slate-400 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-sky-50 hover:text-sky-600"
          >
            Omitir
          </button>

          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`
                : "linear-gradient(135deg,#bae6fd,#e0f2fe)",
              color: selected
                ? (isLight(selected.color) ? "#1e293b" : "white")
                : "#0369a1",
              boxShadow: selected ? `0 8px 28px ${selected.color}44` : "none",
            }}
          >
            <span>✓</span>
            <span>Guardar emoción</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function isLight(hex: string): boolean {
  // Colors perceived as light that need dark text
  return ["#ca8a", "#eab3", "#fde0", "#fef9"].some((p) => hex.startsWith(p));
}
