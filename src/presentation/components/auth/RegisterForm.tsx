"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, Loader2, Phone, Eye, EyeOff } from "lucide-react";
import { toast } from 'react-hot-toast';
import Image from 'next/image';

const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(40, "El nombre no puede exceder los 40 caracteres")
    .regex(
      /^[A-ZÁÉÍÓÚÑ]+(?:\s[A-ZÁÉÍÓÚÑ]+)+$/, 
      "Debes ingresar exactamente dos nombres separados por un espacio"
    ).refine(
    value => !/(.)\1{3,}/.test(value),
    {
      message: "Nombre inválido"
    }
  ),
  lastname: z.string()
    .trim()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(40, "El apellido no puede exceder los 40 caracteres")
    .regex(
      /^[A-ZÁÉÍÓÚÑ]+(?:\s[A-ZÁÉÍÓÚÑ]+)+$/, 
      "Debes ingresar exactamente dos apellidos separados por un espacio"
    ).refine(
    value => !/(.)\1{3,}/.test(value),
    {
      message: "Nombre inválido"
    }
  ),
  email: z.string()
    .email("Correo electrónico inválido")
    .max(60, "El correo electrónico es demasiado largo")
    .endsWith("@espe.edu.ec", "Debe ser obligatoriamente un correo institucional @espe.edu.ec"),
  contacto: z.string()
    .length(9, "El número debe tener exactamente 9 dígitos (Ej: 9XXXXXXXX)")
    .regex(/^9\d{8}$/, "Debe empezar con el número 9"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(30, "La contraseña no puede exceder los 30 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", 
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setServerError("");

    // Reconstruimos el formato de 12 dígitos requerido por el backend
    const dataToSend = {
      ...data,
      contacto: `593${data.contacto}`
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        toast.success("Usuario registrado exitosamente", { id: 'register-success' });
        router.push("/login");
      } else {
        const result = await res.json();
        setServerError(result.error || "Error al registrarse");
      }
    } catch (err) {
      setServerError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: "url('/images/fondoLogin.png')" }}
    >
      {/* Capa de superposición para mejorar el contraste del formulario frente a la imagen */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-0"></div>

      <div className="z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
        
        {/* LOGO & ENCABEZADO */}
        <div className="flex flex-col items-center mb-6">
<div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-3 bg-white p-1">
            <Image src="/images/Logo-.png" alt="Logo" fill className="object-contain" sizes="48px" priority />
            
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Crear una cuenta</h1>
          <p className="text-xs text-gray-500 mt-1">Ingresa tus datos institucionales para registrarte</p>
        </div>
        
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          {/* CAMPO: NOMBRES */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nombres</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                {...register("name", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");
                    setValue("name", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="EJ. JUAN CARLOS"
                maxLength={40}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.name.message}</p>}
          </div>

          {/* CAMPO: APELLIDOS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Apellidos</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                {...register("lastname", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");
                    setValue("lastname", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="EJ. PEREZ ANDRADE"
                maxLength={40}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.lastname ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
            </div>
            {errors.lastname && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.lastname.message}</p>}
          </div>

          {/* CAMPO: EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Correo Institucional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                {...register("email", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
                    setValue("email", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="usuario@espe.edu.ec"
                maxLength={60}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.email.message}</p>}
          </div>

          {/* CAMPO: NÚMERO DE CONTACTO */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Número de Contacto</label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
                <span className="ml-2 font-bold text-slate-800 text-sm border-r border-gray-300 pr-2">+593</span>
              </div>
              <input
                {...register("contacto", {
                  onChange: (e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setValue("contacto", digitsOnly, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="9XXXXXXXX"
                maxLength={9}
                className={`w-full pl-24 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium tracking-wide ${errors.contacto ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
            </div>
            {errors.contacto && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.contacto.message}</p>}
          </div>

          {/* CAMPO: CONTRASEÑA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                {...register("password", {
                  onChange: (e) => {
                    setValue("password", e.target.value, { shouldValidate: true });
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres con letras, números y símbolos"
                maxLength={30}
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.password.message}</p>}
          </div>

          {/* CAMPO: CONFIRMAR CONTRASEÑA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                maxLength={30}
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && (
            <p className="text-red-600 text-center font-semibold text-xs bg-red-50 p-2.5 rounded-xl border border-red-200 shadow-sm animate-fade-in">
              {serverError}
            </p>
          )}

          {/* BOTÓN DE ENVÍO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E4D8C] hover:bg-[#163B6B] active:bg-[#0f2a4f] text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Registrarse"}
          </button>
          
          {/* LINK INVERSIÓN */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 font-medium">
              ¿Ya tienes una cuenta?  
              <Link href="/login" className="text-[#1E4D8C] font-semibold ml-1 hover:underline hover:text-[#163B6B]">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};