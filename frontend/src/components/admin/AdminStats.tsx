'use client';

import { Users, BookOpen, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStatsProps {
  totalUsers: number;
  totalRecipes: number;
  pendingRecipes: number;
  totalComments: number;
}

export default function AdminStats({
  totalUsers,
  totalRecipes,
  pendingRecipes,
  totalComments,
}: AdminStatsProps) {
  const stats = [
    {
      label: 'Utilisateurs',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Recettes',
      value: totalRecipes,
      icon: BookOpen,
      color: 'bg-green-100 text-green-800',
    },
    {
      label: 'En attente',
      value: pendingRecipes,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: 'Commentaires',
      value: totalComments,
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.label}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
