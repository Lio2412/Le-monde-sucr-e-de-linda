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
  'Gâteaux',
  'Tartes',
  'Viennoiseries',
  'Biscuits',
  'Entremets'
];

const difficultes = ['Facile', 'Moyen', 'Difficile'];

export default function NouvelleRecettePage() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    tempsPreparation: '',
    tempsCuisson: '',
    difficulte: '',
    portions: '',
    ingredients: [''],
    instructions: '',
    categorie: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la soumission du formulaire
    console.log('Données du formulaire:', formData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/recettes"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle Recette
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description courte
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="tempsPreparation" className="block text-sm font-medium text-gray-700">
                  Temps de préparation (min)
                </label>
                <input
                  type="number"
                  id="tempsPreparation"
                  value={formData.tempsPreparation}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempsPreparation: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              <div>
                <label htmlFor="tempsCuisson" className="block text-sm font-medium text-gray-700">
                  Temps de cuisson (min)
                </label>
                <input
                  type="number"
                  id="tempsCuisson"
                  value={formData.tempsCuisson}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempsCuisson: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              <div>
                <label htmlFor="portions" className="block text-sm font-medium text-gray-700">
                  Nombre de portions
                </label>
                <input
                  type="number"
                  id="portions"
                  value={formData.portions}
                  onChange={(e) => setFormData(prev => ({ ...prev, portions: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label htmlFor="difficulte" className="block text-sm font-medium text-gray-700">
                  Difficulté
                </label>
                <select
                  id="difficulte"
                  value={formData.difficulte}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulte: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Sélectionner une difficulté</option>
                  {difficultes.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
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

        {/* Ingrédients */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ingrédients
          </h2>
          <div className="space-y-4">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder="Ex: 200g de farine"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              + Ajouter un ingrédient
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Instructions
          </h2>
          <Editor
            value={formData.instructions}
            onChange={(value) => setFormData(prev => ({ ...prev, instructions: value }))}
          />
        </div>
      </form>
    </div>
  );
} 