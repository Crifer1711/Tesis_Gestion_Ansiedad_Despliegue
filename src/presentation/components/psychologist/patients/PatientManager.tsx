"use client";
import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, FileText, ClipboardList, LucideIcon, X } from 'lucide-react';
import { PatientListItemDTO } from "@/domain/dtos/patient-management.dto";
import { getDetailedPatientDataAction } from "@/infrastructure/actions/psicologo.patient.actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MedicalRecordTab } from './MedicalRecordTab';

// --- CONSTANTES DEL TEST (Fuera para no recrearlas) ---
const GAD7_QUESTIONS = [
  "Se ha sentido nervioso(a), ansioso(a) o con los nervios de punta",
  "No ha sido capaz de parar o controlar su preocupación",
  "Se ha preocupado demasiado por diferentes cosas",
  "Ha tenido dificultad para relajarse",
  "Se ha sentido tan inquieto(a) que no ha podido quedarse quieto(a)",
  "Se ha sentido irritable o se ha enfadado fácilmente",
  "Ha sentido temor, como si algo terrible pudiera suceder"
];

const GAD7_LABELS = ["Nunca", "Varios días", "Más de la mitad de los días", "Casi todos los días"];

// --- INTERFACES DE DATOS ---
interface Appointment {
  fecha: string;
  hora: string;
  modalidad: string;
  motivo: string;
  estado: string;
}

interface MedicalRecord {
  fecha: string;
  nivelansiedad: number;
  notas: string;
}

interface TestResult {
  test: string;
  puntaje: number;
  interpretation: string;
  fecha: string;
  responses?: number[]; // Arreglo de números (0-3) guardados en BD
}

interface PatientDetails {
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  testResults: TestResult[];
}

interface Props {
  patients: PatientListItemDTO[];
}

