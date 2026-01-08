import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Ideas',
  description: 'Discover and vote on the best ideas from the community. Find your next project or share your own innovative solutions.',
  openGraph: {
    title: 'Browse Ideas | IdeaVault',
    description: 'Discover and vote on the best ideas from the community.',
  },
};

export default function IdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
