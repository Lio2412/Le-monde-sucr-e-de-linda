const push = jest.fn();
const replace = jest.fn();
const back = jest.fn();
const forward = jest.fn();
const refresh = jest.fn();
const prefetch = jest.fn();

export function useRouter() {
  return {
    push,
    replace,
    back,
    forward,
    refresh,
    prefetch,
    pathname: '/',
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}

export function redirect(url: string) {
  push(url);
}

// Reset all mocks between tests
afterEach(() => {
  push.mockReset();
  replace.mockReset();
  back.mockReset();
  forward.mockReset();
  refresh.mockReset();
  prefetch.mockReset();
}); 