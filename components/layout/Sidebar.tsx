'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  Target,
  Bookmark,
  Settings,
  Shield,
  BarChart3,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const userLinks = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/submit', label: t.nav.submitIdea, icon: PlusCircle },
    { href: '/my-ideas', label: t.nav.myIdeas, icon: Target },
    { href: '/saved', label: t.nav.saved, icon: Bookmark },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const adminLinks = [
    { href: '/moderate', label: t.nav.moderate, icon: Shield },
    { href: '/users', label: t.nav.users, icon: Users },
    { href: '/analytics', label: t.nav.analytics, icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        {/* User Navigation */}
        <nav className="space-y-1">
          {userLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full"
                  />
                )}
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="my-6 border-t border-[var(--border)]" />
            <div className="mb-2 px-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {t.nav.admin}
              </span>
            </div>
            <nav className="space-y-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-admin-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full"
                      />
                    )}
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}
