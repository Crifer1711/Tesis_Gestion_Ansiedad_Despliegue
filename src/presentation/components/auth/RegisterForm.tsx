"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, Loader2, Phone, Eye, EyeOff } from "lucide-react";
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
    .length(12, "El número debe tener exactamente 12 dígitos (Ej: 5939XXXXXXXX)")
    .regex(/^5939\d{8}$/, "Formato ecuatoriano inválido. Debe empezar con 593..."),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(30, "La contraseña no puede exceder los 30 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "No se permiten caracteres especiales (solo letras y números)")
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
  
  // 1. ESTADOS PARA MOSTRAR/OCULTAR CONTRASEÑAS AÑADIDOS
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
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
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
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/fondoLogin.png')" }}
    >
      <div className="flex w-full max-w-5xl flex-col md:flex-row items-center justify-center gap-16">
        <div className="w-full max-w-[600px] bg-[#D9E9FF] p-10 rounded-[45px] shadow-xl flex flex-col items-center border border-white/50">
          
          <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-md border border-blue-200 mb-4">
            <Image src="/images/logo-.png" alt="Logo" fill className="object-cover" sizes="56px" priority />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1E4D8C] mb-8 tracking-widest uppercase">Registro</h1>
          
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* CAMPO: NOMBRES */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={20} />
              </div>
              <input
                {...register("name", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");
                    setValue("name", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="NOMBRES (SOLO MAYÚSCULAS)"
                maxLength={40}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.name.message}</p>}
            </div>

            {/* CAMPO: APELLIDOS */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={20} />
              </div>
              <input
                {...register("lastname", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");
                    setValue("lastname", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="APELLIDOS (SOLO MAYÚSCULAS)"
                maxLength={40}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.lastname ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {errors.lastname && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.lastname.message}</p>}
            </div>

            {/* CAMPO: EMAIL */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                {...register("email", {
                  onChange: (e) => {
                    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
                    setValue("email", sanitized, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="ejemplo@espe.edu.ec"
                maxLength={60}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.email.message}</p>}
            </div>

            {/* CAMPO: NÚMERO DE CONTACTO */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={20} />
              </div>
              <input
                {...register("contacto", {
                  onChange: (e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setValue("contacto", digitsOnly, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="5939XXXXXXXX"
                maxLength={12}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.contacto ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {errors.contacto && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.contacto.message}</p>}
            </div>

            {/* CAMPO: CONTRASEÑA */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                {...register("password", {
                  onChange: (e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                    setValue("password", sanitized, { shouldValidate: true });
                  }
                })}
                type={showPassword ? "text" : "password"} // <-- CAMBIO DINÁMICO
                placeholder="Contraseña (Alfanumérica)"
                maxLength={30}
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {/* BOTÓN OJO */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.password.message}</p>}
            </div>

            {/* CAMPO: CONFIRMAR CONTRASEÑA */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"} // <-- CAMBIO DINÁMICO
                placeholder="Confirmar Contraseña"
                maxLength={30}
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400 shadow-inner ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
              />
              {/* BOTÓN OJO */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 pl-2 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && <p className="text-red-500 text-center font-bold text-sm bg-red-50 p-2 rounded-xl border border-red-200">{serverError}</p>}

            {/* BOTÓN DE ENVÍO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#71A5D9] hover:bg-[#1E4D8C] text-white py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
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