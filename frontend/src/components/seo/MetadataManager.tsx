"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface MetadataFormProps {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  onSave: (metadata: any) => void;
}

export function MetadataForm({ title, description, keywords, ogImage, onSave }: MetadataFormProps) {
  const [metadata, setMetadata] = useState({
    title,
    description,
    keywords,
    ogImage,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(metadata);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Titre</label>
        <Input
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          placeholder="Titre de la page"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground">
          {metadata.title.length}/60 caractères
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="Description de la page"
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground">
          {metadata.description.length}/160 caractères
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mots-clés</label>
        <Input
          value={metadata.keywords}
          onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
          placeholder="mot-clé-1, mot-clé-2, mot-clé-3"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image Open Graph</label>
        <Input
          value={metadata.ogImage}
          onChange={(e) => setMetadata({ ...metadata, ogImage: e.target.value })}
          placeholder="URL de l'image Open Graph"
        />
      </div>

      <Button type="submit">Enregistrer les métadonnées</Button>
    </form>
  );
}

export function MetadataPreview({ metadata }: { metadata: any }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="text-blue-600 hover:underline text-xl line-clamp-1">
          {metadata.title}
        </h3>
        <p className="text-green-700 text-sm">
          {window.location.origin}
        </p>
        <p className="text-gray-600 text-sm line-clamp-2">
          {metadata.description}
        </p>
      </div>
    </div>
  );
}

export default function MetadataManager() {
  const [activeContent, setActiveContent] = useState({
    title: "Le Monde Sucré de Linda - Recettes et Blog Culinaire",
    description: "Découvrez des recettes délicieuses et des articles passionnants sur la cuisine. Le Monde Sucré de Linda vous propose une expérience culinaire unique.",
    keywords: "recettes, cuisine, blog culinaire, pâtisserie, desserts",
    ogImage: "/images/og-default.jpg",
  });

  const handleSave = async (metadata: any) => {
    try {
      // TODO: Implémenter la sauvegarde des métadonnées
      console.log('Métadonnées sauvegardées:', metadata);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métadonnées:', error);
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
          <h1 className="text-2xl font-bold">Gestion des Métadonnées SEO</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Métadonnées du Site</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit" className="space-y-4">
              <TabsList>
                <TabsTrigger value="edit">Édition</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>

              <TabsContent value="edit">
                <MetadataForm
                  title={activeContent.title}
                  description={activeContent.description}
                  keywords={activeContent.keywords}
                  ogImage={activeContent.ogImage}
                  onSave={handleSave}
                />
              </TabsContent>

              <TabsContent value="preview">
                <MetadataPreview metadata={activeContent} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 