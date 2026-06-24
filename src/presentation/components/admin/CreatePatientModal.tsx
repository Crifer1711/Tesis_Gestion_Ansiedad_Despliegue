'use client'

import { X, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import { useState } from "react";
import { createPatientAction, CreatePatientData } from "@/infrastructure/actions/patient.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Patient } from "@/domain/dtos/patient.dto";

// 1. Definimos el esquema de validación con Zod
const patientSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido"),
  contacto: z.string().min(7, "Número de contacto inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
}

export function CreatePatientModal({ isOpen, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // 2. Configuramos react-hook-form usando la interfaz CreatePatientData
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm<CreatePatientData>({
    resolver: zodResolver(patientSchema),
  });

  if (!isOpen) return null;

  // 3. Reemplazamos la lógica nativa por la de react-hook-form
  const onSubmit = async (data: CreatePatientData) => {
    setLoading(true);
    setServerError("");
    
    try {
      const result = await createPatientAction(data);
      
      if (result.success) {
        toast.success("Paciente creado con éxito");
        onCreated?.({
          id: String(result.id || Date.now()),
          name: data.name,
          email: data.email,
          contacto: data.contacto,
          fecha_registro: result.fecha_registro || new Date().toLocaleDateString('es-ES'),
          estado: 'Activo',
        });
        reset(); // Limpiamos el form
        onClose();
      } else {
        setServerError(result.error || "Error al crear el paciente");
      }
    } catch (err) {
      setServerError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border-4 border-gray-800 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Encabezado del Modal */}
        <div className="bg-[#D1E7FF] border-b-4 border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 uppercase">NUEVO PACIENTE</h2>
          <button 
            onClick={onClose}
            className="hover:bg-red-400 p-1 rounded-full border-2 border-transparent hover:border-gray-800 transition-all"
          >
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          {/* Campo: Nombre Completo */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700 uppercase ml-1">Nombre Completo</label>
            <input 
              {...register("name")}
              type="text" 
              placeholder="Ej. Juan Pérez"
              className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 placeholder:text-gray-400 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-800'}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.name.message}</p>}
          </div>

          {/* Campo: Correo Electrónico */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700 uppercase ml-1">Correo Electrónico</label>
            <input 
              {...register("email")}
              type="email" 
              placeholder="usuario@ejemplo.com"
              className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 placeholder:text-gray-400 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-800'}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.email.message}</p>}
          </div>

          {/* Dos columnas: Teléfono y Contraseña */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase ml-1">Contacto</label>
              <input 
                {...register("contacto")}
                type="text" 
                placeholder="09XXXXXXXX"
                className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 transition-colors ${errors.contacto ? 'border-red-500' : 'border-gray-800'}`}
              />
              {errors.contacto && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.contacto.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase ml-1">Contraseña Temporal</label>
              <input 
                {...register("password")}
                type="password" 
                placeholder="••••••••"
                className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-800'}`}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.password.message}</p>}
            </div>
          </div>

          {/* Mostrar error del servidor si existe */}
          {serverError && (
            <div className="bg-red-50 border-4 border-red-500 p-3 rounded-2xl">
              <p className="text-[11px] text-red-600 font-black uppercase italic text-center">
                {serverError}
              </p>
            </div>
          )}

          {/* Botón de Acción */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-[#D1E7FF] hover:bg-green-400 text-gray-900 border-4 border-gray-800 py-4 rounded-2xl font-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 uppercase"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>GUARDANDO...</span>
              </>
            ) : (
              "GUARDAR PACIENTE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}