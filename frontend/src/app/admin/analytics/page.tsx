"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, BarChart, PieChart, TrendingUp, TrendingDown, Users, Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [selectedPeriod, setSelectedPeriod] = useState('30j');

  const metrics = {
    recettes: {
      vues: 12500,
      tendance: +15,
      likes: 850,
      commentaires: 230,
      categories: [
        { name: 'Desserts', value: 45 },
        { name: 'Plats', value: 30 },
        { name: 'Entrées', value: 25 },
      ],
    },
    blog: {
      vues: 8700,
      tendance: +8,
      likes: 420,
      commentaires: 180,
      categories: [
        { name: 'Conseils', value: 40 },
        { name: 'Actualités', value: 35 },
        { name: 'Événements', value: 25 },
      ],
    },
  };

  const StatCard = ({ title, value, trend, icon: Icon }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs mt-1">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
            {Math.abs(trend)}% par rapport à la période précédente
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7j">7 derniers jours</SelectItem>
                <SelectItem value="30j">30 derniers jours</SelectItem>
                <SelectItem value="90j">90 derniers jours</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            {selectedPeriod === 'custom' && (
              <div className="relative">
                <Button variant="outline">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'P', { locale: fr })} -{' '}
                        {format(dateRange.to, 'P', { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, 'P', { locale: fr })
                    )
                  ) : (
                    <span>Sélectionner une période</span>
                  )}
                </Button>
                <div className="absolute mt-2 right-0 z-10">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="recettes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="recettes" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Vues totales"
                value={metrics.recettes.vues}
                trend={metrics.recettes.tendance}
                icon={Eye}
              />
              <StatCard
                title="Visiteurs uniques"
                value={Math.round(metrics.recettes.vues * 0.7)}
                trend={12}
                icon={Users}
              />
              <StatCard
                title="Likes"
                value={metrics.recettes.likes}
                trend={18}
                icon={ThumbsUp}
              />
              <StatCard
                title="Commentaires"
                value={metrics.recettes.commentaires}
                trend={-5}
                icon={MessageSquare}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des vues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Graphique d'évolution des vues
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Graphique de répartition
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Vues totales"
                value={metrics.blog.vues}
                trend={metrics.blog.tendance}
                icon={Eye}
              />
              <StatCard
                title="Visiteurs uniques"
                value={Math.round(metrics.blog.vues * 0.7)}
                trend={10}
                icon={Users}
              />
              <StatCard
                title="Likes"
                value={metrics.blog.likes}
                trend={15}
                icon={ThumbsUp}
              />
              <StatCard
                title="Commentaires"
                value={metrics.blog.commentaires}
                trend={-3}
                icon={MessageSquare}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des vues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Graphique d'évolution des vues
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Graphique de répartition
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 