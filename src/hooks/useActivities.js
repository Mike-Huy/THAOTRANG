import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useActivities({ status, type, limit } = {}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ttq6_activities')
      .select('*, author:ttq6_profiles(username, full_name)')
      .order('start_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type)   query = query.eq('type', type);
    if (limit)  query = query.limit(limit);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setActivities(data ?? []);
    setLoading(false);
  }, [status, type, limit]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  async function createActivity(payload) {
    const slug = payload.slug || slugify(payload.title);
    const { data, error } = await supabase
      .from('ttq6_activities')
      .insert({ ...payload, slug })
      .select()
      .single();
    if (!error) await fetchActivities();
    return { data, error };
  }

  async function updateActivity(id, payload) {
    const { data, error } = await supabase
      .from('ttq6_activities')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchActivities();
    return { data, error };
  }

  async function deleteActivity(id) {
    const { error } = await supabase.from('ttq6_activities').delete().eq('id', id);
    if (!error) await fetchActivities();
    return { error };
  }

  return { activities, loading, error, refetch: fetchActivities, createActivity, updateActivity, deleteActivity };
}

function slugify(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');
}
