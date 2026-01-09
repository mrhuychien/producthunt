import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: {
    default: 'IdeaVault - Share Ideas, Build Together',
    template: '%s | IdeaVault',
  },
  description: 'Share your ideas, vote on the best ones, and help build amazing products together with the community.',
  keywords: ['ideas', 'crowdsourcing', 'product ideas', 'startup ideas', 'community'],
  authors: [{ name: 'IdeaVault Team' }],
  openGraph: {
    title: 'IdeaVault - Share Ideas, Build Together',
    description: 'Share your ideas, vote on the best ones, and help build amazing products together.',
    type: 'website',
    locale: 'en_US',
    siteName: 'IdeaVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaVault - Share Ideas, Build Together',
    description: 'Share your ideas, vote on the best ones, and help build amazing products together.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
