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
  X,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
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
    <>
      {/* Supprime le layout principal du site */}
      <style jsx global>{`
        body > div:first-child > header,
        body > div:first-child > nav {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 lg:hidden">
          <div className="flex items-center justify-between px-4 h-full">
            <button
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <div className="text-lg font-semibold text-gray-800">
              Administration
            </div>
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              title="Retour au site"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Overlay du menu mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link href="/admin/dashboard" className="text-xl font-semibold text-gray-800">
                Administration
              </Link>
              <Link
                href="/"
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                title="Retour au site"
              >
                <Home className="w-5 h-5 text-gray-600" />
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
        <div className="lg:pl-64">
          <main className="py-10 pt-20 lg:pt-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}