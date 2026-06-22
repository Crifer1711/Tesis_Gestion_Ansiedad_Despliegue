"use client";
import React, { useState, useEffect } from "react";
import { Save, Edit3, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import { MedicalRecordDTO } from "@/domain/dtos/medical-record.dto";
import { getMedicalRecordAction, saveMedicalRecordAction } from "@/infrastructure/actions/medical-record.actions";

interface Props {
  patientId: string;
  patientName: string;
  patientPhone: string;
}

export function MedicalRecordTab({ patientId, patientName, patientPhone }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MedicalRecordDTO>({ patientId });

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      const res = await getMedicalRecordAction(patientId);
      if (res.success && res.data) {
        setFormData(res.data);
      }
      setLoading(false);
    }
    fetchRecord();
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveMedicalRecordAction(formData);
    if (res.success) {
      setIsEditing(false);
    } else {
      toast.error("Error al guardar los datos.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando ficha médica...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
      {/* HEADER Y BOTÓN DE EDICIÓN */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-lg font-black text-[#1E4D8C]">Ficha Clínica Estructurada</h3>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition">
            <Edit3 size={16} /> Editar Ficha
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar Cambios
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* I. IDENTIFICACIÓN */}
        <section>
          <h4 className="font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded">I. IDENTIFICACIÓN</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputRow label="Nombre" value={patientName} readOnly />
            <InputRow label="Teléfono / Contacto" value={patientPhone} readOnly />
            <InputRow label="Edad" name="edad" value={formData.edad} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Escolaridad" name="escolaridad" value={formData.escolaridad} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Estab. Educacional" name="estabEducacional" value={formData.estabEducacional} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Con quién vive" name="conQuienVive" value={formData.conQuienVive} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Domicilio" name="domicilio" value={formData.domicilio} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Quién consulta" name="quienConsulta" value={formData.quienConsulta} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Interconsulta" name="interconsulta" value={formData.interconsulta} isEditing={isEditing} onChange={handleChange} />
            <InputRow label="Derivado por" name="derivadoPor" value={formData.derivadoPor} isEditing={isEditing} onChange={handleChange} />
          </div>
        </section>

        {/* II. MOTIVO DE CONSULTA */}
        <section>
          <h4 className="font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded">II. MOTIVO DE CONSULTA</h4>
          <div className="space-y-4">
            <TextAreaRow label="Motivo de consulta de padres o tutores" name="motivoPadres" value={formData.motivoPadres} isEditing={isEditing} onChange={handleChange} />
            <TextAreaRow label="Motivo de consulta del niño/joven" name="motivoNino" value={formData.motivoNino} isEditing={isEditing} onChange={handleChange} />
            <TextAreaRow label="Motivo de consulta latente" name="motivoLatente" value={formData.motivoLatente} isEditing={isEditing} onChange={handleChange} />
            <TextAreaRow label="¿Qué han tratado de hacer para solucionarlo? – ¿Qué esperan conseguir?" name="intentosSolucion" value={formData.intentosSolucion} isEditing={isEditing} onChange={handleChange} />
            <TextAreaRow label="Sintomatología presentada – Características conductuales" name="sintomatologiaConductual" value={formData.sintomatologiaConductual} isEditing={isEditing} onChange={handleChange} />
            <TextAreaRow label="Sintomatología presentada – Características emocionales" name="sintomatologiaEmocional" value={formData.sintomatologiaEmocional} isEditing={isEditing} onChange={handleChange} />
          </div>
        </section>
      </div>
    </div>
  );
}

// Sub-componentes auxiliares para mantener el código limpio
const InputRow = ({ label, name, value, type = "text", isEditing, readOnly, onChange }: any) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
    {isEditing && !readOnly ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="p-2 border border-blue-200 rounded-md bg-white text-slate-900 caret-[#1E4D8C] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
      />
    ) : (
      <div className="p-2 bg-slate-50 rounded-md text-sm text-slate-800 border border-transparent min-h-[38px]">
        {value || <span className="text-slate-400 italic">No registrado</span>}
      </div>
    )}
  </div>
);

const TextAreaRow = ({ label, name, value, isEditing, onChange }: any) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
    {isEditing ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={3}
        className="p-3 border border-blue-200 rounded-md bg-white text-slate-900 caret-[#1E4D8C] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none text-sm resize-none"
      />
    ) : (
      <div className="p-3 bg-slate-50 rounded-md text-sm text-slate-800 border border-transparent min-h-[80px] whitespace-pre-wrap">
        {value || <span className="text-slate-400 italic">No registrado</span>}
      </div>
    )}
  </div>
);