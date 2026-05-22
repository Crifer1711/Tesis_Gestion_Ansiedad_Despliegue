'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveGAD7ResultAction } from '@/infrastructure/actions/anxiety.actions';

// Definición de Interfaz (Debe estar arriba del componente)
interface TestResult {
  color: 'green' | 'yellow' | 'orange' | 'red';
  label: string;
  msg: string;
}

const QUESTIONS = [
  '¿Se ha sentido nervioso/a, ansioso/a o con los nervios de punta?',
  '¿No ha sido capaz de parar o controlar su preocupación?',
  '¿Se ha preocupado demasiado por diferentes cosas?',
  '¿Ha tenido dificultad para relajarse?',
  '¿Se ha sentido tan inquieto/a que no ha podido quedarse quieto/a?',
  '¿Se ha sentido fácilmente irritable o molesto/a?',
  '¿Ha sentido miedo como si fuera a suceder algo terrible?',
];

const OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Todos los días' },
];

// Función con retorno tipado para evitar el error en setResult
function getSemaphoreData(score: number): TestResult {
  if (score <= 4) return { color: 'green', label: 'Bajo', msg: 'Tus niveles de ansiedad parecen estar bajo control.' };
  if (score <= 9) return { color: 'yellow', label: 'Leve', msg: 'Presentas algunas señales leves de inquietud.' };
  if (score <= 14) return { color: 'orange', label: 'Moderado', msg: 'Tus niveles de ansiedad son notables en tu día a día.' };
  return { color: 'red', label: 'Elevado', msg: 'Tus síntomas de ansiedad son persistentes y significativos.' };
}

export function GAD7Test({ onHomeClick }: { onHomeClick: () => void }) {
  const { data: session, status } = useSession();
  const [responses, setResponses] = useState<number[]>(new Array(7).fill(-1));
  const [result, setResult] = useState<TestResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const calculateResult = async () => {
    if (responses.includes(-1)) {
      toast.error('Por favor, responde todas las preguntas.');
      return;
    }

    const score = responses.reduce((sum, val) => sum + val, 0);
    const data = getSemaphoreData(score);
    
    setResult(data);

    if (status === "authenticated" && session?.user?.role === "PACIENTE") {
      setIsSaving(true);
      
      // --- CAMBIO AQUÍ: Ahora enviamos 'responses' como tercer argumento ---
      await saveGAD7ResultAction(score, data.label, responses); 
      
      setIsSaving(false);
    }
  };

  // NUEVA FUNCIÓN: Limpia el resultado y resetea las respuestas
  const handleResetTest = () => {
    setResult(null);
    setResponses(new Array(7).fill(-1));
  };

  return (
    <div className="space-y-6 pt-12 max-w-4xl mx-auto">

      <div className="bg-white rounded-3xl border-4 border-[#71A5D9] p-8 shadow-2xl">
        {!result ? (
          <>
            <h1 className="text-3xl font-black text-[#1E4D8C] mb-6 text-center uppercase">Test de Autoevaluación: Conoce tu Nivel de Ansiedad GAD-7</h1>
            <div className="space-y-6">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{i + 1}. {q}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleResponseChange(i, opt.value)}
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${
                          responses[i] === opt.value 
                            ? 'border-[#1E4D8C] bg-[#1E4D8C] text-white shadow-md' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-[#71A5D9] hover:bg-blue-50' // <-- TEXTO OSCURO AQUÍ
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button onClick={calculateResult} className="py-4 px-10 bg-[#1E4D8C] text-white font-black text-xl rounded-full hover:scale-105 transition shadow-xl">
                VER MI NIVEL ACTUAL
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-3xl font-black text-[#1E4D8C] mb-8 uppercase">Tu Estado Actual</h2>
            
            <div className="flex flex-col items-center gap-6 mb-8 bg-slate-900 p-8 rounded-3xl w-fit mx-auto shadow-inner">
              <div className={`w-16 h-16 rounded-full border-4 ${result.color === 'red' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] border-red-200' : 'bg-red-900/30 border-transparent'}`} />
              <div className={`w-16 h-16 rounded-full border-4 ${result.color === 'orange' || result.color === 'yellow' ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] border-yellow-100' : 'bg-yellow-900/30 border-transparent'}`} />
              <div className={`w-16 h-16 rounded-full border-4 ${result.color === 'green' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] border-green-200' : 'bg-green-900/30 border-transparent'}`} />
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-2xl font-bold text-slate-800 italic">{`"${result.msg}"`}</p>
              
              {isSaving && (
                <div className="flex justify-center items-center gap-2 text-blue-600 text-sm font-bold">
                  <Loader2 className="animate-spin" size={16} /> Guardando en tu expediente...
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start gap-3 mt-8">
                <AlertCircle className="text-blue-500 shrink-0" size={24} />
                <p className="text-blue-800 font-bold text-left">
                  Para una mejor evaluación, consulta con un profesional de la salud mental.
                </p>
              </div>
            </div>

            {/* SE ACTUALIZÓ EL ONCLICK AQUÍ PARA REINICIAR TODO */}
            <button onClick={handleResetTest} className="mt-12 text-slate-500 font-bold hover:text-[#1E4D8C] underline">
              Repetir el test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}