import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/providers/client-providers';
import { generateMetadata as baseMetadata } from '@/lib/metadata';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  ...baseMetadata({}),
  metadataBase: new URL('http://localhost:3000')
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <Header />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 