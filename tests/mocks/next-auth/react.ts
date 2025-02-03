import { vi } from 'vitest';

const session = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const useSession = vi.fn().mockReturnValue({
  data: session,
  status: 'authenticated',
  update: vi.fn(),
});

export const signIn = vi.fn().mockResolvedValue({ ok: true, error: null });
export const signOut = vi.fn().mockResolvedValue({ ok: true });
export const getSession = vi.fn().mockResolvedValue(session);

export const getServerSession = vi.fn().mockResolvedValue(session);

export default {
  useSession,
  signIn,
  signOut,
  getSession,
  getServerSession,
};
