/**
 * Déclarations de types pour Jest
 * Ce fichier permet de supprimer les erreurs TypeScript liées aux méthodes d'assertion de Jest
 */

// Étend les déclarations globales
declare global {
  // Étend l'espace de noms Jest
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveProperty(property: string, value?: any): R;
      toBeNull(): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(item: any): R;
      toHaveLength(length: number): R;
      toMatch(pattern: RegExp | string): R;
      toMatchObject(object: any): R;
      toThrow(error?: any): R;
    }
  }

  // Redéfinit expect
  const expect: jest.Expect;
  
  // Définit l'interface Expect
  namespace jest {
    interface Expect {
      <T = any>(actual: T): Matchers<void>;
      extends(obj: any, expected: any): void;
    }
  }
}

// Exporte un type vide pour satisfaire TypeScript
export {};
