import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from '../useFullscreen';
import '@testing-library/jest-dom';

declare global {
  var mockFullscreenElement: {
    get: () => HTMLElement | null;
    set: (value: HTMLElement | null) => void;
  };
  var mockWakeLock: {
    getSentinel: () => { release: jest.Mock } | null;
    reset: () => void;
    mock: {
      request: jest.Mock;
    };
  };
}

describe('useFullscreen', () => {
  const mockElement = {
    requestFullscreen: jest.fn().mockResolvedValue(undefined),
    webkitRequestFullscreen: jest.fn(),
  } as unknown as HTMLElement;

  const mockRef = {
    current: mockElement,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFullscreenElement.set(null);
    mockWakeLock.reset();
  });

  it('devrait initialiser correctement', () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('devrait entrer en mode plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    await act(async () => {
      await result.current.enterFullscreen();
      mockFullscreenElement.set(mockElement);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(true);
  });

  it('devrait sortir du mode plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    // Simuler l'état initial en plein écran
    await act(async () => {
      mockFullscreenElement.set(mockElement);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    await act(async () => {
      await result.current.exitFullscreen();
      mockFullscreenElement.set(null);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(false);
  });

  it('devrait gérer les erreurs de plein écran', async () => {
    const mockError = new Error('Fullscreen error');
    mockElement.requestFullscreen = jest.fn().mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFullscreen(mockRef));

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Fullscreen error');
  });

  it('devrait basculer entre les modes plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    // Premier appel : entrer en plein écran
    await act(async () => {
      await result.current.toggleFullscreen();
      mockFullscreenElement.set(mockElement);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(true);

    // Deuxième appel : sortir du plein écran
    await act(async () => {
      await result.current.toggleFullscreen();
      mockFullscreenElement.set(null);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(false);
  });

  describe('Wake Lock API', () => {
    it('devrait demander le Wake Lock en entrant en plein écran', async () => {
      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement.set(mockElement);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(mockWakeLock.mock.request).toHaveBeenCalledWith('screen');
    });

    it('devrait libérer le Wake Lock en sortant du plein écran', async () => {
      const { result } = renderHook(() => useFullscreen(mockRef));

      // Entrer en plein écran
      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement.set(mockElement);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      const sentinel = mockWakeLock.getSentinel();
      expect(sentinel).not.toBeNull();

      // Sortir du plein écran
      await act(async () => {
        await result.current.exitFullscreen();
        mockFullscreenElement.set(null);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(sentinel?.release).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du Wake Lock', async () => {
      mockWakeLock.mock.request.mockRejectedValueOnce(new Error('Wake Lock error'));

      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement.set(mockElement);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      // Le test devrait continuer même si le Wake Lock échoue
      expect(result.current.isFullscreen).toBe(true);
    });

    it('devrait gérer l\'absence de l\'API Wake Lock', async () => {
      // Simuler l'absence de l'API Wake Lock
      Object.defineProperty(navigator, 'wakeLock', {
        value: undefined,
        configurable: true,
      });

      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement.set(mockElement);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      // Le mode plein écran devrait fonctionner même sans Wake Lock
      expect(result.current.isFullscreen).toBe(true);
    });
  });
}); 