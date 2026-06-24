import { PsychologistNavbar } from "@/presentation/components/psychologist/PsychologistNavbar";

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <PsychologistNavbar />
      <main className="px-8 pb-8 pt-28">
        {children}
      </main>
    </div>
  );
}