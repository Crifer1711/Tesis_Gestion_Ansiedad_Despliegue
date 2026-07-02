import { Users, UserRound, GraduationCap, ClipboardList } from "lucide-react";
import { getAdminDashboardUseCase } from "@/application/use-cases/get-admin-dashboard.use-case";
import Link from "next/link";

export async function AdminDashboard() {
  // Obtenemos los datos reales de PostgreSQL
  const data = await getAdminDashboardUseCase();

  return (
  <div className="admin-dashboard-page admin-dashboard-shell max-w-7xl mx-auto space-y-12 pt-12 pb-12 px-6">
      
      {/* 1. TARJETAS CON DATOS REALES */}
      <div className="admin-dashboard-stats grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Usuarios" count={data.stats.usuarios.toString()} icon={<Users />} color="bg-[#D4EDDA]" />
        <StatCard title="Psicólogos" count={data.stats.psicologos.toString()} icon={<UserRound />} color="bg-[#F8D7DA]" />
        <StatCard title="Estudiantes" count={data.stats.estudiantes.toString()} icon={<GraduationCap />} color="bg-[#E2D9F3]" />
        <StatCard title="Citas" count={data.stats.citas.toString()} icon={<ClipboardList />} color="bg-[#FFF3CD]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. PANEL DE CONTROL */}
        <div className="admin-dashboard-control-panel lg:col-span-2 bg-gray-200/50 rounded-3xl p-8 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-center mb-8 uppercase text-gray-800">Panel de Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlBox title="Gestión Psicólogos" desc="Lista de Psicólogos registrados, estado (activo/inactivo), crear, editar o eliminar " btnLabel="Gestionar Psicólogos" href="/dashboard/admin/psicologos" />
            <ControlBox title="Actividades" desc="Gestionar actividades terapéuticas (ejercicios de respiración, visualizaciones, etc.)" btnLabel="Agregar Actividad" href="/dashboard/admin/actividades" />
            <ControlBox title="Gestión Pacientes" desc="Lista de Paciente registrados, psicólogo asignado, última actividad" btnLabel="Gestionar Pacientes" href="/dashboard/admin/pacientes" />
            <ControlBox title="Reportes" desc="Estadísticas, Visualizar reportes por usuarios pacientes, psicólogos,etc" btnLabel="Ver Reportes" href="/dashboard/admin/reportes" />
          </div>
        </div>

        {/* 3. USUARIOS RECIENTES (TABLA) */}
        <div className="admin-dashboard-recent-users space-y-4">
          <h2 className="text-lg font-bold text-center text-gray-800">Usuarios Recientes</h2>
          <div className="admin-dashboard-recent-table bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-200 border-b border-gray-300 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-gray-600">Usuarios</th>
                  <th className="px-4 py-3 text-gray-600">Rol</th>
                  <th className="px-4 py-3 text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="px-4 py-3 text-gray-600">
                {data.recentUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.role === 'PACIENTE' ? 'Estudiante' : 'Psicólogo'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interfaces para evitar el error 'any'
interface StatCardProps { title: string; count: string; icon: React.ReactNode; color: string; }
function StatCard({ title, count, icon, color }: StatCardProps) {
  return (
    <div className={`admin-dashboard-stat-card ${color} p-6 rounded-2xl border-2 border-black/10 flex items-center justify-between`}>
      <div className="flex items-center gap-2 font-bold text-gray-800">
        {icon} <span>{title}: {count}</span>
      </div>
    </div>
  );
}

interface ControlBoxProps { title: string; desc: string; btnLabel: string; href: string; }
function ControlBox({ title, desc, btnLabel, href }: ControlBoxProps) {
  return (
    <div className="admin-dashboard-control-card bg-[#B6D4F5] p-6 rounded-xl border border-blue-300 flex flex-col gap-4 shadow-md">
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      <p className="text-xs text-gray-700 min-h-10">{desc}</p>
      <Link href={href} className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold py-2.5 px-4 rounded-lg border border-gray-300 text-center block w-fit">
        {btnLabel}
      </Link>
    </div>
  );
}