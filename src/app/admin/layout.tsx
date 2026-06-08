"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Megaphone,
  Package,
  MessageCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

interface NavChild { href: string; label: string }
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: ShoppingCart,
    children: [
      { href: "/admin/pedidos", label: "Digital" },
      { href: "/admin/pedidos/fisicos", label: "Físico (WhatsApp)" },
    ],
  },
  { href: "/admin/precos", label: "Preços", icon: DollarSign },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/atendimento", label: "Atendimento", icon: MessageCircle },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      fetch("/api/admin/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [isLoginPage]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Don't show layout on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="font-bold text-gray-900">Paper Bloom Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900">Paper Bloom</h1>
            <p className="text-sm text-gray-500">Painel Admin</p>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isInSection = pathname === item.href || pathname.startsWith(item.href + "/");
              const isExact = pathname === item.href;
              const hasChildren = !!item.children?.length;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => !hasChildren && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isExact && !hasChildren
                        ? "bg-pink-50 text-pink-600"
                        : isInSection && hasChildren
                        ? "text-pink-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium flex-1">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isInSection ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>

                  {hasChildren && isInSection && (
                    <div className="ml-4 mt-1 mb-2 border-l-2 border-pink-100 pl-3 space-y-1">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              childActive
                                ? "bg-pink-50 text-pink-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            {user && (
              <div className="mb-3 px-4">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
