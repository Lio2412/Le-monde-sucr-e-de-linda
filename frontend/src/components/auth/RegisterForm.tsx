import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser l'erreur du champ lors de la modification
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!formData.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      await register({
        email: formData.email,
        password: formData.password,
        nom: formData.name,
        prenom: "",
        pseudo: formData.name
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form role="form" onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          data-testid="form-control-name"
          aria-required="true"
          className={cn(errors.name && "border-red-500")}
        />
        {errors.name && (
          <p className="text-sm text-red-500" role="alert" data-testid="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          data-testid="form-control-email"
          aria-required="true"
          className={cn(errors.email && "border-red-500")}
        />
        {errors.email && (
          <p className="text-sm text-red-500" role="alert" data-testid="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Mot de passe <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
          data-testid="form-control-password"
          aria-required="true"
          className={cn(errors.password && "border-red-500")}
        />
        {errors.password && (
          <p className="text-sm text-red-500" role="alert" data-testid="password-error">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmer le mot de passe <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          aria-invalid={!!errors.confirmPassword}
          data-testid="form-control-confirmPassword"
          aria-required="true"
          className={cn(errors.confirmPassword && "border-red-500")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500" role="alert" data-testid="confirmPassword-error">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner className="mr-2" />
            Inscription en cours...
          </>
        ) : (
          "S'inscrire"
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
