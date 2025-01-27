import { useRouter } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCookingMode } from '../RecipeCookingMode';
import { mockRecipe } from '@/mocks/recipe';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }))
}));

jest.mock('@/hooks/useBeforeUnload');

describe('RecipeCookingMode', () => {
  const mockOnClose = jest.fn();
  const mockToggleStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... existing code ...
}); 