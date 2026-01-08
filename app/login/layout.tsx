import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to IdeaVault to submit ideas, vote, and engage with the community.',
  openGraph: {
    title: 'Login | IdeaVault',
    description: 'Sign in to submit ideas and vote on the best ones.',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
