import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveClass(className: string): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      not: Matchers<R>;
    }
  }
} 