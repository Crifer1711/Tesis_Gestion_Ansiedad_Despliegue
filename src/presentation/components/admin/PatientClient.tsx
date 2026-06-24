'use client'

import { useState } from "react";
import { Search, Edit2, Trash2, UserPlus } from "lucide-react";
import { toast } from 'react-hot-toast';
import { Patient } from "@/domain/dtos/patient.dto";
// Deberás crear estas acciones similares a las de psicólogos
import { deletePatientAction } from "@/infrastructure/actions/patient.actions"; 
import { useConfirm } from '@/presentation/components/common/ConfirmProvider';
import { CreatePatientModal } from "./CreatePatientModal";
import { EditPatientModal } from "./EditPatientModal";
import { togglePatientStatusAction } from "@/infrastructure/actions/patient.actions";

interface Props { initialData: Patient[]; }

export function PatientClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [patients, setPatients] = useState(initialData);
  
  
  // Estados para los Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const confirm = useConfirm();

  // Lógica de filtrado coincidiendo con tu diseño
  const filteredData = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.lastname || '').toLowerCase().includes(search.toLowerCase()) ||
                          p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || p.estado === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Eliminar paciente', description: '¿Estás seguro de eliminar este paciente? Esta acción es irreversible.', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;
    try {
      await deletePatientAction(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      toast.success('Paciente eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el paciente');
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const result = await togglePatientStatusAction(id, currentStatus);
    
    if (result.success) {
      // Actualizamos la lista localmente para no tener que recargar la página
      setPatients(prev => prev.map(p => 
        p.id === id ? { ...p, estado: result.newStatus as 'Activo' | 'Inactivo' } : p
      ));
    } else {
      toast.error(result.error || 'Error');
    }
  };

  return (
    <div className="space-y-6">
  {/* Modales */}
  <CreatePatientModal 
    isOpen={isModalOpen} 
    onClose={() => setIsModalOpen(false)} 
    onCreated={(patient) => {
      setPatients(prev => [patient, ...prev]);
    }}
  />
  
  <EditPatientModal 
    isOpen={isEditModalOpen} 
    onClose={() => {
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    }} 
    patient={selectedPatient}
    onUpdated={(updatedPatient) => {
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    }}
  />

  {/* Encabezado */}
  <div className="bg-[#D1E7FF] p-6 rounded-xl border border-blue-200">
  <h1 className="text-xl font-bold text-gray-900 uppercase">GESTIÓN DE PACIENTES</h1>
  <p className="text-sm text-gray-700">Resumen del apartado gestión de pacientes</p>
  <button 
    onClick={() => setIsModalOpen(true)} 
    className="mt-5 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-400 px-6 py-2 rounded-xl text-sm font-black shadow-sm transition-transform active:scale-95 flex items-center gap-2"
  >
    
    NUEVO PACIENTE
  </button>
</div>

{/* Buscador y Filtros */}
<div className="bg-[#D1E7FF]/50 p-6 rounded-xl border border-blue-100 space-y-4">
  <div className="flex gap-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
      <input 
        type="text" 
        placeholder="Buscar por nombre o email..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-400 focus:outline-none text-gray-900 shadow-inner"
      />
    </div>
    <button className="bg-gray-200 px-8 py-2 rounded-lg font-bold text-gray-800 border border-gray-400 hover:bg-gray-300">
      BUSCAR
    </button>
  </div>

  <div className="flex gap-2">
    {['Todos', 'Activo', 'Inactivo', 'Pendiente'].map((f) => (
      <button 
        key={f} 
        onClick={() => setFilter(f)}
        className={`px-4 py-1 border border-gray-400 rounded-md text-xs font-medium transition-colors ${
          filter === f ? "bg-gray-800 text-white" : "bg-white text-gray-800 hover:bg-gray-100"
        }`}
      >
        {f === 'Activo' ? 'Activos' : f === 'Inactivo' ? 'Inactivos' : f}
      </button>
    ))}
  </div>

  {/* Tabla */}
  <div className="border-2 border-gray-800 rounded-xl overflow-hidden shadow-lg bg-white">
    <table className="w-full text-sm text-left">
      <thead className="bg-[#BDBDBD] border-b-2 border-gray-800 font-black text-gray-900">
        <tr>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Nombre</th>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Apellidos</th>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Email</th>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Teléfono</th>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Fecha de Registro</th>
          <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Estado</th>
          <th className="px-4 py-4 text-center uppercase">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 divide-gray-200">
        {filteredData.map((p) => (
          <tr key={p.id} className="hover:bg-gray-100 transition-colors">
            <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900 font-medium">{p.name}</td>
            <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{p.lastname || '-'}</td>
            <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{p.email}</td>
            <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{p.contacto}</td>
            <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{p.fecha_registro}</td>
            <td className="px-4 py-4 border-r-2 border-gray-200 text-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                p.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {p.estado}
              </span>
            </td>
            <td className="px-4 py-4 flex justify-center gap-3">
              <button 
                onClick={() => handleToggleStatus(p.id, p.estado)}
                className={`border-2 border-gray-800 px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${
                        p.estado === 'Activo' 
                        ? 'bg-red-200 hover:bg-red-300' 
                        : 'bg-green-200 hover:bg-green-300'
                      }`}
                    >
                      {p.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    
              <button 
                onClick={() => handleEdit(p)} 
                className="text-gray-800 hover:text-blue-600 transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(p.id)} 
                className="text-gray-800 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {filteredData.length === 0 && (
      <div className="p-8 text-center text-gray-500 font-bold">No hay pacientes registrados</div>
    )}
  </div>
</div>
</div>
  );
}