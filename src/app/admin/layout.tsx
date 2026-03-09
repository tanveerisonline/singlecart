import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Bell,
  Search,
  Settings
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const theme = await db.themeSetting.findFirst({
    where: { id: "default" }
  });

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar - Moved to a separate client component for interactivity */}
      <AdminSidebar session={session} logoUrl={theme?.logoUrl} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center flex-1 max-w-md relative group">
            <Search className="h-4 w-4 absolute left-3 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-primary hover:opacity-90/5 rounded-xl transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <Link href="/admin/settings" className="p-2 text-gray-400 hover:text-primary hover:opacity-90/5 rounded-xl transition-all">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
