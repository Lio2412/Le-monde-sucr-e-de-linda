import { NextResponse } from 'next/server';
import { recetteSchema } from '@/services/recettes.service';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Récupérer la recette avec Supabase
    const { data: recette, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        steps (*),
        categories (*),
        user:user_id (id, name, email, image)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    if (!recette) {
      return NextResponse.json(
        { error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    // Trier les étapes par ordre
    if (recette.steps) {
      recette.steps.sort((a, b) => a.order - b.order);
    }

    return NextResponse.json(recette);
  } catch (error) {
    console.error('Erreur lors de la récupération de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la recette' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = recetteSchema.partial().parse(data);
    
    // Extraire les relations pour les traiter séparément
    const { ingredients, steps, categories, ...recipeData } = validatedData;

    // Mise à jour des données de base de la recette
    const { data: updatedRecipe, error: updateError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de la recette: ${updateError.message}`);
    }

    // Mise à jour des ingrédients si fournis
    if (ingredients) {
      // Supprimer les ingrédients existants
      const { error: deleteIngredientsError } = await supabase
        .from('ingredients')
        .delete()
        .eq('recipe_id', params.id);

      if (deleteIngredientsError) {
        throw new Error(`Erreur lors de la suppression des ingrédients: ${deleteIngredientsError.message}`);
      }
      
      // Créer les nouveaux ingrédients
      const { error: insertIngredientsError } = await supabase
        .from('ingredients')
        .insert(
          ingredients.map(ing => ({
            ...ing,
            recipe_id: params.id
          }))
        );

      if (insertIngredientsError) {
        throw new Error(`Erreur lors de la création des ingrédients: ${insertIngredientsError.message}`);
      }
    }

    // Mise à jour des étapes si fournies
    if (steps) {
      // Supprimer les étapes existantes
      const { error: deleteStepsError } = await supabase
        .from('steps')
        .delete()
        .eq('recipe_id', params.id);

      if (deleteStepsError) {
        throw new Error(`Erreur lors de la suppression des étapes: ${deleteStepsError.message}`);
      }
      
      // Créer les nouvelles étapes
      const { error: insertStepsError } = await supabase
        .from('steps')
        .insert(
          steps.map(step => ({
            ...step,
            recipe_id: params.id
          }))
        );

      if (insertStepsError) {
        throw new Error(`Erreur lors de la création des étapes: ${insertStepsError.message}`);
      }
    }

    // Mise à jour des catégories si fournies
    if (categories) {
      // Déconnecter toutes les catégories existantes
      const { error: deleteCategoriesError } = await supabase
        .from('recipe_categories')
        .delete()
        .eq('recipe_id', params.id);

      if (deleteCategoriesError) {
        throw new Error(`Erreur lors de la suppression des associations de catégories: ${deleteCategoriesError.message}`);
      }
      
      // Pour chaque catégorie, la trouver ou la créer, puis l'associer à la recette
      for (const categoryName of categories) {
        // Vérifier si la catégorie existe
        const { data: existingCategory, error: findCategoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .maybeSingle();

        if (findCategoryError && findCategoryError.code !== 'PGRST116') {
          throw new Error(`Erreur lors de la recherche de la catégorie: ${findCategoryError.message}`);
        }

        let categoryId;
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Créer la catégorie si elle n'existe pas
          const { data: newCategory, error: createCategoryError } = await supabase
            .from('categories')
            .insert({ name: categoryName })
            .select('id')
            .single();

          if (createCategoryError) {
            throw new Error(`Erreur lors de la création de la catégorie: ${createCategoryError.message}`);
          }
          categoryId = newCategory.id;
        }

        // Associer la catégorie à la recette
        const { error: associateCategoryError } = await supabase
          .from('recipe_categories')
          .insert({
            recipe_id: params.id,
            category_id: categoryId
          });

        if (associateCategoryError) {
          throw new Error(`Erreur lors de l'association de la catégorie: ${associateCategoryError.message}`);
        }
      }
    }

    // Récupérer la recette mise à jour avec toutes ses relations
    const { data: fullRecipe, error: getRecipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        steps (*),
        categories (*),
        user:user_id (id, name, email, image)
      `)
      .eq('id', params.id)
      .single();

    if (getRecipeError) {
      throw new Error(`Erreur lors de la récupération de la recette mise à jour: ${getRecipeError.message}`);
    }

    // Trier les étapes par ordre
    if (fullRecipe.steps) {
      fullRecipe.steps.sort((a, b) => a.order - b.order);
    }

    return NextResponse.json(fullRecipe);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la recette', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Supprimer d'abord les relations pour éviter les contraintes de clé étrangère
    const promises = [
      supabase.from('ingredients').delete().eq('recipe_id', params.id),
      supabase.from('steps').delete().eq('recipe_id', params.id),
      supabase.from('recipe_categories').delete().eq('recipe_id', params.id)
    ];

    const results = await Promise.all(promises);
    
    // Vérifier s'il y a eu des erreurs dans les suppressions des relations
    for (const result of results) {
      if (result.error) {
        throw new Error(`Erreur lors de la suppression des relations: ${result.error.message}`);
      }
    }

    // Supprimer la recette elle-même
    const { error: deleteRecipeError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.id);

    if (deleteRecipeError) {
      throw new Error(`Erreur lors de la suppression de la recette: ${deleteRecipeError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la recette', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}