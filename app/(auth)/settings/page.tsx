'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useLanguage } from '@/lib/i18n';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setIsEditing(false);
      }
    } catch {
      // Silent fail
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t.settings.title}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {t.settings.subtitle}
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.settings.profile}
          </h2>

          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <UserAvatar
                src={session?.user?.image}
                name={session?.user?.name || 'User'}
                size="xl"
              />
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label={t.settings.displayName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} isLoading={isSaving}>
                      {t.settings.saveChanges}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      {t.common.cancel}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)]">
                      {t.settings.displayName}
                    </label>
                    <p className="font-medium text-[var(--text-primary)]">
                      {session?.user?.name}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    {t.settings.editProfile}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Email Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t.settings.email}
          </h2>

          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              {t.settings.email}
            </label>
            <p className="font-medium text-[var(--text-primary)]">
              {session?.user?.email}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t.settings.emailManaged}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Account Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.settings.account}
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                {t.settings.accountType}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={session?.user?.role === 'admin' ? 'primary' : 'default'}>
                  {session?.user?.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
