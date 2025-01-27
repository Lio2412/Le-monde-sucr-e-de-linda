import { renderHook, act } from '@testing-library/react';
import { useStepCompletion } from '../useStepCompletion';

describe('useStepCompletion', () => {
  it('devrait initialiser avec aucune étape complétée', () => {
    const { result } = renderHook(() => useStepCompletion({ totalSteps: 5 }));
    
    expect(result.current.completedSteps.size).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('devrait marquer une étape comme complétée', () => {
    const { result } = renderHook(() => useStepCompletion({ totalSteps: 5 }));
    
    act(() => {
      result.current.toggleStep(0);
    });

    expect(result.current.isStepCompleted(0)).toBe(true);
    expect(result.current.progress).toBe(20); // 1/5 * 100
  });

  it('devrait démarquer une étape complétée', () => {
    const { result } = renderHook(() => useStepCompletion({ totalSteps: 5 }));
    
    act(() => {
      result.current.toggleStep(0);
      result.current.toggleStep(0);
    });

    expect(result.current.isStepCompleted(0)).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('devrait calculer correctement la progression', () => {
    const { result } = renderHook(() => useStepCompletion({ totalSteps: 4 }));
    
    act(() => {
      result.current.toggleStep(0);
      result.current.toggleStep(2);
    });

    expect(result.current.completedSteps.size).toBe(2);
    expect(result.current.progress).toBe(50); // 2/4 * 100
  });
}); 