// --- COMPONENTE PRINCIPAL ---
export function PatientManager({ patients }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(patients[0]?.id || null);
  const [activeTab, setActiveTab] = useState("Citas");
  
  const [details, setDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para el Modal de respuestas (Tipado correctamente, no any)
  const [selectedTestDetails, setSelectedTestDetails] = useState<TestResult | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedId);
  
  const filteredPatients = patients.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    async function fetchData() {
      if (!selectedId) return;
      setLoading(true);
      
      const res = await getDetailedPatientDataAction(selectedId);
      
      if (res.success && res.data) {
        // Casteamos el resultado a nuestra interfaz PatientDetails
        setDetails(res.data as PatientDetails);
      } else {
        setDetails(null);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [selectedId]);


  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="bg-[#EEF2FF] p-4 rounded-xl border border-blue-100 flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-blue-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar paciente por nombre..."
            className="w-full bg-transparent pl-11 pr-4 py-2 text-base text-slate-800 placeholder:text-slate-400 outline-none border-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LISTA DE PACIENTES */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-blue-600 p-4 rounded-t-xl shadow-md">
            <h3 className="text-white text-xs font-black uppercase tracking-widest text-center">
              Lista de Pacientes
            </h3>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedId(patient.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  selectedId === patient.id 
                  ? "bg-white border-blue-500 ring-2 ring-blue-100 shadow-md" 
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedId === patient.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                }`}>
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-base truncate uppercase">{patient.nombre}</p>
                  {/* --- INDICADOR VISUAL DE ÚLTIMA SESIÓN --- */}
  <div className="flex items-center gap-2 mt-1">
     <span className={`w-2 h-2 rounded-full ${patient.lastLogin !== "Nunca" ? 'bg-green-500' : 'bg-gray-300'}`}></span>
     <p className="text-[10px] text-slate-500 font-semibold uppercase">
       En línea: <span className="text-blue-600">{patient.lastLogin}</span>
     </p>
  </div>
                  <p className="text-xs text-blue-600 font-medium truncate mt-0.5">{patient.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FICHA DETALLADA */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[550px]">
            {selectedPatient ? (
              <div className="p-6 sm:p-8">
                {/* Header de la Ficha */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 pb-8 border-b border-gray-100 items-center md:items-start">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <User size={48} className="md:w-16 md:h-16" />
                  </div>
                  <div className="flex-1 space-y-5 text-center md:text-left w-full">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
                      {selectedPatient.nombre}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <DetailStat label="Citas" value={details?.appointments?.length || 0} icon={Calendar} color="text-orange-500" />
                      <DetailStat label="Fichas" value={details?.medicalRecords?.length || 0} icon={FileText} color="text-blue-500" />
                      <DetailStat label="Test" value={details?.testResults?.length || 0} icon={ClipboardList} color="text-purple-500" />
                    </div>
                  </div>
                </div>
                {/* --- NUEVO: GRÁFICO ESTADÍSTICO DE PROGRESO --- */}
                {/* Preparamos los datos ordenándolos por fecha (del más antiguo al más reciente) */}
                {!loading && details?.testResults && details.testResults.length > 0 && (
                  <div className="mt-8 mb-8">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                      Progreso de Ansiedad (Historial)
                    </h3>
                    <div className="h-[250px] w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={[...details.testResults]
                            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                            .map(test => ({
                              fecha: new Date(test.fecha).toLocaleDateString([], { day: '2-digit', month: 'short' }),
                              puntaje: test.puntaje,
                              interpretacion: test.interpretation
                            }))
                          }
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="fecha" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickMargin={10} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            domain={[0, 21]} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={((value: number) => [`${value} pts`, "Puntaje"]) as any}
                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="puntaje" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                            dot={{ r: 4, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {/* --- FIN DEL GRÁFICO --- */}

                {/* Navegación de Pestañas */}
                <div className="mt-8">
                  <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                    {['Citas', 'Ficha Psicológica', 'Resultados Test'].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-2 text-xs md:text-sm font-black uppercase border-r last:border-r-0 border-gray-300 transition-colors ${
                          activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Contenido dinámico */}
                  <div className="mt-6">
                    {loading ? (
                      <div className="p-12 text-center animate-pulse text-gray-500 font-medium text-sm">
                        Obteniendo datos del paciente...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* PESTAÑA: CITAS */}
                        {activeTab === 'Citas' && details?.appointments.map((app, i) => (
                          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="font-bold text-base uppercase text-gray-800 mb-1">{app.motivo}</p>
                              <p className="text-sm text-gray-500 font-medium">
                                {new Date(app.fecha).toLocaleDateString()} - {app.hora} <span className="text-gray-400">({app.modalidad})</span>
                              </p>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                              {app.estado}
                            </span>
                          </div>
                        ))}

                        {/* PESTAÑA: FICHA MÉDICA */}
                        {activeTab === 'Ficha Psicológica' && (
        <MedicalRecordTab 
     patientId={selectedPatient.id} 
     patientName={selectedPatient.nombre} 
     patientPhone={selectedPatient.telefono} 
  />
)}

                        {/* PESTAÑA: RESULTADOS TEST */}
                        {activeTab === 'Resultados Test' && (
                          <div className="space-y-4">
                            {details?.testResults && details.testResults.length > 0 ? (
                              details.testResults.map((test, index) => (
                                <div key={index} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-blue-400 transition-colors flex justify-between items-center">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-black text-[#1E4D8C] uppercase text-sm">{test.test}</h4>
                                      <span className="text-xs text-gray-400 font-medium">
                                        {test.fecha ? new Date(test.fecha).toLocaleDateString() : 'Fecha no disponible'}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 items-center">
                                      <div className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                        <span className="text-xs font-bold text-slate-700">Puntaje: {test.puntaje}/21</span>
                                      </div>
                                      <div className={`px-4 py-1.5 rounded-full text-white text-xs font-black uppercase shadow-sm ${
                                        test.puntaje >= 15 ? 'bg-red-500' : test.puntaje >= 10 ? 'bg-orange-500' : 'bg-green-500'
                                      }`}>
                                        {test.interpretation}
                                      </div>
                                    </div>
                                  </div>

                                  {/* BOTÓN VER RESPUESTAS (Aparece solo si hay respuestas guardadas) */}
                                  {test.responses && (
                                    <button 
                                      onClick={() => setSelectedTestDetails(test)}
                                      className="text-[11px] font-black text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl border-2 border-blue-100 transition-all uppercase tracking-tight"
                                    >
                                      Ver Respuestas
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl py-12">
                                <p className="text-gray-500 font-medium text-sm">No hay tests registrados para este paciente.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                    <p className="text-gray-500 text-xs font-medium">
                      Mostrando información de <span className="text-blue-600 font-bold uppercase">{activeTab}</span> para {selectedPatient.nombre.split(' ')[0]}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-gray-400 bg-gray-50/50">
                <User size={64} className="mb-4 text-gray-300" />
                <p className="font-medium text-base text-gray-500">Selecciona un estudiante de la lista lateral</p>
                <p className="text-sm text-gray-400 mt-1">Podrás ver sus citas, fichas y resultados de test.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DE RESPUESTAS --- */}
      {selectedTestDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">Detalle de Respuestas</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Test: {selectedTestDetails.test}</p>
              </div>
              <button 
                onClick={() => setSelectedTestDetails(null)} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} className="text-current" />
              </button>
            </div>

            {/* Cuerpo Modal */}
            <div className="p-6 overflow-y-auto space-y-5">
              {GAD7_QUESTIONS.map((pregunta, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex gap-4 items-start">
                    <span className="bg-white w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-[11px] font-black text-blue-600 flex-shrink-0 shadow-sm">
                      {i + 1}
                    </span>
                    <div className="space-y-2">
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{pregunta}</p>
                      <p className="text-xs font-black text-blue-700 uppercase tracking-wide">
                        Respuesta: {selectedTestDetails.responses?.[i] !== undefined 
                          ? GAD7_LABELS[selectedTestDetails.responses[i]] 
                          : "No registrada"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedTestDetails(null)}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[11px] hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTE ---
interface DetailStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

function DetailStat({ label, value, icon: Icon, color }: DetailStatProps) {
  return (
    <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide leading-none mb-1">{label}</span>
        <span className="text-sm font-black text-gray-800">{value}</span>
      </div>
    </div>
  );
}