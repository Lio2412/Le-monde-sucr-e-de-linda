import { renderHook } from '@testing-library/react';
import { useDeviceType } from '../useDeviceType';

describe('useDeviceType', () => {
  const originalUserAgent = window.navigator.userAgent;

  const mockUserAgent = (userAgent: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      configurable: true
    });
  };

  afterEach(() => {
    mockUserAgent(originalUserAgent);
  });

  it('devrait détecter un appareil de bureau', () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const { result } = renderHook(() => useDeviceType());
    
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.isTouchDevice).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('devrait détecter une tablette', () => {
    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1');
    
    const { result } = renderHook(() => useDeviceType());
    
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.isTablet).toBe(true);
  });

  it('devrait détecter un téléphone mobile', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1');
    
    const { result } = renderHook(() => useDeviceType());
    
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('devrait gérer les événements de redimensionnement', () => {
    const { result } = renderHook(() => useDeviceType());
    
    // Simuler un événement de redimensionnement
    window.dispatchEvent(new Event('resize'));
    
    expect(result.current.deviceType).toBeDefined();
  });

  it('devrait nettoyer l\'écouteur d\'événements lors du démontage', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useDeviceType());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
}); 