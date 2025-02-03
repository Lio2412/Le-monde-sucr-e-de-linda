import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

interface LoginFormData {
  email: string;
  motDePasse: string;
}

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setFormError(null);
      await login(data);
      router.push('/dashboard');
    } catch (err) {
      setFormError("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "L'adresse email n'est pas valide"
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          type="password"
          {...register("motDePasse", {
            required: "Le mot de passe est requis",
            minLength: {
              value: 8,
              message: "Le mot de passe doit contenir au moins 8 caractères"
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.motDePasse && (
          <p className="mt-1 text-sm text-red-600">{errors.motDePasse.message}</p>
        )}
      </div>

      {(error || formError) && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error || formError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  );
};

export default LoginForm; 