import type { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  url?: string;
}

const defaultMetadata = {
  title: 'Le Monde Sucré de Linda',
  description: 'Découvrez des recettes de pâtisserie délicieuses et créatives, des astuces et des techniques pour réussir vos desserts comme un pro.',
  keywords: ['pâtisserie', 'recettes', 'desserts', 'gâteaux', 'cuisine', 'blog culinaire'],
  image: '/images/og-image.jpg',
  type: 'website' as const,
  url: 'https://le-monde-sucre-de-linda.fr'
};

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  url
}: GenerateMetadataProps = {}): Metadata {
  const finalTitle = title ? `${title} | ${defaultMetadata.title}` : defaultMetadata.title;
  const finalDescription = description || defaultMetadata.description;
  const finalKeywords = [...defaultMetadata.keywords, ...keywords];
  const finalImage = image || defaultMetadata.image;
  const finalUrl = url || defaultMetadata.url;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords.join(', '),
    authors: [{ name: 'Linda' }],
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      type,
      url: finalUrl,
      siteName: defaultMetadata.title,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
      creator: '@LindaPastry',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: finalUrl,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    verification: {
      google: 'your-google-site-verification',
    },
  };
} 