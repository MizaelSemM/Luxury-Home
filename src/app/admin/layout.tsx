"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-graphite-50">
      <header className="bg-graphite-950 border-b border-white/5">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-bronze-500" />
              <span className="text-lg font-display font-bold text-white">
                Luxury<span className="gradient-text">Home</span>
              </span>
              <span className="hidden sm:inline text-sm text-graphite-500 ml-2">
                — Painel Administrativo
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-graphite-400 hover:text-white transition-colors"
                target="_blank"
              >
                Ver site
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-graphite-400 
                           hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="section-container py-8">{children}</main>
    </div>
  );
}
