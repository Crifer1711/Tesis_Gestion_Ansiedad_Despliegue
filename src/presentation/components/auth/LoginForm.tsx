"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Loader2 } from "lucide-react";
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
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
};

const LoginFormContent = () => {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyState = useMemo(() => searchParams.get('verify'), [searchParams]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setServerError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError(result.error);
        return;
      }

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

  const clearErrorsOnType = () => {
    if (serverError) setServerError("");
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: "url('/images/fondoLogin.png')" }}
    >
      {/* Capa de superposición para contraste */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-0"></div>

      {/* Tarjeta Principal */}
      <div className="z-10 flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex-col md:flex-row">
        
        {/* Columna Izquierda: Ilustración (Se oculta en móviles) */}
        <div className="hidden md:flex md:w-1/2 bg-slate-50 items-center justify-center p-12 relative border-r border-gray-100">
          <div className="relative w-full aspect-square max-w-[340px]">
            <Image
              src="/images/Login1-.png"
              alt="Ilustración Psicología"
              fill
              priority
              className="object-contain drop-shadow-md"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Logo y Encabezado */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 bg-white p-1">
            <Image
                src="/images/Logo-.png"
                alt="Logo"
                fill
                priority
                className="object-contain"
                sizes="48px"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Ingresa a tu cuenta de MINDPEACE</p>
          </div>

          {verifyState === 'pending' && (
            <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Registro completado. Revisa tu correo institucional para verificar tu cuenta y habilitar el acceso.
            </div>
          )}

          {verifyState === 'success' && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Tu correo fue verificado correctamente. Ya puedes iniciar sesión.
            </div>
          )}

          {verifyState === 'expired' && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El enlace de verificación expiró. Solicita un nuevo correo de validación.
            </div>
          )}

          {verifyState === 'invalid' && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              El enlace de verificación no es válido.
            </div>
          )}

          {verifyState === 'error' && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              Ocurrió un problema al verificar tu cuenta. Intenta nuevamente.
            </div>
          )}
          
          <form className="w-full space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* CAMPO: EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  {...register("email", {
                    onChange: (e) => {
                      clearErrorsOnType();
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
                      setValue("email", sanitized, { shouldValidate: true });
                    }
                  })}
                  type="email" 
                  maxLength={60}
                  placeholder="usuario@espe.edu.ec"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            {/* CAMPO: CONTRASEÑA */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  {...register("password", {
                    onChange: (e) => {
                      clearErrorsOnType();
                      setValue("password", e.target.value, { shouldValidate: true });
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  maxLength={30}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-gray-50/50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 font-medium ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 transition-colors"
                >
                  <span className="text-xs font-semibold">{showPassword ? "Ocultar" : "Mostrar"}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

           

            {/* ERRORES DEL SERVIDOR */}
            {serverError && (
              <p className="text-red-600 text-center font-semibold text-xs bg-red-50 p-2.5 rounded-xl border border-red-200 shadow-sm animate-fade-in">
                {serverError}
              </p>
            )}

            {/* BOTÓN DE LOGIN */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E4D8C] hover:bg-[#163B6B] active:bg-[#0f2a4f] text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Iniciar Sesión"}
            </button>
            
            {/* LINK A REGISTRO */}
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-xs text-gray-500 font-medium">
                ¿No tienes cuenta? 
                <Link href="/register" className="text-[#1E4D8C] font-semibold ml-1 hover:underline hover:text-[#163B6B]">
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