import { NextResponse } from 'next/server';
import { recetteSchema } from '@/services/recettes.service';
import { supabase, generateUUID, textSearchFilter } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Construction de la requête de base
    let query = supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        steps (*),
        categories:recipe_categories (
          category:categories(*)
        ),
        profiles:user_id (
          id, name, email, image
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Ajout des filtres de recherche
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filtrage par catégorie
    if (category) {
      query = query.in('id', 
        supabase
          .from('recipe_categories')
          .select('recipe_id')
          .eq('category_id', 
            supabase
              .from('categories')
              .select('id')
              .eq('name', category)
              .single()
          )
      );
    }

    // Exécution de la requête
    const { data: recettes, error } = await query;

    // Requête pour le nombre total de résultats
    const { count: total, error: countError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    if (error || countError) {
      throw new Error(error?.message || countError?.message);
    }

    return NextResponse.json({
      recettes: recettes || [],
      pagination: {
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recettes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = recetteSchema.parse(data);

    // Extraire les catégories et les relations pour les traiter séparément
    const { categories, ingredients, steps, ...recipeData } = validatedData;

    // Conversion des noms de champs au format snake_case pour Supabase
    const recipePayload = {
      id: recipeData.id || generateUUID(),
      title: recipeData.title,
      description: recipeData.description,
      image: recipeData.image,
      servings: recipeData.servings,
      prep_time: recipeData.prepTime,
      cook_time: recipeData.cookTime,
      difficulty: recipeData.difficulty,
      user_id: recipeData.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insérer la recette
    const { data: recette, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipePayload)
      .select()
      .single();

    if (recipeError) {
      throw new Error(`Erreur lors de la création de la recette: ${recipeError.message}`);
    }

    // Insérer les ingrédients
    if (ingredients && ingredients.length > 0) {
      const ingredientsPayload = ingredients.map((ingredient) => ({
        id: ingredient.id || generateUUID(),
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        recipe_id: recette.id,
      }));

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsPayload);

      if (ingredientsError) {
        throw new Error(`Erreur lors de l'ajout des ingrédients: ${ingredientsError.message}`);
      }
    }

    // Insérer les étapes
    if (steps && steps.length > 0) {
      const stepsPayload = steps.map((step) => ({
        id: step.id || generateUUID(),
        order: step.order,
        content: step.content,
        recipe_id: recette.id,
      }));

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepsPayload);

      if (stepsError) {
        throw new Error(`Erreur lors de l'ajout des étapes: ${stepsError.message}`);
      }
    }

    // Traiter les catégories
    if (categories && categories.length > 0) {
      // Pour chaque catégorie, vérifier si elle existe, sinon la créer
      for (const categoryName of categories) {
        // Vérifier si la catégorie existe
        let { data: existingCategory, error: categoryLookupError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (categoryLookupError && categoryLookupError.code !== 'PGRST116') {
          throw new Error(`Erreur lors de la recherche de la catégorie: ${categoryLookupError.message}`);
        }

        let categoryId;

        // Si la catégorie n'existe pas, la créer
        if (!existingCategory) {
          const { data: newCategory, error: categoryCreateError } = await supabase
            .from('categories')
            .insert({ name: categoryName })
            .select()
            .single();

          if (categoryCreateError) {
            throw new Error(`Erreur lors de la création de la catégorie: ${categoryCreateError.message}`);
          }

          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }

        // Associer la catégorie à la recette
        const { error: relationError } = await supabase
          .from('recipe_categories')
          .insert({
            recipe_id: recette.id,
            category_id: categoryId,
          });

        if (relationError) {
          throw new Error(`Erreur lors de l'association de la catégorie: ${relationError.message}`);
        }
      }
    }

    // Récupérer la recette complète avec toutes ses relations
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        steps (*),
        categories:recipe_categories (
          category:categories(*)
        ),
        profiles:user_id (
          id, name, email, image
        )
      `)
      .eq('id', recette.id)
      .single();

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération de la recette complète: ${fetchError.message}`);
    }

    return NextResponse.json(completeRecipe, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la recette', details: error },
      { status: 500 }
    );
  }
}