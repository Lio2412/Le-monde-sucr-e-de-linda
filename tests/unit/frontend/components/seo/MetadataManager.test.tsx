import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MetadataManager, { MetadataForm, MetadataPreview } from '@/components/seo/MetadataManager';
import { TestWrapper } from '../../../../setup/vitest/TestWrapper';

// Mock des dépendances
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('MetadataManager', () => {
  const initialMetadata = {
    title: 'Test Title',
    description: 'Test Description',
    keywords: 'test, keywords'
  };

  const renderComponent = () => {
    return render(
      <TestWrapper>
        <MetadataManager 
          initialMetadata={initialMetadata}
          onSave={() => {}}
        />
      </TestWrapper>
    );
  };

  it('devrait rendre le composant correctement', () => {
    renderComponent();
    expect(screen.getByText('Édition')).toBeInTheDocument();
    expect(screen.getByText('Aperçu')).toBeInTheDocument();
  });

  it('devrait basculer entre les onglets édition et aperçu', async () => {
    renderComponent();
    const previewTab = screen.getByText('Aperçu');
    fireEvent.click(previewTab);
    expect(screen.getByText(initialMetadata.title)).toBeInTheDocument();
  });
});

describe('MetadataForm', () => {
  const onSave = vi.fn();
  const initialMetadata = {
    title: 'Test Title',
    description: 'Test Description',
    keywords: 'test, keywords'
  };

  beforeEach(() => {
    onSave.mockClear();
  });

  it('devrait rendre le formulaire avec les valeurs initiales', () => {
    render(
      <TestWrapper>
        <MetadataManager 
          initialMetadata={initialMetadata}
          onSave={onSave}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue(initialMetadata.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialMetadata.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialMetadata.keywords)).toBeInTheDocument();
  });

  it('devrait appeler onSave avec les valeurs mises à jour lors de la soumission', async () => {
    render(
      <TestWrapper>
        <MetadataManager 
          initialMetadata={initialMetadata}
          onSave={onSave}
        />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText('Titre');
    const descriptionInput = screen.getByLabelText('Description');
    const keywordsInput = screen.getByLabelText('Mots-clés');
    const submitButton = screen.getByText('Enregistrer');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.change(keywordsInput, { target: { value: 'new, keywords' } });
    fireEvent.click(submitButton);

    expect(onSave).toHaveBeenCalledWith({
      title: 'New Title',
      description: 'New Description',
      keywords: 'new, keywords'
    });
  });

  it('devrait afficher le compteur de caractères', () => {
    render(
      <TestWrapper>
        <MetadataManager 
          initialMetadata={initialMetadata}
          onSave={onSave}
        />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'A new description' } });
    expect(screen.getByText('16/160')).toBeInTheDocument();
  });
});

describe('MetadataPreview', () => {
  it('devrait afficher les métadonnées correctement', () => {
    const metadata = {
      title: 'Preview Title',
      description: 'Preview Description',
      keywords: 'preview, keywords'
    };

    render(
      <TestWrapper>
        <MetadataManager 
          initialMetadata={metadata}
          onSave={() => {}}
        />
      </TestWrapper>
    );

    const previewTab = screen.getByText('Aperçu');
    fireEvent.click(previewTab);

    expect(screen.getByText(metadata.title)).toBeInTheDocument();
    expect(screen.getByText(metadata.description)).toBeInTheDocument();
    expect(screen.getByText(metadata.keywords)).toBeInTheDocument();
  });
});