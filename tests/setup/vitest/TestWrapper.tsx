import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    }
  }
});

interface TestWrapperProps extends PropsWithChildren {
  withQueryClient?: boolean;
  withChakra?: boolean;
}

export const TestWrapper = ({ 
  children,
  withQueryClient = true,
  withChakra = true
}: TestWrapperProps) => {
  let wrappedChildren = children;

  if (withChakra) {
    wrappedChildren = (
      <ChakraProvider>
        {wrappedChildren}
      </ChakraProvider>
    );
  }

  if (withQueryClient) {
    wrappedChildren = (
      <QueryClientProvider client={queryClient}>
        {wrappedChildren}
      </QueryClientProvider>
    );
  }

  return <>{wrappedChildren}</>;
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options: Omit<TestWrapperProps, 'children'> = {}
) => {
  return render(ui, {
    wrapper: (props) => <TestWrapper {...props} {...options} />,
  });
};
