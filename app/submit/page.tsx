'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Eye, Send } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, Input, Textarea, Select, Badge } from '@/components/ui';
import { useLanguage } from '@/lib/i18n';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function SubmitIdeaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<{ value: string; label: string; icon: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          const cats = (data.data || data || []).map((cat: Category) => ({
            value: cat.id,
            label: cat.name,
            icon: cat.icon,
          }));
          setCategories(cats);
        }
      } catch {
        // Fallback to empty categories
      }
    };
    fetchCategories();
  }, []);

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit idea');
      }

      const data = await response.json();
      router.push(`/ideas/${data.id}`);
    } catch {
      setErrors({ submit: 'Failed to submit idea. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const selectedCategory = categories.find((c) => c.value === formData.categoryId);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.ideaDetail.backToIdeas}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t.submitIdea.title}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {t.submitIdea.subtitle}
          </p>
        </motion.div>

        {/* Form / Preview Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={!showPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            {t.common.edit}
          </Button>
          <Button
            variant={showPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowPreview(true)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            {t.submitIdea.preview}
          </Button>
        </div>

        {!showPreview ? (
          /* Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Title */}
                <Input
                  label={`${t.submitIdea.titleLabel} *`}
                  placeholder={t.submitIdea.titlePlaceholder}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                  helperText={t.submitIdea.titleHelper}
                />

                {/* Category */}
                <Select
                  label={`${t.submitIdea.categoryLabel} *`}
                  placeholder={t.submitIdea.categoryPlaceholder}
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categories}
                  error={errors.categoryId}
                />

                {/* Description */}
                <Textarea
                  label={`${t.submitIdea.descriptionLabel} *`}
                  placeholder={t.submitIdea.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={errors.description}
                  helperText={t.submitIdea.descriptionHelper}
                  className="min-h-[200px]"
                />

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    {t.submitIdea.tagsLabel}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder={t.submitIdea.tagsPlaceholder}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 5}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                    {t.submitIdea.tagsHelper}
                  </p>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    {t.submitIdea.preview}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {t.submitIdea.submitButton}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Preview */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 sm:p-8">
              {/* Preview Header */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedCategory && (
                  <Badge variant="primary" icon={<span>{selectedCategory.icon}</span>}>
                    {selectedCategory.label}
                  </Badge>
                )}
                <Badge variant="success">Open</Badge>
              </div>

              {/* Preview Title */}
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                {formData.title || 'Your Idea Title'}
              </h2>

              {/* Preview Description */}
              <div className="prose prose-sm max-w-none text-[var(--text-secondary)] mb-6">
                {formData.description ? (
                  formData.description.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return (
                        <h3 key={i} className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">
                          {line.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={i} className="ml-4">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="mb-2">{line}</p>;
                  })
                ) : (
                  <p className="text-[var(--text-secondary)] italic">
                    Your description will appear here...
                  </p>
                )}
              </div>

              {/* Preview Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  {t.submitIdea.backToEdit}
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {t.submitIdea.submitButton}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
