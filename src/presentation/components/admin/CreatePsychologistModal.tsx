'use client'

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import { createPsychologistAction } from "@/infrastructure/actions/psychologist.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Psychologist } from "@/domain/dtos/psychologist.dto";

// 1. Definimos el esquema de validación con Zod
const psychologistSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido").endsWith("@espe.edu.ec", "Debe ser un correo institucional @espe.edu.ec"),
  especialidad: z.string().min(3, "La especialidad es requerida"),
  contacto: z.string().min(7, "Número de contacto inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Inferimos el tipo a partir del esquema
type PsychologistFormData = z.infer<typeof psychologistSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (psychologist: Psychologist) => void;
}

export function CreatePsychologistModal({ isOpen, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // 2. Configuramos react-hook-form
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors },
    reset 
  } = useForm<PsychologistFormData>({
    resolver: zodResolver(psychologistSchema),
  });

  if (!isOpen) return null;

  // 3. Manejador del submit usando los datos ya validados
  const onSubmit = async (data: PsychologistFormData) => {
    setLoading(true);
    setServerError("");

    const payload: PsychologistFormData = {
      ...data,
      name: data.name.trim().toUpperCase(),
      email: data.email.trim().toLowerCase(),
      especialidad: data.especialidad.trim().toUpperCase(),
      contacto: data.contacto.trim(),
    };
    
    try {
      const result = await createPsychologistAction(payload);
      
      if (result.success) {
        toast.success("Psicólogo creado con éxito");
        onCreated?.({
          id: String(result.id || Date.now()),
          name: payload.name,
          email: payload.email,
          contacto: payload.contacto,
          especialidad: payload.especialidad,
          pacientes: 0,
          estado: 'Activo',
        });
        reset(); // Limpiamos el formulario tras el éxito
        onClose();
      } else {
        setServerError(result.error || "Error al crear el psicólogo");
      }
    } catch (err) {
      setServerError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F7F7F7] w-full max-w-md rounded-3xl border-4 border-gray-800 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#AFC8E8] p-6 border-b-4 border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 uppercase">Nuevo Psicólogo</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-gray-700">Nombre Completo</label>
            <input 
              {...register("name", {
                onChange: (e) => setValue("name", e.target.value.toUpperCase(), { shouldValidate: true })
              })}
              className={`w-full p-3 bg-[#EAF2FB] border-2 rounded-xl focus:bg-white outline-none text-gray-900 placeholder-gray-500 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`} 
              placeholder="Ej. Dr. Juan Pérez" 
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.name.message}</p>}
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-gray-700">Correo Electrónico</label>
            <input 
              {...register("email", {
                onChange: (e) => setValue("email", e.target.value.toLowerCase(), { shouldValidate: true })
              })}
              type="email" 
              className={`w-full p-3 bg-[#EAF2FB] border-2 rounded-xl focus:bg-white outline-none text-gray-900 placeholder-gray-500 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`} 
              placeholder="usuario@espe.edu.ec" 
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Especialidad */}
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-gray-700">Especialidad</label>
              <input 
                {...register("especialidad", {
                  onChange: (e) => setValue("especialidad", e.target.value.toUpperCase(), { shouldValidate: true })
                })}
                className={`w-full p-3 bg-[#EAF2FB] border-2 rounded-xl focus:bg-white outline-none text-gray-900 placeholder-gray-500 ${errors.especialidad ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`} 
                placeholder="Clínica" 
              />
              {errors.especialidad && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.especialidad.message}</p>}
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-gray-700">Contacto</label>
              <input 
                {...register("contacto")}
                className={`w-full p-3 bg-[#EAF2FB] border-2 rounded-xl focus:bg-white outline-none text-gray-900 placeholder-gray-500 ${errors.contacto ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`} 
                placeholder="099..." 
              />
              {errors.contacto && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.contacto.message}</p>}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-gray-700">Contraseña Temporal</label>
            <input 
              {...register("password")}
              type="password" 
              className={`w-full p-3 bg-[#EAF2FB] border-2 rounded-xl focus:bg-white outline-none text-gray-900 placeholder-gray-500 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`} 
            />
            {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">{errors.password.message}</p>}
          </div>

          {/* Mensaje de Error del Servidor */}
          {serverError && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 rounded-xl text-xs font-bold uppercase">
              {serverError}
            </div>
          )}

          {/* Botón de Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#AFC8E8] hover:bg-[#94B6DF] border-4 border-gray-800 py-3 rounded-xl font-black uppercase text-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Guardar Psicólogo"}
          </button>
        </form>
      </div>
    </div>
  );
}