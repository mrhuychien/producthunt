'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import type { Idea } from '@/types';

const categories = [
  { value: '1', label: 'Tools', icon: '🛠' },
  { value: '2', label: 'Apps', icon: '📱' },
  { value: '3', label: 'Games', icon: '🎮' },
  { value: '4', label: 'Business', icon: '📊' },
  { value: '5', label: 'Design', icon: '🎨' },
  { value: '6', label: 'Education', icon: '📚' },
];

export default function EditIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchIdea() {
      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (!res.ok) {
          router.push('/my-ideas');
          return;
        }
        const idea: Idea = await res.json();
        setFormData({
          title: idea.title,
          categoryId: idea.categoryId,
          description: idea.description,
        });
      } catch (error) {
        console.error('Error fetching idea:', error);
        router.push('/my-ideas');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update idea');
      }

      router.push(`/ideas/${ideaId}`);
    } catch (error) {
      console.error('Error updating idea:', error);
      setErrors({ submit: 'Failed to update idea. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this idea? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete idea');
      }

      router.push('/my-ideas');
    } catch (error) {
      console.error('Error deleting idea:', error);
      setErrors({ submit: 'Failed to delete idea. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href="/my-ideas"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Ideas
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Edit Idea
        </h1>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Delete
        </Button>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Title */}
            <Input
              label="Title *"
              placeholder="E.g., Tool to convert PDF to editable documents"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
            />

            {/* Category */}
            <Select
              label="Category *"
              placeholder="Select a category..."
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories}
              error={errors.categoryId}
            />

            {/* Description */}
            <Textarea
              label="Description *"
              placeholder="Describe your idea or problem in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              className="min-h-[200px]"
            />

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <Link href={`/ideas/${ideaId}`}>
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
