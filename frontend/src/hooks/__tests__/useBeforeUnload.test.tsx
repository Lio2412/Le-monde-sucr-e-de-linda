import { renderHook } from '@testing-library/react';
import { useBeforeUnload } from '../useBeforeUnload';

// Mock du routeur Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

describe('useBeforeUnload Hook', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock des méthodes window
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Nettoyage des mocks
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('devrait ajouter un écouteur d\'événement quand shouldPreventUnload est true', () => {
    renderHook(() => useBeforeUnload({
      shouldPreventUnload: true,
      onConfirm: jest.fn(),
      onCancel: jest.fn()
    }));
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('ne devrait pas ajouter d\'écouteur d\'événement quand shouldPreventUnload est false', () => {
    renderHook(() => useBeforeUnload({
      shouldPreventUnload: false,
      onConfirm: jest.fn(),
      onCancel: jest.fn()
    }));
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('devrait supprimer l\'écouteur d\'événement lors du démontage', () => {
    const { unmount } = renderHook(() => useBeforeUnload({
      shouldPreventUnload: true,
      onConfirm: jest.fn(),
      onCancel: jest.fn()
    }));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('devrait utiliser le message personnalisé', () => {
    const customMessage = 'Message de test personnalisé';
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    
    renderHook(() => useBeforeUnload({ 
      shouldPreventUnload: true, 
      message: customMessage,
      onConfirm,
      onCancel
    }));

    // Récupérer le gestionnaire d'événement
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Créer un faux événement avec une propriété returnValue mutable
    const event = {
      preventDefault: jest.fn(),
      returnValue: ''
    };
    
    // Appeler le gestionnaire avec notre faux événement
    handler(event);

    expect(event.returnValue).toBe(customMessage);
  });
}); 