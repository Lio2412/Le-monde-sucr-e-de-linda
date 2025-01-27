import { renderHook, act } from '@testing-library/react';
import { useStepNotes } from '../useStepNotes';

describe('useStepNotes', () => {
  it('devrait initialiser avec aucune note', () => {
    const { result } = renderHook(() => useStepNotes({ totalSteps: 5 }));
    
    expect(result.current.notes.size).toBe(0);
    expect(result.current.showNotes).toBe(false);
    expect(result.current.hasNotes).toBe(false);
  });

  it('devrait ajouter une note pour une étape', () => {
    const { result } = renderHook(() => useStepNotes({ totalSteps: 5 }));
    
    act(() => {
      result.current.updateNote(0, 'Ma note pour l\'étape 1');
    });

    expect(result.current.hasNotes).toBe(true);
    expect(result.current.hasNoteForStep(0)).toBe(true);
    expect(result.current.getNote(0)).toBe('Ma note pour l\'étape 1');
  });

  it('devrait supprimer une note vide', () => {
    const { result } = renderHook(() => useStepNotes({ totalSteps: 5 }));
    
    act(() => {
      result.current.updateNote(0, 'Ma note');
      result.current.updateNote(0, '   ');
    });

    expect(result.current.hasNotes).toBe(false);
    expect(result.current.hasNoteForStep(0)).toBe(false);
    expect(result.current.getNote(0)).toBe('');
  });

  it('devrait gérer plusieurs notes', () => {
    const { result } = renderHook(() => useStepNotes({ totalSteps: 5 }));
    
    act(() => {
      result.current.updateNote(0, 'Note 1');
      result.current.updateNote(2, 'Note 2');
    });

    expect(result.current.notes.size).toBe(2);
    expect(result.current.getNote(0)).toBe('Note 1');
    expect(result.current.getNote(2)).toBe('Note 2');
    expect(result.current.getNote(1)).toBe('');
  });

  it('devrait basculer la visibilité des notes', () => {
    const { result } = renderHook(() => useStepNotes({ totalSteps: 5 }));
    
    expect(result.current.showNotes).toBe(false);
    
    act(() => {
      result.current.toggleNotesVisibility();
    });
    expect(result.current.showNotes).toBe(true);
    
    act(() => {
      result.current.toggleNotesVisibility();
    });
    expect(result.current.showNotes).toBe(false);
  });
}); 