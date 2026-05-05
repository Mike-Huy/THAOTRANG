import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts({ status, categoryId, featured, limit } = {}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ttq6_products')
      .select('*, category:ttq6_product_categories(id, name)')
      .order('created_at', { ascending: false });

    if (status)     query = query.eq('status', status);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (featured)   query = query.eq('is_featured', true);
    if (limit)      query = query.limit(limit);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setProducts(data ?? []);
    setLoading(false);
  }, [status, categoryId, featured, limit]);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('ttq6_product_categories')
      .select('*')
      .order('sort_order');
    setCategories(data ?? []);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  async function createProduct(payload) {
    const slug = payload.slug || slugify(payload.name);
    const { data, error } = await supabase
      .from('ttq6_products')
      .insert({ ...payload, slug })
      .select()
      .single();
    if (!error) await fetchProducts();
    return { data, error };
  }

  async function updateProduct(id, payload) {
    const { data, error } = await supabase
      .from('ttq6_products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchProducts();
    return { data, error };
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('ttq6_products').delete().eq('id', id);
    if (!error) await fetchProducts();
    return { error };
  }

  return { products, categories, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
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
