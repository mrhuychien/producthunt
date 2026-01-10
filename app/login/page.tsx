'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-[var(--primary)] rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              IdeaVault
            </span>
          </Link>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {t.auth.welcomeBack}
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              {t.auth.signInSubtitle}
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            variant="outline"
            className="w-full"
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            {t.auth.continueWithGoogle}
          </Button>

          {/* Terms */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {t.auth.termsAgree}{' '}
            <Link href="/terms" className="text-[var(--primary)] hover:underline">
              {t.auth.termsOfService}
            </Link>{' '}
            {t.auth.and}{' '}
            <Link href="/privacy" className="text-[var(--primary)] hover:underline">
              {t.auth.privacyPolicy}
            </Link>
          </p>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← {t.auth.backToHome}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
