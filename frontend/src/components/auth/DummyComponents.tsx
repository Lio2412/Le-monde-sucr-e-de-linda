import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

export const DummyLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    try {
      if (newAttempts >= 3) {
        setError('Accès non autorisé');
        return;
      }

      await login({
        email: 'test@test.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'incorrect') {
          setError('Email ou mot de passe incorrect');
        } else if (error.message === 'SQL') {
          setError('Caractères non autorisés');
        } else if (error.message.includes('timeout')) {
          setError('Délai d\'attente dépassé');
        } else if (error.message.includes('network')) {
          setError('Problème de connexion');
        } else {
          setError('Problème de connexion');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} role="form">
      <input data-testid="email" defaultValue="test@test.com" />
      <input data-testid="password" defaultValue="wrongpassword" type="password" />
      <button data-testid="submit" type="submit">Se connecter</button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

export const DummyProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getCurrentUser } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsChecking(false);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'expired' || error.message === 'invalid') {
            localStorage.removeItem('token');
            router.push('/connexion');
          }
        }
      }
    };
    checkAuth();
  }, [getCurrentUser, router]);

  if (isChecking) return null;
  return <>{children}</>;
};

export const DummyRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [confirmation, setConfirmation] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register({
        prenom: 'User',
        nom: 'Nouveau',
        email: 'nouveau@test.com',
        password: 'Password123!',
        pseudo: 'newuser'
      });
      
      if (result.success) {
        setConfirmation('Un email de confirmation a été envoyé');
      } else {
        setConfirmation(result.message || 'Une erreur est survenue');
      }
    } catch (error) {
      if (error instanceof Error) {
        setConfirmation(error.message);
      } else {
        setConfirmation('Une erreur est survenue');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} role="form">
      <input data-testid="prenom" defaultValue="User" />
      <input data-testid="nom" defaultValue="Nouveau" />
      <input data-testid="email" defaultValue="nouveau@test.com" />
      <input data-testid="password" defaultValue="Password123!" type="password" />
      <input data-testid="pseudo" defaultValue="newuser" />
      <button data-testid="submit" type="submit">S'inscrire</button>
      {confirmation && <div data-testid="confirmation">{confirmation}</div>}
    </form>
  );
};

export const DummySQLInjectionLogin: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login({
        email: "test@test.com' OR '1'='1",
        password: "password' OR '1'='1"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'SQL' || error.message.includes('SQL')) {
          setError('Caractères non autorisés');
        } else if (error.message.includes('incorrect')) {
          setError('Email ou mot de passe incorrect');
        } else {
          setError('Problème de connexion');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} role="form">
      <input data-testid="email" defaultValue="test@test.com' OR '1'='1" />
      <input data-testid="password" defaultValue="password' OR '1'='1" type="password" />
      <button data-testid="submit" type="submit">Se connecter</button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
}; 