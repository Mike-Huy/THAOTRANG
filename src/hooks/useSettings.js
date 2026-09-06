import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CACHE_KEY = 'ttq6_settings_cache';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(map) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch { /* quota exceeded, bỏ qua */ }
}

export function useSettings(group = null) {
  // Khi không lọc group: khởi tạo ngay từ cache → không flash ảnh khi load
  const [settings, setSettings] = useState(() => (!group ? (readCache() ?? {}) : {}));
  const [raw, setRaw]           = useState([]);
  // Chỉ loading=true khi chưa có cache (lần đầu vào trang)
  const [loading, setLoading]   = useState(() => !group && !readCache());
  const [error, setError]       = useState(null);

  const fetchSettings = useCallback(async () => {
    let query = supabase.from('ttq6_settings').select('*').order('setting_group').order('key');
    if (group) query = query.eq('setting_group', group);

    const { data, error } = await query;
    if (error) { setError(error.message); setLoading(false); return; }

    // Chuyển array → object dạng { key: value } cho dễ dùng
    const map = {};
    (data ?? []).forEach(row => {
      map[row.key] = parseValue(row.value, row.type);
    });

    // Lưu cache để lần sau render ngay, không flash
    if (!group) writeCache(map);

    setRaw(data ?? []);
    setSettings(map);
    setLoading(false);
  }, [group]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function updateSetting(key, value, updatedBy) {
    const { error } = await supabase
      .from('ttq6_settings')
      .upsert({ 
        key, 
        value: typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value),
        type: typeof value === 'object' && value !== null ? 'json' : 'string',
        updated_by: updatedBy, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'key' });
    if (!error) await fetchSettings();
    return { error };
  }

  // Cập nhật nhiều settings cùng lúc
  async function updateMany(payload, updatedBy) {
    const entries = Object.entries(payload);
    const results = await Promise.all(
      entries.map(([key, value]) => {
        const isJson = Array.isArray(value) || (typeof value === 'object' && value !== null);
        return supabase.from('ttq6_settings').upsert({
          key,
          value: isJson ? JSON.stringify(value) : String(value ?? ''),
          type:  isJson ? 'json' : 'string',
          updated_by: updatedBy ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      })
    );
    const failed = results.find(r => r.error);
    if (failed) {
      console.error('[useSettings] updateMany error:', failed.error);
      return { error: failed.error };
    }
    await fetchSettings();
    return { error: null };
  }

  return { settings, raw, loading, error, refetch: fetchSettings, updateSetting, updateMany };
}

function parseValue(value, type) {
  if (value === null || value === undefined) return '';
  if (type === 'number')  return Number(value);
  if (type === 'boolean') return value === 'true';
  if (type === 'json') {
    try { return JSON.parse(value); } catch { return value; }
  }
  // Tự động phục hồi dữ liệu JSON bị lưu nhầm type='string'
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('[') || trimmed.startsWith('{')) && trimmed.length > 1) {
      try { return JSON.parse(trimmed); } catch { /* không phải JSON hợp lệ, giữ nguyên */ }
    }
  }
  return value;
}
