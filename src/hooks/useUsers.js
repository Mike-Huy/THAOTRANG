import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper to create a user without logging out the current admin session
// Note: This uses the anon key, so it's subject to the same rate limits and restrictions.
const createAdminAuthClient = () => {
  const supabaseUrl = 'https://jhebreoxwuimlqwvjdok.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZWJyZW94d3VpbWxxd3ZqZG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzc5MzAsImV4cCI6MjA5MDM1MzkzMH0.VSaOSgcEOZEQbiHP8-CxbyxOJPpJkF1gVIdcidb2rk4';
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

export function useUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ttq6_profiles')
      .select('*')
      .neq('role', 'super_admin')
      .order('created_at', { ascending: false });
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
