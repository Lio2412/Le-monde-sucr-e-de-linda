import React, { useState, useEffect, useRef } from 'react';
import { recettesService } from '@/services/recettes.service';

export interface SearchFilter {
  category?: string;
  prepTimeMax?: number;
  difficulty?: 'facile' | 'moyen' | 'difficile';
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'recipe' | 'category' | 'recent';
}

export interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  categories?: string[];
  className?: string;
  placeholder?: string;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  recentSearches = [],
  categories = [],
  className = '',
  placeholder = 'Rechercher une recette...',
  loading = false,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [suggestionsInternal, setSuggestionsInternal] = useState<SearchSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim() !== '') {
      recettesService.getAll({ search: query })
        .then((data) => {
          const suggestions: SearchSuggestion[] = data.recettes.map((item: { id: string; titre: string }) => ({ 
            id: item.id, 
            title: item.titre,
            type: 'recipe' 
          }));
          setSuggestionsInternal(suggestions);
          setError(null);
          setSelectedSuggestionIndex(-1);
        })
        .catch(() => {
          setError("Erreur lors de la recherche");
          setSuggestionsInternal([]);
        });
    } else {
      setSuggestionsInternal([]);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleFilterChange = (filterName: keyof SearchFilter, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev < suggestionsInternal.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selected = suggestionsInternal[selectedSuggestionIndex];
          handleSuggestionSelect(selected);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };

  const handleSuggestionClick = (search: string) => {
    setQuery(search);
    setShowSuggestions(false);
  };

  const handleInputClick = () => {
    setShowSuggestions(true);
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    if (error) {
      return (
        <div data-testid="error-message" className="error-message">
          {error}
        </div>
      );
    }

    if (query.trim() === "") {
      return (
        <div data-testid="suggestions-container" className="suggestions-container" role="listbox">
          <div className="recent-searches">
            <h3>Recherches récentes</h3>
            {recentSearches && recentSearches.length > 0 && recentSearches.map((search, index) => (
              <div
                key={`recent-${index}`}
                role="option"
                data-testid="recent-search-item"
                className="suggestion-item"
                onClick={() => handleSuggestionClick(search)}
                aria-selected="false"
              >
                {search}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div data-testid="suggestions-container" className="suggestions-container" role="listbox">
        {suggestionsInternal.map((suggestion, index) => (
          <div
            key={suggestion.id}
            role="option"
            aria-selected={index === selectedSuggestionIndex ? "true" : "false"}
            className="suggestion-item"
            onClick={() => handleSuggestionSelect(suggestion)}
          >
            {suggestion.title}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`search-bar-container ${className}`}
      ref={searchBarRef}
      data-testid="search-bar"
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
            data-testid="search-input"
            aria-label="Rechercher"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-owns="search-suggestions"
            role="searchbox"
          />
          {loading && (
            <span className="loading-indicator" data-testid="loading-indicator">
              🔄
            </span>
          )}
        </div>

        <div className="search-filters" data-testid="search-filters">
          <select
            onChange={(e) => handleFilterChange('category', e.target.value)}
            value={filters.category || ''}
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => handleFilterChange('prepTimeMax', Number(e.target.value) || undefined)}
            value={filters.prepTimeMax || ''}
            aria-label="Filtrer par temps de préparation"
          >
            <option value="">Temps de préparation</option>
            <option value="30">30 min ou moins</option>
            <option value="60">1h ou moins</option>
            <option value="120">2h ou moins</option>
          </select>

          <select
            onChange={(e) => handleFilterChange('difficulty', e.target.value as any)}
            value={filters.difficulty || ''}
            aria-label="Filtrer par difficulté"
          >
            <option value="">Toutes les difficultés</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="search-button"
          data-testid="search-button"
        >
          🔍 Rechercher
        </button>
      </form>

      {renderSuggestions()}
    </div>
  );
};

export default SearchBar;
