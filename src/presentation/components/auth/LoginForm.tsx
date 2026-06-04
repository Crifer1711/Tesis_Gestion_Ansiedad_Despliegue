"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Image from 'next/image';
import { signIn } from "next-auth/react";

// ==========================================
// ESQUEMA DE VALIDACIÓN SEGURO (ZOD)
// ==========================================
const loginSchema = z.object({
  email: z.string()
    .email("Correo inválido")
    .endsWith("@espe.edu.ec", "Usa tu correo institucional @espe.edu.ec"),
  password: z.string()
    .min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [serverError, setServerError] = useState("");
  const [approvalWarning, setApprovalWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Activamos validación en vivo al igual que en el registro
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setServerError("");
    setApprovalWarning("");

    try {
      // 1. Usamos NextAuth para intentar iniciar sesión
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      // 2. Evaluamos el error específico
      if (result?.error) {
        // result.error ahora contendrá "Correo incorrecto" o "Contraseña incorrecta"
        setServerError(result.error);
        return;
      }

      // 3. Si pasó el login, verificamos la sesión y redirigimos
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role) {
        const role = session.user.role;
        if (role === "PACIENTE") router.push("/dashboard/paciente");
        else if (role === "PSICOLOGO") router.push("/dashboard/psicologo");
        else if (role === "ADMINISTRADOR") router.push("/dashboard/admin");
        
        router.refresh(); 
      }
    } catch (err) {
      setServerError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para limpiar errores al escribir
  const clearErrorsOnType = () => {
    if (serverError) setServerError("");
    if (approvalWarning) setApprovalWarning("");
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/fondoLogin.png')" }}
    >
      {approvalWarning && (
        <div className="fixed top-6 right-6 z-50 w-[320px] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg shadow-amber-100">
          <p className="text-sm font-bold text-amber-800">{approvalWarning}</p>
          <p className="mt-1 text-xs text-amber-700">Tu cuenta aún no ha sido aprobada o está desactivada.</p>
        </div>
      )}

      <div className="flex w-full max-w-[850px] flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6">
        
        {/* Columna Izquierda: Ilustración */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[320px]">
            <Image
              src="/images/Login1-.png"
              alt="Ilustración Psicología"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="flex-1 bg-[#E9F2FF] border border-[#D0E2FB] rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-center items-center">
          
          <div className="relative w-14 h-14 mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100">
            <Image
              src="/images/Logo-.png"
              alt="Logo"
              width={32}
              height={32}
              priority
              className="object-contain"
            />
          </div>
          
          <h1 className="text-[15px] font-bold text-[#194073] mb-8 tracking-[0.15em] uppercase">
            MINDPEACE
          </h1>
          
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* CAMPO: EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#194073]/50" size={16} />
              <input 
                {...register("email", {
                  onChange: (e) => {
                    clearErrorsOnType();
                    // Intercepta teclado: quita espacios y caracteres extraños, fuerza minúsculas
                    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
                    setValue("email", sanitized, { shouldValidate: true });
                  }
                })}
                type="email" 
                maxLength={60}
                placeholder="Usuario (@espe.edu.ec)"
                className={`w-full pl-11 pr-4 py-3 bg-transparent border border-[#B8D0F5] rounded-lg outline-none focus:ring-2 focus:ring-[#85AEE0] text-[#194073] text-[13px] placeholder-[#194073]/50 transition-all ${errors.email ? 'ring-2 ring-red-300 border-transparent' : ''}`}
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            {/* CAMPO: CONTRASEÑA */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#194073]/50" size={16} />
              <input 
                {...register("password", {
                  onChange: (e) => {
                    clearErrorsOnType();
                    // Evita espacios y caracteres especiales de inyección
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                    setValue("password", sanitized, { shouldValidate: true });
                  }
                })}
                type={showPassword ? "text" : "password"}
                maxLength={30}
                placeholder="Contraseña"
                className={`w-full pl-11 pr-11 py-3 bg-transparent border border-[#B8D0F5] rounded-lg outline-none focus:ring-2 focus:ring-[#85AEE0] text-[#194073] text-[13px] placeholder-[#194073]/50 transition-all ${errors.password ? 'ring-2 ring-red-300 border-transparent' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#194073]/60 hover:text-[#194073] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase italic">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right pt-1 pb-2">
              <Link href="#" className="text-[11px] text-[#194073]/70 italic hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {serverError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg text-center font-bold border border-red-100 uppercase italic">
                {serverError}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#7CA8DC] hover:bg-[#6292C7] text-white py-3 rounded-lg text-[13px] font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Iniciar Sesión"}
            </button>
            
            <div className="text-center pt-4">
              <p className="text-[11px] text-[#194073]/70 italic">
                ¿No tienes cuenta? 
                <Link href="/register" className="text-[#194073] font-bold ml-1 hover:underline not-italic">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};