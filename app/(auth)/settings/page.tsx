'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { UserAvatar } from '@/components/shared/UserAvatar';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
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
          Settings
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your account settings
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
            Profile
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
                    label="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} isLoading={isSaving}>
                      Save Changes
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)]">
                      Display Name
                    </label>
                    <p className="font-medium text-[var(--text-primary)]">
                      {session?.user?.name}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
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
            Email
          </h2>

          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              Email Address
            </label>
            <p className="font-medium text-[var(--text-primary)]">
              {session?.user?.email}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Email is managed through your Google account
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
            Account
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Account Type
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
