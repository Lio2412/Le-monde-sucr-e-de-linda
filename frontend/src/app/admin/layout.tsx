'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ChefHat, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  BarChart, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Recettes', href: '/admin/recettes', icon: ChefHat },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Médias', href: '/admin/medias', icon: ImageIcon },
  { name: 'Commentaires', href: '/admin/commentaires', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar Mobile */}
        <div className="lg:hidden">
          <button
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <Link href="/admin" className="text-xl font-semibold text-gray-800">
                Administration
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                      isActive
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={cn(
          "transition-all duration-200",
          "lg:ml-64 min-h-screen"
        )}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 