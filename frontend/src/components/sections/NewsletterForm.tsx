'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'minimal' | 'standard';
  className?: string;
}

export default function NewsletterForm({ variant = 'standard', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      // TODO: Intégrer l'API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation d'appel API
      
      toast.success('Inscription réussie ! Bienvenue dans notre newsletter.');
      setEmail('');
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-l focus:outline-none focus:border-pink-300"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-pink-500 text-white rounded-r hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Inscrivez-vous à notre newsletter
        </label>
        <p className="text-sm text-gray-500">
          Recevez nos dernières recettes et astuces directement dans votre boîte mail.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="patisserie@example.com"
          className="flex-1 px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-pink-300"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Inscription...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>S'inscrire</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500">
        En vous inscrivant, vous acceptez de recevoir nos newsletters. Vous pourrez vous désinscrire à tout moment.
      </p>
    </motion.form>
  );
} 