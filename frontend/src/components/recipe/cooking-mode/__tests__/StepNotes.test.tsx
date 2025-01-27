import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepNotes } from '../StepNotes';

describe('StepNotes', () => {
  const mockProps = {
    stepIndex: 0,
    note: '',
    onUpdateNote: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le titre avec le numéro de l\'étape', () => {
    render(<StepNotes {...mockProps} />);
    expect(screen.getByText('Notes pour l\'étape 1')).toBeInTheDocument();
  });

  it('devrait afficher la note existante', () => {
    render(<StepNotes {...mockProps} note="Ma note existante" />);
    expect(screen.getByRole('textbox')).toHaveValue('Ma note existante');
  });

  it('devrait appeler onUpdateNote quand le contenu change', async () => {
    const user = userEvent.setup({ delay: null });
    render(<StepNotes {...mockProps} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'N');
    
    expect(mockProps.onUpdateNote).toHaveBeenLastCalledWith(0, 'N');
  });

  it('devrait appeler onClose quand le bouton fermer est cliqué', async () => {
    const user = userEvent.setup({ delay: null });
    render(<StepNotes {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: /fermer les notes/i });
    await user.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });
}); 