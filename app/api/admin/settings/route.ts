import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// Check if user is admin (you may want to implement proper admin check)
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return user?.role === 'admin';
}

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    // For now, allow any logged-in user to view settings
    // In production, add proper admin check

    const supabase = createServerClient();

    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('key, value, description, is_secret, updated_at')
      .order('key');

    if (error) {
      console.error('Error fetching settings:', error);
      return errorResponse('Không thể lấy cài đặt', 500);
    }

    // Mask secret values
    const maskedSettings = settings?.map(s => ({
      ...s,
      value: s.is_secret && s.value ? '********' : s.value,
    }));

    return successResponse({
      success: true,
      data: maskedSettings || [],
    });
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return errorResponse('Settings array is required', 400);
    }

    const supabase = createServerClient();

    // Update each setting
    for (const setting of settings) {
      const { key, value } = setting;

      // Skip if value is masked (not changed)
      if (value === '********') continue;

      const { error } = await supabase
        .from('app_settings')
        .update({
          value,
          updated_at: new Date().toISOString(),
          updated_by: session?.user?.id,
        })
        .eq('key', key);

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
      }
    }

    return successResponse({
      success: true,
      message: 'Đã lưu cài đặt thành công!',
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Helper function to get a specific setting (used by other APIs)
export async function getSetting(key: string): Promise<string | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  return data?.value || null;
}
