import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../components/RecipeCard';

const TestPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  
  const mockRecipe: Recipe = {
    id: '1',
    title: 'Gâteau au Chocolat',
    description: 'Un délicieux gâteau au chocolat facile à réaliser',
    imageUrl: '/images/gateau-chocolat.jpg',
    prepTime: 45,
    difficulty: 'facile',
    likes: 42,
    isLiked: isLiked,
  };

  // Charger les recherches récentes depuis le localStorage au démarrage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Ajouter la recherche à l'historique
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleLike = (recipeId: string) => {
    console.log('Liked recipe:', recipeId);
    setIsLiked(true);
  };

  const handleShare = (recipeId: string) => {
    console.log('Shared recipe:', recipeId);
  };

  return (
    <div className="test-page">
      <h1>Page de Test des Composants</h1>
      
      <div className="search-section">
        <h2>Test de SearchBar</h2>
        <SearchBar
          onSearch={handleSearch}
          suggestions={[
            { id: '1', title: 'Gâteau au chocolat', type: 'recipe' },
            { id: '2', title: 'Tarte aux pommes', type: 'recipe' },
          ]}
          categories={['Desserts', 'Entrées', 'Plats principaux']}
          recentSearches={recentSearches}
        />
      </div>

      <div className="recipe-section">
        <h2>Test de RecipeCard</h2>
        <RecipeCard
          recipe={mockRecipe}
          onLike={handleLike}
          onShare={handleShare}
        />
      </div>

      <style jsx>{`
        .test-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-section,
        .recipe-section {
          margin: 2rem 0;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 8px;
        }

        h1, h2 {
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default TestPage;
