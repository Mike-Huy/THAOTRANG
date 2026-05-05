-- ============================================================
-- TTQ6 - SUPER ADMIN SETUP (phần còn lại sau khi tạo user thủ công)
-- Chạy file này SAU KHI đã tạo user ttq6_sadmin@thaotrangq6.com
-- trên Supabase Dashboard > Authentication > Users > Add user
-- ============================================================


-- BLOCK 3: Gán role super_admin vào ttq6_profiles
INSERT INTO public.ttq6_profiles (id, username, role, full_name)
SELECT
  id,
  'ttq6_sadmin',
  'super_admin',
  'Super Administrator'
FROM auth.users
WHERE email = 'ttq6_sadmin@thaotrangq6.com'
ON CONFLICT (id) DO UPDATE
  SET role      = 'super_admin',
      username  = 'ttq6_sadmin';


-- BLOCK 4: Enable RLS trên ttq6_profiles
ALTER TABLE public.ttq6_profiles ENABLE ROW LEVEL SECURITY;

-- Ai cũng đọc được profile của chính mình
CREATE POLICY "ttq6_profiles_select_own"
  ON public.ttq6_profiles FOR SELECT
  USING (auth.uid() = id);

-- Super admin đọc được tất cả profiles
CREATE POLICY "ttq6_profiles_select_sadmin"
  ON public.ttq6_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ttq6_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Super admin update được tất cả profiles
CREATE POLICY "ttq6_profiles_update_sadmin"
  ON public.ttq6_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ttq6_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );


-- BLOCK 5: Helper functions
CREATE OR REPLACE FUNCTION public.ttq6_get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.ttq6_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ttq6_is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ttq6_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- BLOCK 6: Kiểm tra kết quả
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.role
FROM auth.users u
LEFT JOIN public.ttq6_profiles p ON p.id = u.id
WHERE u.email = 'ttq6_sadmin@ttq6.local';
