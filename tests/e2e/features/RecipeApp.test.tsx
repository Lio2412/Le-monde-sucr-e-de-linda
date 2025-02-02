import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecipeApp } from '../../components/RecipeApp';

expect.extend(toHaveNoViolations);

describe('Tests d\'Accessibilité RecipeApp', () => {
  beforeEach(() => {
    // Reset focus
    document.body.focus();
  });

  it('devrait passer les tests axe-core', async () => {
    const { container } = render(<RecipeApp />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Navigation au Clavier', () => {
    it('devrait permettre la navigation complète au clavier', () => {
      render(<RecipeApp />);

      // Vérifier que le focus commence au bon endroit
      expect(document.activeElement).toHaveAttribute('data-testid', 'main-content');

      // Tester la navigation avec Tab
      userEvent.tab();
      expect(document.activeElement).toHaveAttribute('data-testid', 'search-input');

      userEvent.tab();
      expect(document.activeElement).toHaveAttribute('data-testid', 'filter-button');

      userEvent.tab();
      expect(document.activeElement).toHaveAttribute('data-testid', 'recipe-card-0');
    });

    it('devrait gérer les raccourcis clavier', () => {
      render(<RecipeApp />);

      // Ouvrir le menu avec Alt+M
      fireEvent.keyDown(document.body, { key: 'm', altKey: true });
      expect(screen.getByTestId('main-menu')).toHaveAttribute('aria-expanded', 'true');

      // Fermer avec Escape
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(screen.getByTestId('main-menu')).toHaveAttribute('aria-expanded', 'false');
    });

    it('devrait avoir un ordre de tabulation logique', () => {
      render(<RecipeApp />);

      const tabbableElements = document.querySelectorAll('[tabindex="0"]');
      const tabbableArray = Array.from(tabbableElements);

      // Vérifier l'ordre des éléments
      expect(tabbableArray[0]).toHaveAttribute('data-testid', 'main-content');
      expect(tabbableArray[1]).toHaveAttribute('data-testid', 'search-input');
      expect(tabbableArray[2]).toHaveAttribute('data-testid', 'filter-button');
    });
  });

  describe('Lecteur d\'Écran', () => {
    it('devrait avoir des textes alternatifs appropriés pour les images', () => {
      render(<RecipeApp />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('devrait avoir des descriptions ARIA appropriées', () => {
      render(<RecipeApp />);

      // Vérifier les landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Vérifier les descriptions des boutons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('devrait annoncer les mises à jour dynamiques', async () => {
      render(<RecipeApp />);

      const searchInput = screen.getByTestId('search-input');
      
      // Simuler une recherche
      await userEvent.type(searchInput, 'tarte');
      
      // Vérifier la région live
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveTextContent('3 résultats trouvés');
    });
  });

  describe('Contraste et Visibilité', () => {
    it('devrait avoir un contraste suffisant', () => {
      render(<RecipeApp />);

      // Vérifier le contraste du texte principal
      const mainContent = screen.getByTestId('main-content');
      const mainStyle = window.getComputedStyle(mainContent);
      
      // Vérifier que le ratio de contraste est suffisant (4.5:1 minimum)
      expect(getContrastRatio(mainStyle.color, mainStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

    it('devrait être utilisable en mode zoom', () => {
      // Simuler un zoom de 200%
      document.body.style.zoom = '200%';
      
      render(<RecipeApp />);

      // Vérifier que tous les éléments sont toujours visibles et utilisables
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toBeVisible();
      expect(mainContent.scrollWidth).toBeLessThanOrEqual(window.innerWidth);

      // Restaurer le zoom
      document.body.style.zoom = '100%';
    });
  });

  describe('Formulaires Accessibles', () => {
    it('devrait avoir des labels appropriés', () => {
      render(<RecipeApp />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    it('devrait indiquer les erreurs de manière accessible', async () => {
      render(<RecipeApp />);

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toBeVisible();
    });

    it('devrait grouper les champs liés', () => {
      render(<RecipeApp />);

      const filterGroup = screen.getByRole('group', { name: /filtres/i });
      expect(filterGroup).toHaveAttribute('aria-labelledby');
      
      const fields = within(filterGroup).getAllByRole('checkbox');
      fields.forEach(field => {
        expect(field).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Compatibilité Mode Sombre', () => {
    it('devrait maintenir le contraste en mode sombre', () => {
      // Simuler le mode sombre
      document.documentElement.setAttribute('data-theme', 'dark');
      
      render(<RecipeApp />);

      const mainContent = screen.getByTestId('main-content');
      const mainStyle = window.getComputedStyle(mainContent);
      
      expect(getContrastRatio(mainStyle.color, mainStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);

      // Restaurer le thème
      document.documentElement.removeAttribute('data-theme');
    });
  });
});

// Fonction utilitaire pour calculer le ratio de contraste
function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
} 