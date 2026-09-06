import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper to create a secondary auth client (no session persistence)
// so creating a new user won't log out the current admin session.
const createAdminAuthClient = () => {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
};

export function useUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const hasFetchedRef         = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (!hasFetchedRef.current) setLoading(true);
    const { data, error } = await supabase
      .from('ttq6_profiles')
      .select('*')
      .neq('role', 'super_admin')
      .order('created_at', { ascending: false });
    hasFetchedRef.current = true;
    if (error) setError(error.message);
    else setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function addUser(userData) {
    const { email, password, username, phone, role } = userData;
    const authClient = createAdminAuthClient();
    
    // 1. Create the Auth user
    const { data, error: authError } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
          role: role || 'customer',
          full_name: username // For compatibility
        }
      }
    });

    if (authError) return { error: authError.message };

    // 2. The trigger ttq6_handle_new_user should have created the profile.
    // We just need to update the role since the trigger likely sets a default.
    if (data?.user) {
      const { error: updateError } = await supabase
        .from('ttq6_profiles')
        .update({ 
          username, 
          phone, 
          role: role || 'customer' 
        })
        .eq('id', data.user.id);
        
      if (updateError) console.error('Error updating profile role:', updateError);
    }

    await fetchUsers();
    return { error: null, data };
  }

  async function updateRole(userId, role) {
    const { data: target } = await supabase
      .from('ttq6_profiles').select('role').eq('id', userId).single();
    if (target?.role === 'super_admin') return { error: 'Không thể thay đổi quyền tài khoản này.' };
    const { error } = await supabase
      .from('ttq6_profiles')
      .update({ role })
      .eq('id', userId);
    if (!error) await fetchUsers();
    return { error };
  }

  async function toggleBan(userId, isBanned) {
    const { data: target } = await supabase
      .from('ttq6_profiles').select('role').eq('id', userId).single();
    if (target?.role === 'super_admin') return { error: 'Không thể khóa tài khoản này.' };
    const { error } = await supabase
      .from('ttq6_profiles')
      .update({ is_banned: isBanned, banned_at: isBanned ? new Date().toISOString() : null })
      .eq('id', userId);
    if (!error) await fetchUsers();
    return { error };
  }

  return { users, loading, error, refetch: fetchUsers, updateRole, toggleBan, addUser };
}
