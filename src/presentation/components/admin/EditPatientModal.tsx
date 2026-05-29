'use client'

import { X, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import { useState, useEffect } from "react";
import { Patient } from "@/domain/dtos/patient.dto";
import { updatePatientAction, UpdatePatientData } from "@/infrastructure/actions/patient.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Solución definitiva: Usar z.union y z.literal. 
// Esto es 100% compatible con TypeScript y evita el error de "any" o "overload"
const editPatientSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido"),
  contacto: z.string().min(7, "Número de contacto inválido"),
  estado: z.union([
    z.literal("Activo"),
    z.literal("Inactivo"),
    z.literal("Pendiente")
  ]),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onUpdated?: (patient: Patient) => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm<UpdatePatientData>({
    // 2. ¡Adiós al 'as any'! Ahora TypeScript reconoce que el esquema es perfecto
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        email: patient.email,
        contacto: patient.contacto,
        estado: patient.estado as "Activo" | "Inactivo" | "Pendiente",
      });
    }
  }, [patient, reset]);

  if (!isOpen || !patient) return null;

  const onSubmit = async (data: UpdatePatientData) => {
    setLoading(true);
    setServerError("");
    
    try {
      const result = await updatePatientAction(patient.id, data);
      
      if (result.success) {
        toast.success("Paciente actualizado correctamente");
        onUpdated?.({
          ...patient,
          name: data.name,
          email: data.email,
          contacto: data.contacto,
          estado: data.estado,
        });
        onClose();
      } else {
        setServerError(result.error || "Error al actualizar el paciente");
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
        
        {/* Encabezado azul neobrutalista */}
        <div className="bg-[#D1E7FF] border-b-4 border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 uppercase">EDITAR PACIENTE</h2>
          <button onClick={onClose} className="hover:bg-red-400 p-1 rounded-full border-2 border-transparent hover:border-gray-800 transition-all">
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700 uppercase ml-1">Nombre Completo</label>
            <input 
              {...register("name")}
              type="text" 
              className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-800'}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700 uppercase ml-1">Correo Electrónico</label>
            <input 
              {...register("email")}
              type="email" 
              className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-800'}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.email.message}</p>}
          </div>

          {/* Fila de dos columnas para Teléfono y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase ml-1">Contacto</label>
              <input 
                {...register("contacto")}
                type="text" 
                className={`w-full p-4 rounded-2xl border-4 bg-gray-50 focus:bg-white focus:outline-none font-bold text-gray-900 transition-colors ${errors.contacto ? 'border-red-500' : 'border-gray-800'}`}
              />
              {errors.contacto && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.contacto.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase ml-1">Estado</label>
              <select 
                {...register("estado")}
                className="w-full p-4 rounded-2xl border-4 bg-gray-50 border-gray-800 focus:bg-white focus:outline-none font-black text-gray-900 appearance-none cursor-pointer transition-colors"
              >
                <option value="Activo">ACTIVO</option>
                <option value="Inactivo">INACTIVO</option>
                <option value="Pendiente">PENDIENTE</option>
              </select>
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

          {/* Botón */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-[#D1E7FF] hover:bg-yellow-300 text-gray-900 border-4 border-gray-800 py-4 rounded-2xl font-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 uppercase mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>ACTUALIZANDO...</span>
              </>
            ) : (
              "ACTUALIZAR DATOS"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}