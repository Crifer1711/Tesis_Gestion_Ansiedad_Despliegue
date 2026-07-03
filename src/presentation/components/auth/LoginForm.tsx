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
    /* Fondo general */
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 p-4">
      
      {/* Tarjeta Principal ampliada a 1000px para dar más espacio */}
      <div className="z-10 flex w-full max-w-[1000px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-white flex-col md:flex-row">
        
        {/* Columna Izquierda: Ilustración (Ahora con fondo blanco igual que el formulario) */}
        <div className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-6 md:p-8 relative">
          {/* Contenedor de la imagen más grande y con proporción rectangular */}
          <div className="relative w-full aspect-[4/3] max-w-[480px]">
            <Image
              src="/images/MiMINDPEACE_login.png"
              alt="Ilustración Psicología"
              fill
              priority
              className="object-contain drop-shadow-xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Logo y Encabezado */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm mb-4 bg-white border border-slate-100 p-1.5 flex items-center justify-center">
              <Image
                src="/images/Logo2.png"
                alt="Logo"
                fill
                priority
                className="object-contain p-1"
                sizes="56px"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Ingresa a tu cuenta de MINDPEACE</p>
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} strokeWidth={2.5} />
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
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 font-medium ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium pl-1">
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} strokeWidth={2.5} />
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
                  className={`w-full pl-10 pr-20 py-3 text-sm rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 font-medium ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#1E4D8C] transition-colors"
                >
                  <span className="text-xs font-semibold">{showPassword ? "Ocultar" : "Mostrar"}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ERRORES DEL SERVIDOR */}
            {serverError && (
              <p className="text-red-600 text-center font-semibold text-xs bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm animate-fade-in">
                {serverError}
              </p>
            )}

            {/* BOTÓN DE LOGIN */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E4D8C] hover:bg-[#163B6B] active:bg-[#0f2a4f] text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Iniciar Sesión"}
            </button>
            
            {/* LINK A REGISTRO */}
            <div className="text-center pt-5 mt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 font-medium">
                ¿No tienes cuenta? 
                <Link href="/register" className="text-[#1E4D8C] font-bold ml-1.5 hover:underline hover:text-[#163B6B]">
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