'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="flex items-center justify-center p-8">
          <Card className="p-8 text-center max-w-md">
            <ShieldAlert className="w-16 h-16 mx-auto text-[var(--danger)] mb-4" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Access Denied
            </h1>
            <p className="text-[var(--text-secondary)]">
              You don&apos;t have permission to access this area.
              Admin privileges are required.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
