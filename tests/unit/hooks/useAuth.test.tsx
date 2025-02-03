import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn()
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('useAuth Hook', () => {
  const mockSignIn = signIn as jest.Mock;
  const mockSignOut = signOut as jest.Mock;
  const mockUseSession = useSession as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    mockSignIn.mockClear();
    mockSignOut.mockClear();
    mockUseSession.mockClear();
    mockPush.mockClear();
    
    mockUseRouter.mockImplementation(() => ({
      push: mockPush,
      query: {}
    }));
    
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
  });

  it('handles login successfully', async () => {
    mockSignIn.mockResolvedValueOnce({
      ok: true,
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false
    });
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(result.current.error).toBeNull();
  });

  it('handles login failure', async () => {
    mockSignIn.mockResolvedValueOnce({
      ok: false,
      error: 'Invalid credentials'
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    });

    expect(mockSignIn).toHaveBeenCalled();
    expect(result.current.error).toBe('Identifiants invalides');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles logout successfully', async () => {
    mockSignOut.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('handles registration successfully', async () => {
    const mockRegister = jest.fn().mockResolvedValueOnce({
      ok: true,
      user: { id: '1', email: 'test@example.com' }
    });

    const { result } = renderHook(() => useAuth());
    result.current.register = mockRegister;

    await act(async () => {
      await result.current.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('handles registration failure', async () => {
    const mockRegister = jest.fn().mockRejectedValueOnce(
      new Error('Email already exists')
    );

    const { result } = renderHook(() => useAuth());
    result.current.register = mockRegister;

    await act(async () => {
      try {
        await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User'
        });
      } catch (error) {
        expect(error.message).toBe('Email already exists');
      }
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('provides correct authentication status', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' }
      },
      status: 'authenticated'
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com'
    });
  });

  it('handles redirect after login', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: true });
    mockUseRouter.mockImplementation(() => ({
      push: mockPush,
      query: { redirect: '/dashboard' }
    }));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('handles loading state during authentication', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
