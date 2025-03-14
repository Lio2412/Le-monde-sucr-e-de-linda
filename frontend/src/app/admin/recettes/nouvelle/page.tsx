'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVirtualizer } from '@tanstack/react-virtual';
import { toast } from 'react-hot-toast';
import { adminService } from '@/services/admin';

// Import dynamique de l'éditeur
const Editor = dynamic(() => import('@/components/editor/Editor'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

// Schéma de validation
const recipeSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  preparationTime: z.number().min(1, 'Le temps de préparation est requis'),
  cookingTime: z.number().min(1, 'Le temps de cuisson est requis'),
  difficulty: z.string().min(1, 'La difficulté est requise'),
  servings: z.number().min(1, 'Le nombre de portions est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  ingredients: z.array(z.string().min(1, 'L\'ingrédient ne peut pas être vide')),
  instructions: z.string().min(10, 'Les instructions doivent contenir au moins 10 caractères'),
  status: z.string().optional()
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const categories = [
  'Gâteaux',
  'Tartes',
  'Viennoiseries',
  'Biscuits',
  'Entremets'
];

const difficultes = ['Facile', 'Moyen', 'Difficile'];

export default function NouvelleRecettePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [''],
      instructions: '',
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optimisation des ingrédients avec virtualisation
  const ingredients = watch('ingredients');
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: ingredients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  // Gestion optimisée des images
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérification de la taille et du type
      if (file.size > 10 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Mémoisation des options de catégories et difficultés
  const categoryOptions = useMemo(() => 
    categories.map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    )), 
    []
  );

  const difficultyOptions = useMemo(() => 
    difficultes.map(diff => (
      <option key={diff} value={diff}>{diff}</option>
    )), 
    []
  );

  const onSubmit = async (data: RecipeFormData) => {
    try {
      setIsSubmitting(true);
      
      const recipeData = {
        ...data,
        status: 'DRAFT'
      };

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        // Upload de l'image d'abord
        const imageResponse = await adminService.uploadImage(formData);
        recipeData.imageUrl = imageResponse.url;
      }

      await adminService.createRecipe(recipeData);
      toast.success('Recette créée avec succès');
      router.push('/admin/recettes');
    } catch (error) {
      console.error('Erreur lors de la création de la recette:', error);
      toast.error('Erreur lors de la création de la recette');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = useCallback(() => {
    const currentIngredients = watch('ingredients');
    setValue('ingredients', [...currentIngredients, '']);
  }, [watch, setValue]);

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
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⌛</span>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description courte
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
                  Temps de préparation (min)
                </label>
                <input
                  type="number"
                  id="preparationTime"
                  {...register('preparationTime')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
                {errors.preparationTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.preparationTime.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
                  Temps de cuisson (min)
                </label>
                <input
                  type="number"
                  id="cookingTime"
                  {...register('cookingTime')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
                {errors.cookingTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.cookingTime.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
                  Nombre de portions
                </label>
                <input
                  type="number"
                  id="servings"
                  {...register('servings')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
                {errors.servings && (
                  <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categoryOptions}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                  Difficulté
                </label>
                <select
                  id="difficulty"
                  {...register('difficulty')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Sélectionner une difficulté</option>
                  {difficultyOptions}
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image principale avec preview et validation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Image principale
          </h2>
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="mt-2">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                    {imagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF jusqu'à 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Liste d'ingrédients virtualisée */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ingrédients
          </h2>
          <div ref={parentRef} className="h-[300px] overflow-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <input
                    type="text"
                    {...register(`ingredients.${virtualRow.index}`)}
                    placeholder="Ex: 200g de farine"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            + Ajouter un ingrédient
          </button>
        </div>

        {/* Éditeur d'instructions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Instructions
          </h2>
          <Editor
            value={watch('instructions')}
            onChange={(value) => setValue('instructions', value)}
          />
          {errors.instructions && (
            <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
          )}
        </div>
      </form>
    </div>
  );
} 