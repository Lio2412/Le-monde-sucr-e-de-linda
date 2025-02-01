import { DefaultBodyType, PathParams, ResponseComposition, RestContext, RestRequest } from 'msw';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveClass(className: string): R;
    }
  }
}

export type MockRestHandler = (
  req: RestRequest<DefaultBodyType, PathParams>,
  res: ResponseComposition,
  ctx: RestContext
) => Promise<any> | any;

export interface LoginRequest extends DefaultBodyType {
  email: string;
  password: string;
}

export interface TestUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  roles: Array<{
    role: {
      nom: string;
      description: string;
    }
  }>;
}

export interface TestAuthResponse {
  success: boolean;
  data?: {
    user: TestUser;
    token: string;
  };
  message?: string;
} 