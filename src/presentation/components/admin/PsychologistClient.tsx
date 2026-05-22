'use client'

import { useState } from "react";
import { Search, Edit2, Trash2, UserPlus } from "lucide-react";
import { toast } from 'react-hot-toast';
import { Psychologist } from "@/domain/dtos/psychologist.dto";
// IMPORTANTE: Importamos la nueva acción
import { deletePsychologistAction, togglePsychologistStatusAction } from "@/infrastructure/actions/psychologist.actions";
import { useConfirm } from '@/presentation/components/common/ConfirmProvider';
import { CreatePsychologistModal } from "./CreatePsychologistModal";
import { EditPsychologistModal } from "./EditPsychologistModal";

interface Props { initialData: Psychologist[]; }

export function PsychologistClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [psychologists, setPsychologists] = useState(initialData);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);

  const confirm = useConfirm();

  // Lógica de filtrado
  const filteredData = psychologists.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || doc.estado === filter;
    return matchesSearch && matchesFilter;
  });

  // NUEVA FUNCIÓN: Activar / Desactivar
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const result = await togglePsychologistStatusAction(id, currentStatus);
    if (result.success) {
      setPsychologists(prev => prev.map(p => 
        p.id === id ? { ...p, estado: result.newStatus as 'Activo' | 'Inactivo' | 'Pendiente' } : p
      ));
    } else {
      toast.error(result.error || 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Eliminar psicólogo', description: '¿Estás seguro de eliminar este psicólogo? Esta acción es irreversible.', confirmText: 'Eliminar', cancelText: 'Cancelar' });
    if (!ok) return;
    try {
      await deletePsychologistAction(id);
      setPsychologists(prev => prev.filter(p => p.id !== id));
      toast.success('Psicólogo eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el psicólogo');
    }
  };

  const handleEdit = (doc: Psychologist) => {
    setSelectedPsychologist(doc);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Modales */}
      <CreatePsychologistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <EditPsychologistModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPsychologist(null);
        }} 
        psychologist={selectedPsychologist}
      />

      {/* Encabezado */}
      <div className="bg-[#D1E7FF] p-6 rounded-xl border border-blue-200">
        <h1 className="text-xl font-bold text-gray-900 uppercase">GESTIÓN DE PSICÓLOGOS</h1>
        <p className="text-sm text-gray-700">Gestión total de los psicólogos</p>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="mt-5 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-400 px-6 py-2 rounded-xl text-sm font-black shadow-sm transition-transform active:scale-95"
        >
            NUEVO PSICÓLOGO
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-[#D1E7FF]/50 p-6 rounded-xl border border-blue-100 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-400 focus:outline-none text-gray-900 shadow-inner"
            />
          </div>
          <button className="bg-gray-200 px-8 py-2 rounded-lg font-bold text-gray-800 border border-gray-400 hover:bg-gray-300">
            Buscar
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
                <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Email</th>
                <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Contacto</th>
                <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Especialidad</th>
                <th className="px-4 py-4 border-r-2 border-gray-800 text-center uppercase">Estado</th>
                <th className="px-4 py-4 text-center uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filteredData.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900 font-medium">{doc.name}</td>
                  <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{doc.email}</td>
                  <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{doc.contacto}</td>
                  <td className="px-4 py-4 border-r-2 border-gray-200 text-gray-900">{doc.especialidad}</td>
                  <td className="px-4 py-4 border-r-2 border-gray-200 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      doc.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 flex justify-center gap-3">
                    {/* BOTÓN ACTUALIZADO CON LOGICA REAL */}
                    <button 
                      onClick={() => handleToggleStatus(doc.id, doc.estado)}
                      className={`border-2 border-gray-800 px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${
                        doc.estado === 'Activo' 
                        ? 'bg-red-200 hover:bg-red-300' 
                        : 'bg-green-200 hover:bg-green-300'
                      }`}
                    >
                      {doc.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <button 
                      onClick={() => handleEdit(doc)} 
                      className="text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)} 
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
            <div className="p-8 text-center text-gray-500 font-bold">No se encontraron resultados</div>
          )}
        </div>
      </div>
    </div>
  );
}