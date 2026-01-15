'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Target, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const user = session?.user;

  const navLinks = [
    { href: '/submit', label: t.nav.submitIdea },
    { href: '/ideas', label: t.nav.browseIdeas },
    { href: '/fusion', label: '🧬 Fusion' },
    { href: '/battle', label: '⚔️ Battle' },
    { href: '/bounty', label: '💰 Bounty' },
    { href: '/about', label: t.footer.about },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-2 bg-[var(--primary)] rounded-lg"
            >
              <Target className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              IdeaVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex" aria-label="Search">
              <Search className="w-4 h-4" />
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={user.image || '/default-avatar.png'}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-[var(--border)] cursor-pointer"
                  />
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  {t.nav.login}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-[var(--border)]"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
