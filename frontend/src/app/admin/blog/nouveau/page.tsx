'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import dynamique de l'éditeur pour éviter les erreurs SSR
const Editor = dynamic(() => import('@/components/editor/Editor'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

const categories = [
  'Techniques',
  'Tutoriels',
  'Conseils',
  'Actualités',
  'Événements'
];

export default function NouvelArticlePage() {
  const [formData, setFormData] = useState({
    titre: '',
    extrait: '',
    contenu: '',
    categorie: '',
    tags: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la soumission du formulaire
    console.log('Données du formulaire:', formData);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvel Article
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                type="text"
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div>
              <label htmlFor="extrait" className="block text-sm font-medium text-gray-700">
                Extrait
              </label>
              <textarea
                id="extrait"
                rows={3}
                value={formData.extrait}
                onChange={(e) => setFormData(prev => ({ ...prev, extrait: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                placeholder="Un bref résumé de votre article..."
              />
            </div>

            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                id="categorie"
                value={formData.categorie}
                onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                placeholder="Séparez les tags par des virgules"
              />
            </div>
          </div>
        </div>

        {/* Image principale */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Image principale
          </h2>
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Ajouter une image
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF jusqu'à 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Contenu de l'article
          </h2>
          <Editor
            value={formData.contenu}
            onChange={(value) => setFormData(prev => ({ ...prev, contenu: value }))}
          />
        </div>
      </form>
    </div>
  );
} 