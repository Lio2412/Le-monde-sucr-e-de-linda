export interface Metadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  url?: string;
  type?: string;
  locale?: string;
}

class MetadataService {
  private readonly API_URL = '/api/metadata';

  async getMetadata(path: string): Promise<Metadata> {
    const response = await fetch(`${this.API_URL}${path}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des métadonnées');
    }
    return response.json();
  }

  async updateMetadata(path: string, metadata: Metadata): Promise<Metadata> {
    const response = await fetch(`${this.API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des métadonnées');
    }

    return response.json();
  }

  async generateSitemap(): Promise<void> {
    const response = await fetch(`${this.API_URL}/sitemap/generate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du sitemap');
    }
  }

  async generateSchemaOrg(type: 'Recipe' | 'BlogPosting', data: any): Promise<string> {
    const response = await fetch(`${this.API_URL}/schema/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du schema.org');
    }

    return response.json();
  }

  generateRecipeSchema(recipeData: any): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipeData.title,
      description: recipeData.description,
      author: {
        '@type': 'Person',
        name: 'Linda',
      },
      datePublished: recipeData.publishedAt,
      image: recipeData.image,
      recipeCategory: recipeData.category,
      recipeCuisine: 'Française',
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      totalTime: recipeData.totalTime,
      recipeYield: recipeData.servings,
      recipeIngredient: recipeData.ingredients,
      recipeInstructions: recipeData.instructions.map((step: string, index: number) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    };

    return JSON.stringify(schema);
  }

  generateBlogPostSchema(postData: any): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postData.title,
      description: postData.description,
      author: {
        '@type': 'Person',
        name: 'Linda',
      },
      datePublished: postData.publishedAt,
      dateModified: postData.updatedAt,
      image: postData.image,
      publisher: {
        '@type': 'Organization',
        name: 'Le Monde Sucré de Linda',
        logo: {
          '@type': 'ImageObject',
          url: '/images/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${postData.slug}`,
      },
    };

    return JSON.stringify(schema);
  }
}

export const metadataService = new MetadataService(); 