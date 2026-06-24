import { AdminNavbar } from "@/presentation/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      <AdminNavbar />
      <main className="px-4 md:px-8 pb-4 md:pb-8 pt-28">
        {children}
      </main>
    </div>
  );
}