import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { generateMetadata as baseMetadata } from '@/lib/metadata';

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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 