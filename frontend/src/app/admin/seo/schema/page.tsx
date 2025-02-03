"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Code, Copy, Check } from 'lucide-react';
import { metadataService } from '@/services/metadata.service';
import { useToast } from '@/components/ui/use-toast';

export default function SchemaPage() {
  const [activeSchema, setActiveSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const recipeExample = {
    title: "Gâteau au Chocolat",
    description: "Un délicieux gâteau au chocolat moelleux et facile à réaliser",
    publishedAt: "2024-02-02",
    image: "/images/gateau-chocolat.jpg",
    category: "Desserts",
    prepTime: "PT20M",
    cookTime: "PT30M",
    totalTime: "PT50M",
    servings: "8",
    ingredients: [
      "200g de chocolat noir",
      "200g de beurre",
      "200g de sucre",
      "4 œufs",
      "100g de farine"
    ],
    instructions: [
      "Préchauffer le four à 180°C",
      "Faire fondre le chocolat et le beurre",
      "Mélanger les œufs et le sucre",
      "Ajouter le mélange chocolat-beurre",
      "Incorporer la farine",
      "Cuire 30 minutes"
    ]
  };

  const blogPostExample = {
    title: "Les secrets d'un gâteau réussi",
    description: "Découvrez les astuces pour réussir vos gâteaux à tous les coups",
    publishedAt: "2024-02-02",
    updatedAt: "2024-02-02",
    image: "/images/astuces-gateau.jpg",
    slug: "secrets-gateau-reussi"
  };

  const handleGenerateSchema = (type: 'Recipe' | 'BlogPosting') => {
    try {
      const schema = type === 'Recipe' 
        ? metadataService.generateRecipeSchema(recipeExample)
        : metadataService.generateBlogPostSchema(blogPostExample);
      
      setActiveSchema(schema);
      toast({
        title: "Schéma généré avec succès",
        description: "Le schéma Schema.org a été généré et est prêt à être utilisé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du schéma.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeSchema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "Le schéma a été copié dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le schéma.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestion des Schémas Schema.org</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Générateur de Schémas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recipe" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recipe">Recettes</TabsTrigger>
                <TabsTrigger value="blog">Articles de Blog</TabsTrigger>
              </TabsList>

              <TabsContent value="recipe" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Générez un schéma Schema.org pour vos recettes afin d'améliorer leur visibilité dans les résultats de recherche.
                  </p>
                  <Button onClick={() => handleGenerateSchema('Recipe')}>
                    <Code className="h-4 w-4 mr-2" />
                    Générer le schéma Recette
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="blog" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Générez un schéma Schema.org pour vos articles de blog afin d'améliorer leur visibilité dans les résultats de recherche.
                  </p>
                  <Button onClick={() => handleGenerateSchema('BlogPosting')}>
                    <Code className="h-4 w-4 mr-2" />
                    Générer le schéma Article
                  </Button>
                </div>
              </TabsContent>

              {activeSchema && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Schéma généré</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? 'Copié !' : 'Copier'}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      {JSON.stringify(JSON.parse(activeSchema), null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions d'implémentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour implémenter le schéma généré sur votre site :
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Copiez le schéma généré</li>
              <li>
                Ajoutez-le dans la section <code className="bg-muted px-2 py-1 rounded">{'<head>'}</code> de votre page dans une balise script :
                <pre className="bg-muted p-4 rounded-lg mt-2">
                  <code>{`<script type="application/ld+json">
  // Collez le schéma ici
</script>`}</code>
                </pre>
              </li>
              <li>
                Vérifiez votre implémentation avec l'
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  outil de test des résultats enrichis de Google
                </a>
              </li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 