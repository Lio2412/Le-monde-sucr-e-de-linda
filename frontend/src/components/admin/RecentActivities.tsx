'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, FileText, MessageSquare, UserPlus } from 'lucide-react';

interface Activity {
  id: string;
  type: 'recipe_created' | 'recipe_updated' | 'comment_added' | 'user_registered';
  title: string;
  date: string;
  user: {
    id: string;
    pseudo: string;
  };
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityIcons = {
  recipe_created: FileText,
  recipe_updated: FileText,
  comment_added: MessageSquare,
  user_registered: UserPlus,
};

const activityColors = {
  recipe_created: 'text-green-500',
  recipe_updated: 'text-blue-500',
  comment_added: 'text-purple-500',
  user_registered: 'text-yellow-500',
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Aucune activité récente à afficher
          </p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`${colorClass} mt-1`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-gray-800">{activity.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{activity.user.pseudo}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
