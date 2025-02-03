import { vi } from 'vitest';

const useRouter = vi.fn().mockReturnValue({
  route: '/',
  pathname: '',
  query: {},
  asPath: '',
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
});

export { useRouter };
export default { useRouter };
