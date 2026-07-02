'use client'

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportCard } from "./ReportCard";

// 1. Definimos la interfaz real para evitar el error 'any'
export interface UserData {
  id: string | number;
  name: string;
  email: string;
  contacto: string;
  status: string;
  role: string;
  fecha_registro: string;
}

interface ReportTableData {
  id: string | number;
  name: string;
  email: string;
  contacto: string;
  role: string;
  status: string;
  date: string;
}

export function ReportManagement({ allUsers = [] }: { allUsers: UserData[] }) {
  const mapUsersByType = (type: string): ReportTableData[] => {
    let filtered = [...allUsers];
    if (type === "psicologos") {
      filtered = allUsers.filter((u) => u.role === "PSICOLOGO");
    } else if (type === "pacientes") {
      filtered = allUsers.filter((u) => u.role === "ESTUDIANTE");
    }

    return filtered.map((u) => ({
      id: u.id,
      name: u.name || "N/A",
      email: u.email || "N/A",
      contacto: u.contacto || "N/A",
      role: u.role || "N/A",
      status: u.status || "Activo",
      date: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString("es-EC") : "N/A",
    }));
  };

  const handleGeneratePdf = (title: string, type: string) => {
    const rows = mapUsersByType(type);
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const issuedAt = new Date().toLocaleString("es-EC");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MINDPEACE - REPORTE ADMINISTRATIVO", 40, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Tipo: ${title}`, 40, 72);
    doc.text(`Fecha de emision: ${issuedAt}`, 40, 90);
    doc.text(`Total de registros: ${rows.length}`, 40, 108);

    autoTable(doc, {
      startY: 126,
      head: [["ID", "Nombre", "Correo", "Contacto", "Rol", "Estado", "Fecha Registro"]],
      body: rows.map((item) => [
        String(item.id),
        item.name,
        item.email,
        item.contacto,
        item.role,
        item.status,
        item.date,
      ]),
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: [20, 20, 20],
        cellPadding: 6,
        lineColor: [210, 214, 220],
        lineWidth: 0.6,
      },
      headStyles: {
        fillColor: [30, 77, 140],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [244, 248, 253],
      },
      margin: { left: 24, right: 24 },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.setTextColor(90);
        doc.text(`Pagina ${pageNumber} de ${pageCount}`, doc.internal.pageSize.getWidth() - 110, doc.internal.pageSize.getHeight() - 16);
      },
    });

    const safeTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    doc.save(`reporte-${safeTitle}.pdf`);
  };

  const reportTypes = [
    { title: "Reporte General", type: "general", description: 'Estadísticas de todos los usuarios del sistema.', color: "bg-[#FFF0EA]" },
    { title: "Reporte de Psicólogos", type: "psicologos", description: 'Lista de especialistas y estado actual.', color: "bg-[#F3F0FF]" },
    { title: "Reporte de Pacientes", type: "pacientes", description: "Lista de estudiantes y nivel de actividad.", color: "bg-[#FFF9E5]" },
    { title: "Reporte de Actividades", type: "actividades", description: 'Resumen de herramientas más utilizadas.', color: "bg-[#E7F9ED]" }
  ];

  return (
    <div className="admin-reports-page max-w-5xl mx-auto space-y-6">
      {/* Interfaz de Pantalla */}
      <div className="bg-[#D1E7FF] p-5 rounded-xl border-2 border-gray-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">REPORTES</h1>
        <p className="text-xs font-bold text-gray-700 mt-0.5">
          Genera reportes oficiales y descarga el PDF con un clic.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
        {reportTypes.map((report, index) => (
          <ReportCard key={index} {...report} onPrint={() => handleGeneratePdf(report.title, report.type)} />
        ))}
      </div>
    </div>
  );
}