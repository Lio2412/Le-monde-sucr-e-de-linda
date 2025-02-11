'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Facebook, Twitter, Instagram, Link, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export default function ShareButtons({ url, title, className = '' }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleShare = (platform: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      instagram: `https://www.instagram.com/`, // Instagram ne supporte pas le partage direct
    };

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Partager"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 p-2 z-50"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <Instagram className="w-5 h-5 text-pink-600" />
                <span>Instagram</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Link className="w-5 h-5 text-gray-500" />
                )}
                <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 