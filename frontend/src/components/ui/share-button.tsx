import { useState } from 'react';
import { Share2, Facebook, Twitter, Link as LinkIcon, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButton({ url, title, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'bg-blue-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      onClick: () => {
        // Instagram n'a pas d'API de partage directe, on copie le lien
        navigator.clipboard.writeText(url);
        alert('Lien copié ! Vous pouvez maintenant le coller dans votre story Instagram');
      },
      color: 'bg-pink-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      color: 'bg-sky-500'
    },
    {
      name: 'Copier le lien',
      icon: LinkIcon,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          alert('Lien copié !');
        } catch (err) {
          console.error('Erreur lors de la copie :', err);
        }
      },
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-5 h-5" />
        <span>Partager</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer le menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu de partage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50"
            >
              {shareOptions.map((option) => (
                <motion.button
                  key={option.name}
                  onClick={() => {
                    if (option.onClick) {
                      option.onClick();
                    } else if (option.href) {
                      window.open(option.href, '_blank');
                    }
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 