'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Key, Bot, Sparkles, Eye, EyeOff, Check } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';

interface Setting {
  key: string;
  value: string;
  description: string;
  isSecret: boolean;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.success) {
        setSettings(data.data || []);
        // Initialize edited values
        const values: Record<string, string> = {};
        data.data?.forEach((s: Setting) => {
          values[s.key] = s.value || '';
        });
        setEditedValues(values);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveResult(null);
    try {
      const settingsToSave = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value,
      }));

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      const data = await res.json();

      if (data.success) {
        setSaveResult({ success: true, message: data.message || 'Đã lưu!' });
        fetchSettings();
      } else {
        setSaveResult({ success: false, message: data.error || 'Không thể lưu' });
      }
    } catch (error) {
      setSaveResult({ success: false, message: 'Lỗi kết nối' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('api_key')) return <Key className="w-5 h-5 text-yellow-500" />;
    if (key.includes('model')) return <Bot className="w-5 h-5 text-purple-500" />;
    if (key.includes('enabled')) return <Sparkles className="w-5 h-5 text-green-500" />;
    return <Settings className="w-5 h-5 text-gray-500" />;
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      openai_api_key: 'OpenAI API Key',
      ai_model: 'AI Model',
      fusion_enabled: 'AI Fusion',
      auto_idea_enabled: 'Auto Generate Ideas',
      auto_idea_count: 'Ideas per Day',
    };
    return labels[key] || key;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Cài đặt hệ thống
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Cấu hình API key và các tính năng AI
        </p>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">
                Cách lấy OpenAI API Key
              </h3>
              <ol className="text-sm text-[var(--text-secondary)] mt-2 space-y-1 list-decimal list-inside">
                <li>Truy cập <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
                <li>Đăng nhập hoặc tạo tài khoản OpenAI</li>
                <li>Click "Create new secret key"</li>
                <li>Copy key và paste vào bên dưới</li>
              </ol>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Configuration Section */}
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  Cấu hình AI
                </h2>

                <div className="space-y-4">
                  {settings.filter(s => s.key.includes('openai') || s.key.includes('model')).map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSettingIcon(setting.key)}
                        <label className="font-medium text-[var(--text-primary)]">
                          {getSettingLabel(setting.key)}
                        </label>
                        {setting.isSecret && (
                          <Badge variant="warning" size="sm">Secret</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {setting.description}
                      </p>
                      <div className="relative">
                        <Input
                          type={setting.isSecret && !showSecrets[setting.key] ? 'password' : 'text'}
                          value={editedValues[setting.key] || ''}
                          onChange={(e) => handleValueChange(setting.key, e.target.value)}
                          placeholder={setting.isSecret ? 'sk-...' : ''}
                          className="pr-10"
                        />
                        {setting.isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleShowSecret(setting.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets[setting.key] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Toggles Section */}
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  Tính năng
                </h2>

                <div className="space-y-4">
                  {settings.filter(s => s.key.includes('enabled') || s.key.includes('count')).map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSettingIcon(setting.key)}
                        <label className="font-medium text-[var(--text-primary)]">
                          {getSettingLabel(setting.key)}
                        </label>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {setting.description}
                      </p>
                      {setting.key.includes('enabled') ? (
                        <div className="flex gap-2">
                          <Button
                            variant={editedValues[setting.key] === 'true' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleValueChange(setting.key, 'true')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Bật
                          </Button>
                          <Button
                            variant={editedValues[setting.key] === 'false' ? 'danger' : 'outline'}
                            size="sm"
                            onClick={() => handleValueChange(setting.key, 'false')}
                          >
                            Tắt
                          </Button>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          value={editedValues[setting.key] || ''}
                          onChange={(e) => handleValueChange(setting.key, e.target.value)}
                          className="w-32"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </>
                  )}
                </Button>
                {saveResult && (
                  <span className={`text-sm ${saveResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {saveResult.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Usage Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">
            💡 Lưu ý
          </h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc list-inside">
            <li>API Key được mã hóa và lưu trữ an toàn</li>
            <li>Nếu không có API Key, AI Fusion sẽ dùng thuật toán đơn giản</li>
            <li>Model <code className="bg-gray-200 px-1 rounded">gpt-3.5-turbo</code> rẻ hơn, <code className="bg-gray-200 px-1 rounded">gpt-4</code> thông minh hơn</li>
            <li>Chi phí OpenAI tính theo số token sử dụng</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
