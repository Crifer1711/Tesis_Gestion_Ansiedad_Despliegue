"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, CheckCircle, Loader2, Phone } from "lucide-react"; // Añadido Phone
import Image from 'next/image';

const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido").endsWith("@espe.edu.ec", "Usa tu correo @espe.edu.ec"),
  contacto: z.string().min(7, "Número de contacto inválido"), // Nuevo campo
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setServerError("");
    try {
      // Agregamos el rol por defecto para evitar el error de base de datos
      const payload = { 
        ...data, 
        role: 'PACIENTE', // Asignamos el rol de paciente por defecto
        status: 'pendiente',
        especialidad: null // Los estudiantes no tienen especialidad en tu DB
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) router.push("/login");
      else {
        const result = await res.json();
        setServerError(result.error || "Error al registrarse");
      }
    } catch (err) {
      setServerError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div 
    className="flex min-h-screen items-center justify-center bg-cover bg-center p-6"
    style={{ backgroundImage: "url('/images/fondoLogin.png')" }}
  >
    <div className="flex w-full max-w-5xl flex-col md:flex-row items-center justify-center gap-16">
      
      {/* Columna Derecha: Formulario */}
      <div className="w-full max-w-[600px] bg-[#D9E9FF] p-10 rounded-[45px] shadow-xl flex flex-col items-center border border-white/50">
        
        <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-md border border-blue-200 mb-4">
          <Image 
            src="/images/logo-.png" 
            alt="Logo" 
            fill 
            className="object-cover"
            sizes="56px"
            priority
          />
        </div>
        
        <h1 className="text-2xl font-bold text-[#1E4D8C] mb-8 tracking-widest uppercase">Registro</h1>
        
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Nombre */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]/50" size={20} />
            <input 
              {...register("name")}
              type="text" 
              placeholder="Nombres Completos"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.name ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]/50" size={20} />
            <input 
              {...register("email")}
              type="email" 
              placeholder="Email (@espe.edu.ec)"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.email ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">{errors.email.message}</p>}
          </div>

          {/* Contacto */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]/50" size={20} />
            <input 
              {...register("contacto")}
              type="text" 
              placeholder="Número de Contacto"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.contacto ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.contacto && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">{errors.contacto.message}</p>}
          </div>
          
          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]/50" size={20} />
            <input 
              {...register("password")}
              type="password" 
              placeholder="Contraseña"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.password ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]/50" size={20} />
            <input 
              {...register("confirmPassword")}
              type="password" 
              placeholder="Confirmar Contraseña"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.confirmPassword ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && <p className="text-[10px] text-red-600 mt-1 ml-2 font-bold uppercase italic bg-red-50 p-2 rounded-lg border border-red-200">{serverError}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#71A5D9] hover:bg-[#1E4D8C] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Registrar Usuario"}
          </button>
          
          <div className="text-center mt-6">
            <p className="text-xs text-[#1E4D8C]/70 italic font-medium">
              ¿Ya tienes una cuenta?  
              <Link href="/login" className="text-[#1E4D8C] font-bold ml-1 hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
);

};