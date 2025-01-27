import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from '../useFullscreen';
import '@testing-library/jest-dom';

declare global {
  var mockFullscreenElement: (value: HTMLElement | null) => void;
  var mockWakeLock: {
    request: jest.Mock;
    reset: jest.Mock;
  };
}

describe('useFullscreen', () => {
  const mockRef = { 
    current: Object.assign(document.createElement('div'), {
      requestFullscreen: jest.fn().mockResolvedValue(undefined),
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFullscreenElement(null);
    console.warn = jest.fn();
  });

  it('devrait initialiser correctement', () => {
    const { result } = renderHook(() => useFullscreen(mockRef));
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isEnabled).toBe(true);
  });

  it('devrait entrer en mode plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    await act(async () => {
      await result.current.enterFullscreen();
      mockFullscreenElement(mockRef.current);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(mockRef.current.requestFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(true);
  });

  it('devrait sortir du mode plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    // Simuler l'entrée en plein écran
    await act(async () => {
      mockFullscreenElement(mockRef.current);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);

    // Sortir du plein écran
    await act(async () => {
      await result.current.exitFullscreen();
      mockFullscreenElement(null);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(false);
  });

  it('devrait gérer les erreurs de plein écran', async () => {
    const mockError = new Error('Fullscreen error');
    mockRef.current.requestFullscreen = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFullscreen(mockRef));

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(result.current.error).toBe(mockError);
  });

  it('devrait basculer entre les modes plein écran', async () => {
    const { result } = renderHook(() => useFullscreen(mockRef));

    // Entrer en plein écran
    await act(async () => {
      await result.current.toggleFullscreen();
      mockFullscreenElement(mockRef.current);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);

    // Sortir du plein écran
    await act(async () => {
      await result.current.toggleFullscreen();
      mockFullscreenElement(null);
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  describe('Wake Lock API', () => {
    const mockRelease = jest.fn().mockResolvedValue(undefined);
    const mockRequest = jest.fn().mockResolvedValue({ release: mockRelease });

    beforeEach(() => {
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: { request: mockRequest },
      });
      mockRequest.mockClear();
      mockRelease.mockClear();
    });

    it('devrait demander le Wake Lock en entrant en plein écran', async () => {
      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement(mockRef.current);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(mockRequest).toHaveBeenCalledWith('screen');
    });

    it('devrait libérer le Wake Lock en sortant du plein écran', async () => {
      const { result } = renderHook(() => useFullscreen(mockRef));

      // Entrer en plein écran
      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement(mockRef.current);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      // Sortir du plein écran
      await act(async () => {
        await result.current.exitFullscreen();
        mockFullscreenElement(null);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(mockRelease).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du Wake Lock', async () => {
      const mockError = new Error('Wake Lock error');
      mockRequest.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement(mockRef.current);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(console.warn).toHaveBeenCalledWith('Wake Lock request failed:', mockError);
    });

    it('devrait gérer l\'absence de l\'API Wake Lock', async () => {
      const originalWakeLock = navigator.wakeLock;
      delete (navigator as any).wakeLock;

      const { result } = renderHook(() => useFullscreen(mockRef));

      await act(async () => {
        await result.current.enterFullscreen();
        mockFullscreenElement(mockRef.current);
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      // Restaurer l'API Wake Lock
      (navigator as any).wakeLock = originalWakeLock;

      expect(result.current.isFullscreen).toBe(true);
    });
  });
}); 