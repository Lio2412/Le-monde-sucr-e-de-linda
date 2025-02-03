import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

function render(ui: React.ReactElement, { session = null, ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
