/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareRecipeCompletion } from '../ShareRecipeCompletion';
import { vi } from 'vitest';

describe('ShareRecipeCompletion', () => {
  const mockOnClose = vi.fn();
  const mockOnShare = vi.fn();
  const defaultProps = {
    recipeTitle: 'Gâteau au chocolat',
    onClose: mockOnClose,
    onShare: mockOnShare,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre de la recette', () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    expect(screen.getByText(/Gâteau au chocolat/)).toBeInTheDocument();
  });

  it('permet d\'ajouter un commentaire', async () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Partagez vos impressions/);
    await userEvent.type(textarea, 'Mon commentaire');
    expect(textarea).toHaveValue('Mon commentaire');
  });

  it('désactive le bouton de partage sans image', () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const shareButton = screen.getByText('Partager');
    expect(shareButton).toBeDisabled();
  });

  it('appelle onClose lors du clic sur Annuler', () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose lors du clic sur le bouton de fermeture', () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /X/ });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('gère le téléchargement d\'une image', async () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const input = screen.getByLabelText(/Cliquez ou déposez/);
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    await userEvent.upload(input, file);
    
    expect(input.files?.[0]).toBe(file);
    expect(screen.getByRole('button', { name: 'Partager' })).not.toBeDisabled();
  });

  it('affiche une erreur pour les images trop volumineuses', async () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const input = screen.getByLabelText(/Cliquez ou déposez/);
    const file = new File(['test'.repeat(1024 * 1024 * 6)], 'test.png', { type: 'image/png' });
    
    await userEvent.upload(input, file);
    
    expect(await screen.findByText(/Image trop volumineuse/)).toBeInTheDocument();
  });

  it('permet de supprimer l\'image téléchargée', async () => {
    render(<ShareRecipeCompletion {...defaultProps} />);
    const input = screen.getByLabelText(/Cliquez ou déposez/);
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    await userEvent.upload(input, file);
    const removeButton = await screen.findByRole('button', { name: /X/ });
    fireEvent.click(removeButton);
    
    expect(screen.getByRole('button', { name: 'Partager' })).toBeDisabled();
  });

  it('gère le processus de partage', async () => {
    mockOnShare.mockResolvedValueOnce(undefined);
    render(<ShareRecipeCompletion {...defaultProps} />);
    
    // Télécharger une image
    const input = screen.getByLabelText(/Cliquez ou déposez/);
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await userEvent.upload(input, file);
    
    // Ajouter un commentaire
    const textarea = screen.getByPlaceholderText(/Partagez vos impressions/);
    await userEvent.type(textarea, 'Mon commentaire');
    
    // Partager
    const shareButton = screen.getByText('Partager');
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalledWith({
        image: file,
        comment: 'Mon commentaire',
      });
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('gère les erreurs de partage', async () => {
    mockOnShare.mockRejectedValueOnce(new Error('Erreur de partage'));
    render(<ShareRecipeCompletion {...defaultProps} />);
    
    // Télécharger une image
    const input = screen.getByLabelText(/Cliquez ou déposez/);
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await userEvent.upload(input, file);
    
    // Partager
    const shareButton = screen.getByText('Partager');
    fireEvent.click(shareButton);
    
    expect(await screen.findByText(/Erreur lors du partage/)).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 