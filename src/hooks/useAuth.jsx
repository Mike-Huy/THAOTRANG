import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ttq6_profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Bước 1: getSession để biết trạng thái ban đầu ngay lập tức
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false); // Không có session → tắt loading ngay
      }
    });

    // Bước 2: onAuthStateChange chỉ xử lý SIGN_IN / SIGN_OUT sau đó
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          loadProfile(session.user.id);
        }
      } else {
        if (event === 'SIGNED_OUT') {
          window.location.replace('/');
          return; // redirect ngay, không set state để React không kịp re-render
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
          ...metadata
        },
        // Không redirect về email — dùng trang hiện tại
        emailRedirectTo: window.location.origin,
      }
    });
    return { data, error };
  }

  // Đăng ký xong → tự đăng nhập luôn (hoạt động khi Supabase đã tắt confirm email)
  async function signUpAndSignIn(email, password, metadata = {}) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'customer', ...metadata },
        emailRedirectTo: window.location.origin,
      }
    });

    if (signUpError) return { error: signUpError, needsConfirm: false };

    // identities rỗng = email đã tồn tại (Supabase trả fake success)
    if (signUpData?.user?.identities?.length === 0) {
      return { error: { message: 'Email này đã được đăng ký.' }, needsConfirm: false };
    }

    // Thử đăng nhập ngay — thành công nếu Supabase đã tắt confirm email
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // Supabase vẫn bật confirm email → báo user kiểm tra hộp thư
      return { error: null, needsConfirm: true };
    }

    return { error: null, needsConfirm: false };
  }

  async function signOut() {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT sẽ set profile=null và redirect
  }

  const isAdmin      = ['super_admin', 'admin'].includes(profile?.role);
  const isSuperAdmin = profile?.role === 'super_admin';
  const isStaff      = ['super_admin', 'admin', 'staff'].includes(profile?.role);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signUpAndSignIn, signOut, isAdmin, isSuperAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
