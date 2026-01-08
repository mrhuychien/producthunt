'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, User, Search, MoreHorizontal } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatRelativeTime } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
  created_at: string;
  _count?: {
    ideas: number;
    comments: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((user) =>
          user.id === userId ? { ...user, role: newRole as 'user' | 'admin' } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <Users className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            User Management
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Manage user accounts and permissions
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="max-w-md">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </motion.div>

      {/* Count Badge */}
      <div className="mb-4">
        <Badge variant="default">
          {filteredUsers.length} of {totalCount} user{totalCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">Loading users...</p>
          </Card>
        ) : filteredUsers.length > 0 ? (
          <Card className="divide-y divide-[var(--border)]">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                <UserAvatar
                  src={user.image}
                  name={user.name}
                  size="lg"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--text-primary)]">
                      {user.name}
                    </p>
                    <Badge
                      variant={user.role === 'admin' ? 'primary' : 'default'}
                      size="sm"
                    >
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {user.email}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Joined {formatRelativeTime(user.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRole(user.id, user.role)}
                  >
                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No users found
            </h3>
            <p className="text-[var(--text-secondary)]">
              {search ? 'Try a different search term.' : 'No users have registered yet.'}
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
