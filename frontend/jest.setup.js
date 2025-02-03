import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills pour Next.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configuration de testing-library
const { configure } = require('@testing-library/react');

configure({
  testIdAttribute: 'data-testid',
});

// Mock next/font
jest.mock('next/font/google', () => ({
  Playfair_Display: () => ({
    className: 'mocked-font-class',
    style: { fontFamily: 'mocked-font-family' },
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };
  return {
    useRouter: () => mockRouter,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock React hooks
const mockDispatch = jest.fn();

jest.mock('react', () => {
  const mockContext = {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({}),
  };

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }
    setState(partialState, callback) {
      this.state = { ...this.state, ...partialState };
      if (callback) callback();
    }
    forceUpdate(callback) {
      if (callback) callback();
    }
  }

  class PureComponent extends Component {}

  return {
    useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
    useEffect: jest.fn((cb) => cb()),
    useContext: jest.fn(),
    useReducer: () => [{ state: 'mocked' }, mockDispatch],
    useCallback: jest.fn((fn) => fn),
    useMemo: jest.fn((fn) => fn()),
    useRef: jest.fn((initialValue) => ({ current: initialValue })),
    createContext: jest.fn(() => mockContext),
    createElement: jest.fn((type, props, ...children) => ({
      $$typeof: Symbol.for('react.element'),
      type,
      props: { ...props, children },
    })),
    Fragment: Symbol.for('react.fragment'),
    StrictMode: Symbol.for('react.strict_mode'),
    Suspense: jest.fn(({ children }) => children),
    lazy: jest.fn((importer) => {
      let Component;
      importer().then((mod) => {
        Component = mod.default;
      });
      const LazyComponent = (props) => Component ? <Component {...props} /> : null;
      return LazyComponent;
    }),
    Component,
    PureComponent,
    createRef: jest.fn(() => ({ current: null })),
    forwardRef: jest.fn((render) => render),
    isValidElement: jest.fn(() => true),
    cloneElement: jest.fn((element, props) => ({ ...element, props: { ...element.props, ...props } })),
    version: '18.2.0'
  };
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock axios
const mockAxios = {
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock('axios', () => mockAxios);

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Configuration globale
jest.setTimeout(10000);

// Suppression des warnings console pendant les tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0])
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (/Warning: useLayoutEffect does nothing on the server/.test(args[0])) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 