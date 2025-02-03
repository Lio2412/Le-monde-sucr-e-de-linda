import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentList from '@/components/commentaires/CommentList';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

describe('CommentList Component', () => {
  const mockComments = [
    {
      id: '1',
      content: 'Super recette !',
      author: {
        id: '1',
        name: 'John Doe',
        image: '/images/avatar1.jpg'
      },
      createdAt: new Date('2025-02-01').toISOString()
    },
    {
      id: '2',
      content: 'Délicieux !',
      author: {
        id: '2',
        name: 'Jane Smith',
        image: '/images/avatar2.jpg'
      },
      createdAt: new Date('2025-02-02').toISOString()
    }
  ];

  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    mockUseSession.mockClear();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', name: 'John Doe' }
      },
      status: 'authenticated'
    });
  });

  it('renders list of comments correctly', () => {
    render(<CommentList comments={mockComments} recipeId="123" />);
    
    expect(screen.getByText('Super recette !')).toBeInTheDocument();
    expect(screen.getByText('Délicieux !')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays comment form when user is authenticated', () => {
    render(<CommentList comments={mockComments} recipeId="123" />);
    
    expect(screen.getByPlaceholder(/votre commentaire/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publier/i })).toBeInTheDocument();
  });

  it('hides comment form when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(<CommentList comments={mockComments} recipeId="123" />);
    
    expect(screen.queryByPlaceholder(/votre commentaire/i)).not.toBeInTheDocument();
    expect(screen.getByText(/connectez-vous pour commenter/i)).toBeInTheDocument();
  });

  it('allows user to add a new comment', async () => {
    const onCommentAdd = jest.fn();
    render(
      <CommentList
        comments={mockComments}
        recipeId="123"
        onCommentAdd={onCommentAdd}
      />
    );
    
    const input = screen.getByPlaceholder(/votre commentaire/i);
    const submitButton = screen.getByRole('button', { name: /publier/i });

    await userEvent.type(input, 'Nouveau commentaire');
    fireEvent.click(submitButton);

    expect(onCommentAdd).toHaveBeenCalledWith({
      content: 'Nouveau commentaire',
      recipeId: '123'
    });
  });

  it('shows error message when comment submission fails', async () => {
    const onCommentAdd = jest.fn().mockRejectedValue(new Error('Failed to add comment'));
    render(
      <CommentList
        comments={mockComments}
        recipeId="123"
        onCommentAdd={onCommentAdd}
      />
    );
    
    const input = screen.getByPlaceholder(/votre commentaire/i);
    const submitButton = screen.getByRole('button', { name: /publier/i });

    await userEvent.type(input, 'Nouveau commentaire');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erreur lors de l'ajout du commentaire/i)).toBeInTheDocument();
    });
  });

  it('allows user to delete their own comment', async () => {
    const onCommentDelete = jest.fn();
    render(
      <CommentList
        comments={mockComments}
        recipeId="123"
        onCommentDelete={onCommentDelete}
      />
    );
    
    const deleteButton = screen.getAllByRole('button', { name: /supprimer/i })[0];
    fireEvent.click(deleteButton);

    expect(onCommentDelete).toHaveBeenCalledWith('1');
  });

  it('shows confirmation dialog before deleting comment', async () => {
    render(
      <CommentList
        comments={mockComments}
        recipeId="123"
      />
    );
    
    const deleteButton = screen.getAllByRole('button', { name: /supprimer/i })[0];
    fireEvent.click(deleteButton);

    expect(screen.getByText(/confirmer la suppression/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });
});
