import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepDisplay } from '../StepDisplay';

const mockStep = {
  description: 'Préchauffer le four à 180°C',
  duration: 10,
  temperature: 180
};

describe('StepDisplay', () => {
  const mockOnToggleComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche correctement le numéro et la description de l\'étape', () => {
    render(
      <StepDisplay
        description={mockStep.description}
        currentIndex={0}
        totalSteps={5}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
        duration={mockStep.duration}
        temperature={mockStep.temperature}
      />
    );

    expect(screen.getByText('Étape 1 sur 5')).toBeInTheDocument();
    expect(screen.getByText(mockStep.description)).toBeInTheDocument();
  });

  it('affiche correctement la durée et la température', () => {
    render(
      <StepDisplay
        description={mockStep.description}
        currentIndex={0}
        totalSteps={5}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
        duration={mockStep.duration}
        temperature={mockStep.temperature}
      />
    );

    expect(screen.getByTestId('step-duration')).toHaveTextContent('10 min');
    expect(screen.getByTestId('step-temperature')).toHaveTextContent('180°C');
  });

  it('permet de marquer une étape comme terminée', async () => {
    render(
      <StepDisplay
        description={mockStep.description}
        currentIndex={0}
        totalSteps={5}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
        duration={mockStep.duration}
        temperature={mockStep.temperature}
      />
    );

    const checkbox = screen.getByTestId('step-checkbox');
    await userEvent.click(checkbox);
    expect(mockOnToggleComplete).toHaveBeenCalled();
  });

  it('affiche une étape comme terminée', () => {
    render(
      <StepDisplay
        description={mockStep.description}
        currentIndex={0}
        totalSteps={5}
        isCompleted={true}
        onToggleComplete={mockOnToggleComplete}
        duration={mockStep.duration}
        temperature={mockStep.temperature}
      />
    );

    const checkbox = screen.getByTestId('step-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('gère les animations avec la direction', () => {
    render(
      <StepDisplay
        description={mockStep.description}
        currentIndex={0}
        totalSteps={5}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
        duration={mockStep.duration}
        temperature={mockStep.temperature}
        direction={1}
      />
    );

    const stepElement = screen.getByTestId('step-description');
    expect(stepElement).toBeInTheDocument();
  });

  it('affiche correctement une étape sans durée ni température', () => {
    render(
      <StepDisplay
        description="Mélanger les ingrédients"
        currentIndex={0}
        totalSteps={5}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.queryByTestId('step-duration')).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-temperature')).not.toBeInTheDocument();
  });
}); 
