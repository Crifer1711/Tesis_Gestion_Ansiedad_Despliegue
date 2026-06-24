"use client";
import React from 'react';
import { Users, Calendar, CheckCircle, Clock, Eye, PlusCircle, LucideIcon } from 'lucide-react';
import { 
  PsychologistDashboardDTO, 
  AppointmentDTO, 
  ActivityDTO 
} from "@/domain/dtos/psychologist-dashboard.dto";
import Link from 'next/link';

interface DashboardProps { 
  initialData: PsychologistDashboardDTO; 
}

export function PsychologistDashboard({ initialData }: DashboardProps) {
  const { stats, nextAppointments, recentActivities } = initialData;

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-4xl font-black text-[#1E4D8C]">Panel de Control</h1>
        <p className="text-slate-600 mt-2">Gestiona tus citas, pacientes y actividades</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Pacientes" 
          count={stats.totalPatients} 
          icon={Users}
          bgGradient="from-blue-100 to-blue-200"
          textColor="text-[#1E4D8C]"
        />
        <StatCard 
          title="Citas Pendientes" 
          count={stats.pendingAppointments} 
          icon={Clock}
          bgGradient="from-yellow-100 to-yellow-200"
          textColor="text-yellow-700"
        />
        <StatCard 
          title="Citas Aceptadas" 
          count={stats.acceptedAppointments} 
          icon={CheckCircle}
          bgGradient="from-green-100 to-green-200"
          textColor="text-green-700"
        />
        <StatCard 
          title="Citas de hoy" 
          count={stats.todayAppointments} 
          icon={Calendar}
          bgGradient="from-purple-100 to-purple-200"
          textColor="text-purple-700"
          hideSubtitle
        />
      </div>

      {/* PRÓXIMAS CITAS - Tabla */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
        <div className="p-4 bg-gray-100 border-b border-gray-300">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">Próximas Citas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {nextAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                    No hay citas agendadas
                  </td>
                </tr>
              ) : (
                nextAppointments.map((apt, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{apt.hora}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{apt.paciente}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{apt.tipo}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        {apt.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVIDADES - Tabla por paciente */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
        <div className="p-4 bg-gray-100 border-b border-gray-300">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">Actividades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actividades</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actividades Realizadas</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actividades Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                    No hay actividades asignadas
                  </td>
                </tr>
              ) : (
                recentActivities.map((act, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/psicologo/actividades/paciente/${act.estudianteId}`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{act.paciente}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{act.asignadas}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{act.realizadas}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        {act.pendientes}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div>
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/psicologo/pacientes">
            <QuickActionButton title="VER PACIENTES" icon={Eye} />
          </Link>
          <Link href="/dashboard/psicologo/actividades">
            <QuickActionButton title="ASIGNAR ACTIVIDADES" icon={PlusCircle} />
          </Link>
          <Link href="/dashboard/psicologo/citas">
            <QuickActionButton title="VER CITAS" icon={Calendar} />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  bgGradient: string;
  textColor: string;
  hideSubtitle?: boolean;
}

function StatCard({ title, count, icon: Icon, bgGradient, textColor, hideSubtitle }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-lg shadow-md border-2 border-white hover:shadow-lg transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">{title}</p>
          <p className={`text-4xl font-black ${textColor} mt-2`}>{count}</p>
        </div>
        <Icon size={32} className={textColor} />
      </div>
    </div>
  );
}

interface ActionBtnProps {
  title: string;
  icon: LucideIcon;
}

function QuickActionButton({ title, icon: Icon }: ActionBtnProps) {
  return (
    <button className="bg-gradient-to-br from-purple-100 to-purple-200 p-8 rounded-lg border-2 border-purple-300 flex flex-col items-center gap-3 hover:shadow-lg transition-all shadow-md hover:from-purple-200 hover:to-purple-300 group w-full">
      <Icon size={32} className="text-purple-700 group-hover:scale-110 transition-transform" />
      <span className="font-black text-purple-700 text-xs uppercase tracking-tighter text-center">{title}</span>
    </button>
  );
}