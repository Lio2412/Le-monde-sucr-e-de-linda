/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepDisplay } from '../StepDisplay';

describe('StepDisplay', () => {
  const defaultProps = {
    description: 'Test description',
    currentIndex: 0,
    totalSteps: 5,
    isCompleted: false,
    onToggleComplete: jest.fn(),
    direction: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche la description de l\'étape', () => {
    render(<StepDisplay {...defaultProps} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('affiche la progression correcte', () => {
    render(<StepDisplay {...defaultProps} />);
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('affiche le bon nombre d\'indicateurs d\'étapes', () => {
    render(<StepDisplay {...defaultProps} />);
    const indicators = screen.getAllByRole('generic').filter(
      element => element.className.includes('rounded-full border-2')
    );
    expect(indicators).toHaveLength(5);
  });

  it('affiche la durée si elle est fournie', () => {
    render(<StepDisplay {...defaultProps} duration={30} />);
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('affiche la température si elle est fournie', () => {
    render(<StepDisplay {...defaultProps} temperature={180} />);
    expect(screen.getByText('180°C')).toBeInTheDocument();
  });

  it('appelle onToggleComplete lors du clic sur la case à cocher', () => {
    render(<StepDisplay {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(defaultProps.onToggleComplete).toHaveBeenCalledTimes(1);
  });

  it('affiche le statut complété correctement', () => {
    render(<StepDisplay {...defaultProps} isCompleted={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('affiche la position actuelle dans la recette', () => {
    render(<StepDisplay {...defaultProps} />);
    expect(screen.getByText('Étape 1 sur 5')).toBeInTheDocument();
  });

  it('met en surbrillance l\'indicateur d\'étape actuel', () => {
    const { container } = render(<StepDisplay {...defaultProps} currentIndex={2} />);
    const indicators = container.querySelectorAll('[class*="rounded-full border-2"]');
    expect(indicators[2].className).toContain('bg-primary/50');
  });

  it('marque les étapes précédentes comme complétées', () => {
    const { container } = render(<StepDisplay {...defaultProps} currentIndex={2} />);
    const indicators = container.querySelectorAll('[class*="rounded-full border-2"]');
    expect(indicators[0].className).toContain('bg-primary');
    expect(indicators[1].className).toContain('bg-primary');
  });
}); 
