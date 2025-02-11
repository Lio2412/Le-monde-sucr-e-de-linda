'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function NewsletterForm({
  variant = 'default',
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // TODO: Implémenter l'appel API pour sauvegarder l'email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className={cn(
      'w-full',
      variant === 'minimal' ? 'max-w-sm mx-auto' : '',
      className
    )}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className={cn(
            'w-full px-4 py-3 rounded-lg text-sm',
            variant === 'default' 
              ? 'border border-gray-200 focus:border-pink-300'
              : 'bg-white/90 border-0 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200'
          )}
          disabled={status === 'loading'}
          required
        />
        <button
          type="submit"
          className={cn(
            'mt-3 w-full sm:mt-0 sm:w-auto',
            variant === 'default'
              ? 'px-6 py-3 bg-pink-400 text-white rounded-lg hover:bg-pink-500'
              : 'sm:absolute sm:right-1 sm:top-1 px-4 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500',
            'text-sm font-medium transition-colors duration-200 disabled:opacity-50'
          )}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-2 text-sm text-green-600">
          Merci pour votre inscription ! Vous recevrez bientôt nos actualités.
        </p>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">
          Une erreur est survenue. Veuillez réessayer plus tard.
        </p>
      )}
    </div>
  );
} 