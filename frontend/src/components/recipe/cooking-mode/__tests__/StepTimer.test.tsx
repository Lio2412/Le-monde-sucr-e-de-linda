import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepTimer } from '../StepTimer';
import '@testing-library/jest-dom';

describe('StepTimer', () => {
  const mockOnComplete = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnReset = jest.fn();
  const originalTitle = document.title;

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnComplete.mockClear();
    mockOnToggle.mockClear();
    mockOnReset.mockClear();
    document.title = originalTitle;
  });

  afterEach(() => {
    jest.useRealTimers();
    document.title = originalTitle;
  });

  it('devrait afficher le temps initial correctement', () => {
    render(<StepTimer duration={5} onComplete={mockOnComplete} />);
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  describe('Mode contrôlé', () => {
    it('devrait utiliser l\'état externe pour le timer', () => {
      const { rerender } = render(
        <StepTimer
          duration={5}
          onComplete={mockOnComplete}
          isRunning={true}
          onToggle={mockOnToggle}
          onReset={mockOnReset}
        />
      );

      // Avancer d'une seconde
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('4:59')).toBeInTheDocument();

      // Mettre en pause via l'état externe
      rerender(
        <StepTimer
          duration={5}
          onComplete={mockOnComplete}
          isRunning={false}
          onToggle={mockOnToggle}
          onReset={mockOnReset}
        />
      );

      // Avancer encore d'une seconde
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Le temps ne devrait pas avoir changé
      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('devrait appeler onToggle quand le bouton est cliqué', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <StepTimer
          duration={5}
          onComplete={mockOnComplete}
          isRunning={false}
          onToggle={mockOnToggle}
          onReset={mockOnReset}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /démarrer/i });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('devrait appeler onReset quand le bouton est cliqué', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <StepTimer
          duration={5}
          onComplete={mockOnComplete}
          isRunning={true}
          onToggle={mockOnToggle}
          onReset={mockOnReset}
        />
      );

      // Avancer de quelques secondes
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const resetButton = screen.getByRole('button', { name: /réinitialiser/i });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mode non contrôlé', () => {
    it('devrait démarrer et mettre en pause le timer', async () => {
      const user = userEvent.setup({ delay: null });
      render(<StepTimer duration={5} onComplete={mockOnComplete} />);

      // Démarrer le timer
      const startButton = screen.getByRole('button', { name: /démarrer/i });
      await user.click(startButton);

      // Avancer d'une seconde
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('4:59')).toBeInTheDocument();

      // Mettre en pause
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await user.click(pauseButton);

      // Avancer encore d'une seconde
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Le temps ne devrait pas avoir changé
      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('devrait appeler onComplete quand le temps est écoulé', async () => {
      const user = userEvent.setup({ delay: null });
      render(<StepTimer duration={1} onComplete={mockOnComplete} />);

      // Démarrer le timer
      const startButton = screen.getByRole('button', { name: /démarrer/i });
      await user.click(startButton);

      // Avancer d'une minute
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('devrait réinitialiser le timer', async () => {
      const user = userEvent.setup({ delay: null });
      render(<StepTimer duration={5} onComplete={mockOnComplete} />);

      // Démarrer le timer
      const startButton = screen.getByRole('button', { name: /démarrer/i });
      await user.click(startButton);

      // Avancer de 2 secondes
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByText('4:58')).toBeInTheDocument();

      // Réinitialiser
      const resetButton = screen.getByRole('button', { name: /réinitialiser/i });
      await user.click(resetButton);

      expect(screen.getByText('5:00')).toBeInTheDocument();
    });
  });

  it('devrait désactiver les boutons correctement', () => {
    render(<StepTimer duration={1} onComplete={mockOnComplete} />);

    // Au départ, seul le bouton reset devrait être désactivé
    expect(screen.getByRole('button', { name: /démarrer/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeDisabled();
  });

  it('devrait mettre à jour le titre de la page', async () => {
    const user = userEvent.setup({ delay: null });
    render(<StepTimer duration={5} onComplete={mockOnComplete} />);

    // Démarrer le timer
    const startButton = screen.getByRole('button', { name: /démarrer/i });
    await user.click(startButton);

    // Avancer d'une seconde
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(document.title).toContain('4:59');

    // Mettre en pause
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    expect(document.title).toBe(originalTitle);
  });

  it('devrait formater correctement différentes durées', () => {
    // Test avec une durée de 5 minutes
    const { unmount } = render(<StepTimer duration={5} onComplete={mockOnComplete} />);
    expect(screen.getByText('5:00')).toBeInTheDocument();
    unmount();

    // Test avec une durée de 10 minutes
    render(<StepTimer duration={10} onComplete={mockOnComplete} />);
    expect(screen.getByText('10:00')).toBeInTheDocument();
    unmount();

    // Test avec une demi-minute
    render(<StepTimer duration={0.5} onComplete={mockOnComplete} />);
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('devrait gérer les durées non entières', async () => {
    const user = userEvent.setup({ delay: null });
    render(<StepTimer duration={1.5} onComplete={mockOnComplete} />);

    expect(screen.getByText('1:30')).toBeInTheDocument();

    // Démarrer le timer
    const startButton = screen.getByRole('button', { name: /démarrer/i });
    await user.click(startButton);

    // Avancer de 30 secondes
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByText('1:00')).toBeInTheDocument();
  });
}); 