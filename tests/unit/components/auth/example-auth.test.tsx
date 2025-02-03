import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../setup/vitest/TestWrapper';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import AuthComponent from './AuthComponent';

// Mock des modules
const mockRouter = {
  push: vi.fn(),
  pathname: '',
  query: {},
  asPath: '',
};

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { name: 'Test User' },
    },
    status: 'authenticated',
  }),
}));

describe('AuthComponent', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });

  it('should render welcome message when user is authenticated', () => {
    renderWithProviders(<AuthComponent />);
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome Test User');
  });

  it('should handle navigation when clicking dashboard button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthComponent />);
    const button = screen.getByTestId('dashboard-button');
    await user.click(button);
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
});
