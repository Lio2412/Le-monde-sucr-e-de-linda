import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  CircularProgress,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

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
        name: formData.name,
        email: formData.email,
        password: formData.password
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
    <Box as="form" role="form" onSubmit={handleSubmit} spacing={4}>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <FormControl 
        id="name" 
        isInvalid={!!errors.name} 
        data-testid="form-control-name"
        isRequired
      >
        <FormLabel>Nom</FormLabel>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <FormErrorMessage role="alert" data-testid="name-error">
            {errors.name}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl 
        id="email" 
        isInvalid={!!errors.email} 
        data-testid="form-control-email"
        isRequired
      >
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <FormErrorMessage role="alert" data-testid="email-error">
            {errors.email}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl 
        id="password" 
        isInvalid={!!errors.password} 
        data-testid="form-control-password"
        isRequired
      >
        <FormLabel>Mot de passe</FormLabel>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <FormErrorMessage role="alert" data-testid="password-error">
            {errors.password}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl 
        id="confirmPassword" 
        isInvalid={!!errors.confirmPassword} 
        data-testid="form-control-confirmPassword"
        isRequired
      >
        <FormLabel>Confirmer le mot de passe</FormLabel>
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <FormErrorMessage role="alert" data-testid="confirmPassword-error">
            {errors.confirmPassword}
          </FormErrorMessage>
        )}
      </FormControl>

      <Button
        type="submit"
        colorScheme="blue"
        width="full"
        isLoading={loading}
        loadingText="Inscription en cours..."
      >
        S'inscrire
      </Button>
    </Box>
  );
};

export default RegisterForm;
