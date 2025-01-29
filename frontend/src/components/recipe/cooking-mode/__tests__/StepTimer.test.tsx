import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { StepTimer } from '../StepTimer';

// Mock des fonctions de temps
jest.useFakeTimers();

describe('StepTimer', () => {
  const mockOnComplete = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    document.title = 'Test';
  });

  afterEach(() => {
    document.title = 'Test';
  });

  it('affiche correctement le temps initial', () => {
    render(
      <StepTimer
        duration={5}
        onComplete={mockOnComplete}
        isRunning={false}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('démarre et s\'arrête correctement', () => {
    render(
      <StepTimer
        duration={5}
        onComplete={mockOnComplete}
        isRunning={false}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    const startButton = screen.getByTestId('timer-start-button');
    fireEvent.click(startButton);
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('met à jour correctement le temps restant', () => {
    const { rerender } = render(
      <StepTimer
        duration={1}
        onComplete={mockOnComplete}
        isRunning={true}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    // Avancer de 30 secondes
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    rerender(
      <StepTimer
        duration={1}
        onComplete={mockOnComplete}
        isRunning={true}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('appelle onComplete quand le temps est écoulé', () => {
    render(
      <StepTimer
        duration={1}
        onComplete={mockOnComplete}
        isRunning={true}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    // Avancer jusqu'à la fin
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('réinitialise correctement le timer', () => {
    render(
      <StepTimer
        duration={5}
        onComplete={mockOnComplete}
        isRunning={false}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByTestId('timer-reset-button');
    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('affiche correctement les contrôles au survol', async () => {
    render(
      <StepTimer
        duration={5}
        onComplete={mockOnComplete}
        isRunning={false}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    const timerContainer = screen.getByTestId('timer-container');
    fireEvent.mouseEnter(timerContainer);

    expect(screen.getByTestId('timer-start-button')).toBeInTheDocument();
    expect(screen.getByTestId('timer-reset-button')).toBeInTheDocument();

    fireEvent.mouseLeave(timerContainer);
  });

  it('gère correctement les durées non entières', () => {
    render(
      <StepTimer
        duration={1.5}
        onComplete={mockOnComplete}
        isRunning={false}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  it('met à jour le titre de la page pendant le décompte', () => {
    render(
      <StepTimer
        duration={1}
        onComplete={mockOnComplete}
        isRunning={true}
        onToggle={mockOnToggle}
        onReset={mockOnReset}
      />
    );

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(document.title).toBe('0:30 - Test');
  });
}); 