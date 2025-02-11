'use client';

import { Users, FileText, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function QuickAdminActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'Gestion Utilisateurs',
      icon: Users,
      action: () => router.push('/admin/users'),
      color: 'text-blue-500',
    },
    {
      label: 'Gestion Recettes',
      icon: FileText,
      action: () => router.push('/admin/recipes'),
      color: 'text-green-500',
    },
    {
      label: 'Configuration',
      icon: Settings,
      action: () => router.push('/admin/settings'),
      color: 'text-gray-500',
    },
    {
      label: 'Modération',
      icon: Shield,
      action: () => router.push('/admin/moderation'),
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Actions Administrateur</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
            onClick={action.action}
          >
            <action.icon className={`h-6 w-6 ${action.color}`} />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
