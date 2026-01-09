'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/lib/i18n';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}
