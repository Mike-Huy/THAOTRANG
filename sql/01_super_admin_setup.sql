-- ============================================================
-- TTQ6 - SUPER ADMIN SETUP
-- Chạy tuần tự từng BLOCK trong Supabase SQL Editor
-- ============================================================


-- ============================================================
-- BLOCK 1: Tạo bảng ttq6_profiles (lưu role của user)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('super_admin', 'admin', 'staff', 'customer')),
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.ttq6_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ttq6_profiles_updated_at
  BEFORE UPDATE ON public.ttq6_profiles
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

-- Tự động tạo profile khi user đăng ký mới
CREATE OR REPLACE FUNCTION public.ttq6_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ttq6_profiles (id, username, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER ttq6_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_handle_new_user();


-- ============================================================
-- BLOCK 2: Tạo user super admin trong auth.users
-- ============================================================

-- Tạo user qua hàm auth của Supabase (bypass email confirmation)
SELECT auth.create_user(
  '{"email": "ttq6_sadmin@thaotrangq6.com", "password": "admin123", "email_confirm": true}'::jsonb
);


-- ============================================================
-- BLOCK 3: Gán role super_admin vào ttq6_profiles
-- ============================================================

INSERT INTO public.ttq6_profiles (id, username, role, full_name)
SELECT
  id,
  'ttq6_sadmin',
  'super_admin',
  'Super Administrator'
FROM auth.users
WHERE email = 'ttq6_sadmin@thaotrangq6.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      username = 'ttq6_sadmin';


-- ============================================================
-- BLOCK 4: Enable RLS trên ttq6_profiles
-- ============================================================

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


-- ============================================================
-- BLOCK 5: Helper function — kiểm tra role (dùng trong code)
-- ============================================================

-- Trả về role của user hiện tại
CREATE OR REPLACE FUNCTION public.ttq6_get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.ttq6_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kiểm tra có phải super_admin không (dùng trong RLS policies)
CREATE OR REPLACE FUNCTION public.ttq6_is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ttq6_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- BLOCK 6: Kiểm tra kết quả
-- ============================================================

-- Xem user vừa tạo
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.role
FROM auth.users u
LEFT JOIN public.ttq6_profiles p ON p.id = u.id
WHERE u.email = 'ttq6_sadmin@thaotrangq6.com';
