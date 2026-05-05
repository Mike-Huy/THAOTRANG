import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePosts({ status, category, limit } = {}) {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ttq6_posts')
      .select('*, author:ttq6_profiles(username, full_name)')
      .order('created_at', { ascending: false });

    if (status)   query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (limit)    query = query.limit(limit);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setPosts(data ?? []);
    setLoading(false);
  }, [status, category, limit]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function createPost(payload) {
    const slug = payload.slug || slugify(payload.title);
    const { data, error } = await supabase
      .from('ttq6_posts')
      .insert({ ...payload, slug })
      .select()
      .single();
    if (!error) await fetchPosts();
    return { data, error };
  }

  async function updatePost(id, payload) {
    const { data, error } = await supabase
      .from('ttq6_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchPosts();
    return { data, error };
  }

  async function deletePost(id) {
    const { error } = await supabase.from('ttq6_posts').delete().eq('id', id);
    if (!error) await fetchPosts();
    return { error };
  }

  async function publishPost(id) {
    return updatePost(id, { status: 'published', published_at: new Date().toISOString() });
  }

  async function unpublishPost(id) {
    return updatePost(id, { status: 'draft', published_at: null });
  }

  return { posts, loading, error, refetch: fetchPosts, createPost, updatePost, deletePost, publishPost, unpublishPost };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Date.now();
}
