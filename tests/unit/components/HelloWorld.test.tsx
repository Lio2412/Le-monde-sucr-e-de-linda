import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelloWorld from '../../../frontend/src/components/HelloWorld';

describe('HelloWorld', () => {
  it('affiche le message par défaut', () => {
    render(<HelloWorld />);
    const message = screen.getByText('Bonjour le monde!');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-2xl', 'font-bold', 'text-gray-800');
  });

  it('affiche un message personnalisé', () => {
    const customMessage = 'Bienvenue sur Le Monde Sucré de Linda!';
    render(<HelloWorld message={customMessage} />);
    const message = screen.getByText(customMessage);
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-2xl', 'font-bold', 'text-gray-800');
  });
}); 