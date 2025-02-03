import { vi } from 'vitest';

export const useSession = () => ({
  data: {
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
  },
  status: 'authenticated' as const,
});

export const signIn = vi.fn();
export const signOut = vi.fn();
export const getSession = vi.fn();
