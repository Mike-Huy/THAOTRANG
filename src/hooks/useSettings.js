import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings(group = null) {
  const [settings, setSettings] = useState({});
  const [raw, setRaw]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('ttq6_settings').select('*').order('setting_group').order('key');
    if (group) query = query.eq('setting_group', group);

    const { data, error } = await query;
    if (error) { setError(error.message); setLoading(false); return; }

    // Chuyển array → object dạng { key: value } cho dễ dùng
    const map = {};
    (data ?? []).forEach(row => {
      map[row.key] = parseValue(row.value, row.type);
    });
    setRaw(data ?? []);
    setSettings(map);
    setLoading(false);
  }, [group]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function updateSetting(key, value, updatedBy) {
    const { error } = await supabase
      .from('ttq6_settings')
      .update({ value: String(value), updated_by: updatedBy, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (!error) await fetchSettings();
    return { error };
  }

  // Cập nhật nhiều settings cùng lúc
  async function updateMany(payload, updatedBy) {
    const updates = Object.entries(payload).map(([key, value]) =>
      supabase.from('ttq6_settings').update({
        value: String(value),
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      }).eq('key', key)
    );
    const results = await Promise.all(updates);
    const failed  = results.find(r => r.error);
    if (!failed) await fetchSettings();
    return { error: failed?.error ?? null };
  }

  return { settings, raw, loading, error, refetch: fetchSettings, updateSetting, updateMany };
}

function parseValue(value, type) {
  if (value === null || value === undefined) return '';
  if (type === 'number')  return Number(value);
  if (type === 'boolean') return value === 'true';
  if (type === 'json')    try { return JSON.parse(value); } catch { return value; }
  return value;
}
