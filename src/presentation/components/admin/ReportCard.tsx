// src/presentation/components/admin/ReportCard.tsx
interface ReportCardProps {
  title: string;
  description: string;
  color: string;
  onPrint?: () => void; // Nueva prop para la función de impresión
}

export function ReportCard({ title, description, color, onPrint }: ReportCardProps) {
  return (
    <div className={`admin-report-card ${color} p-5 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[180px] transition-all hover:-translate-y-0.5`}>
      <div className="space-y-2">
        <h2 className="text-lg font-black text-gray-900 uppercase leading-tight">{title}</h2>
        <p className="text-[11px] font-bold text-gray-600 leading-snug">{description}</p>
      </div>

      <button 
        onClick={onPrint} // Ejecuta la función al hacer clic
        className="mt-4 self-start bg-white hover:bg-yellow-100 text-gray-900 border-2 border-gray-800 px-4 py-1.5 rounded-lg text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none uppercase"
      >
        Generar y Descargar PDF
      </button>
    </div>
  );
}