'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { playfair } from '@/app/fonts';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pseudo, setPseudo] = useState("");
  const [pseudoError, setPseudoError] = useState("");

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
    terms: false
  });

  const { subscribe } = useNewsletter();
  const router = useRouter();
  const { register } = useAuth();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...formErrors };

    switch (name) {
      case 'firstName':
        if (!value) {
          newErrors.firstName = 'Le prénom est requis';
        } else if (value.length < 2) {
          newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value) {
          newErrors.lastName = 'Le nom est requis';
        } else if (value.length < 2) {
          newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.lastName;
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors.email = 'L\'email est requis';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
        } else {
          delete newErrors.password;
        }
        
        // Vérifier aussi la confirmation du mot de passe
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setFormErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Valider le champ immédiatement
    if (type !== 'checkbox') {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    // Valider tous les champs
    validateField('firstName', formData.firstName);
    validateField('lastName', formData.lastName);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);

    // Vérifier s'il y a des erreurs
    return Object.keys(formErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      newsletter: true,
      terms: false
    });
    setFormErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider tous les champs avant la soumission
    validateField('firstName', formData.firstName);
    validateField('lastName', formData.lastName);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    if (!formData.terms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        nom: formData.lastName,
        prenom: formData.firstName,
        pseudo: `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`
      });

      if (result.success) {
        if (result.message === 'Email de validation envoyé') {
          setSuccess('email de validation envoyé');
          setTimeout(() => {
            router.replace('/connexion');
          }, 2000);
        } else if (formData.newsletter) {
          await subscribe(formData.email);
          resetForm();
          router.replace('/connexion');
        }
      } else {
        setError(result.message || "Une erreur est survenue lors de l'inscription");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('email') && error.message.includes('existe')) {
          setError('Cet email est déjà utilisé');
        } else if (error.message.includes('mot de passe') || error.message.includes('password')) {
          setError('Le mot de passe ne respecte pas les critères de sécurité');
        } else if (error.message.includes('SQL')) {
          setError('Caractères non autorisés');
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          setError('Délai d\'attente dépassé');
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          setError('Problème de connexion');
        } else {
          setError("Une erreur est survenue lors de l'inscription");
        }
      } else {
        setError("Une erreur est survenue lors de l'inscription");
      }
    }
  };

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Image décorative */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1612203985729-70726954388c?q=80&w=1200"
                alt="Pâtisseries"
                fill={true}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent"></div>
            </motion.div>

            {/* Formulaire d'inscription */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-1/2 max-w-md"
            >
              <div className="text-center lg:text-left mb-8">
                <h1 className={`text-3xl font-bold mb-4 ${playfair.className}`}>
                  Créer un compte
                </h1>
                <p className="text-gray-600">
                  Rejoignez notre communauté de passionnés de pâtisserie et partagez vos créations.
                </p>
              </div>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg" data-testid="success-message">
                  {success}
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg" data-testid="error-message">
                  {error}
                </div>
              )}

              <form 
                className="space-y-6"
                role="form"
                onSubmit={handleSubmit}
              >
                {/* Nom et Prénom */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      data-testid="prenom"
                      className="w-full pl-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {formErrors.firstName && (
                    <div data-testid="prenom-error" className="text-red-600 text-sm mt-1">
                      {formErrors.firstName}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      data-testid="nom"
                      className="w-full pl-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {formErrors.lastName && (
                    <div data-testid="nom-error" className="text-red-600 text-sm mt-1">
                      {formErrors.lastName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="pseudo">Pseudo</label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      data-testid="pseudo"
                      id="pseudo"
                      name="pseudo"
                      type="text"
                      placeholder="Votre pseudo"
                      value={pseudo}
                      onChange={(e) => {
                         setPseudo(e.target.value);
                         if (/['\"]/g.test(e.target.value)) {
                           setPseudoError('caractères non autorisés');
                         } else {
                           setPseudoError('');
                         }
                      }}
                      required
                    />
                  </div>
                  {pseudoError && (
                    <p className="mt-1 text-xs text-red-600" data-testid="pseudo-error">{pseudoError}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      data-testid="email"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {formErrors.email && (
                    <div data-testid="email-error" className="text-red-600 text-sm mt-1">
                      {formErrors.email}
                    </div>
                  )}
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      data-testid="password"
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <div data-testid="password-error" className="text-red-600 text-sm mt-1">
                      {formErrors.password}
                    </div>
                  )}
                </div>

                {/* Confirmation du mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      data-testid="confirmPassword"
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <div data-testid="confirmPassword-error" className="text-red-600 text-sm mt-1">
                      {formErrors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Newsletter et conditions */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      data-testid="newsletter"
                      checked={formData.newsletter}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                      Je souhaite recevoir la newsletter
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      data-testid="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      J'accepte les{' '}
                      <Link href="/conditions" className="text-pink-500 hover:text-pink-600">
                        conditions d'utilisation
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  className="w-full py-3 bg-pink-400 text-white rounded-lg transition-all hover:bg-pink-500 active:scale-95"
                  data-testid="submit"
                >
                  S'inscrire
                </button>

                {/* Lien de connexion */}
                <p className="text-center text-sm text-gray-600">
                  Déjà inscrit ?{' '}
                  <Link href="/connexion" className="text-pink-500 hover:text-pink-600">
                    Se connecter
                  </Link>
                </p>
              </form>

              {/* Séparateur */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou s'inscrire avec</span>
                </div>
              </div>

              {/* Boutons sociaux */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Image
                    src="/images/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Image
                    src="/images/facebook.svg"
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 