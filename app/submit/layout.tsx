import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Idea',
  description: 'Share your problem or solution with the IdeaVault community. Get feedback and votes from fellow innovators.',
  openGraph: {
    title: 'Submit Your Idea | IdeaVault',
    description: 'Share your problem or solution with the community.',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
