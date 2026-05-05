-- ============================================================
-- TTQ6 - FIX RLS infinite recursion trên ttq6_profiles
-- Nguyên nhân: policy gọi lại chính bảng đang được protect
-- Giải pháp: lưu role vào user_metadata, đọc từ JWT
-- ============================================================

-- Bước 1: Xóa các policy cũ bị lỗi trên ttq6_profiles
DROP POLICY IF EXISTS "ttq6_profiles_select_own"    ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_update_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_staff"  ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_insert"        ON public.ttq6_profiles;

-- Bước 2: Tạo lại policy KHÔNG query lại ttq6_profiles
-- Ai cũng đọc được profile của chính mình
CREATE POLICY "ttq6_profiles_select_own"
  ON public.ttq6_profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff trở lên đọc được tất cả profiles (đọc role từ JWT, không query lại bảng)
CREATE POLICY "ttq6_profiles_select_staff"
  ON public.ttq6_profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'admin', 'staff')
  );

-- Super admin update tất cả profiles
CREATE POLICY "ttq6_profiles_update_sadmin"
  ON public.ttq6_profiles FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Cho phép insert profile mới (tự đăng ký)
CREATE POLICY "ttq6_profiles_insert"
  ON public.ttq6_profiles FOR INSERT
  WITH CHECK (true);

-- Bước 3: Cập nhật user_metadata của super admin với role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'ttq6_sadmin@thaotrangq6.com';

-- Bước 4: Fix function ttq6_is_super_admin() đọc từ JWT thay vì query bảng
CREATE OR REPLACE FUNCTION public.ttq6_is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ttq6_get_my_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'user_metadata' ->> 'role';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Bước 5: Fix các policy khác cũng đang dùng ttq6_is_super_admin() — giờ đã an toàn vì đọc JWT
-- (Không cần thay đổi, function đã được cập nhật)

-- Kiểm tra kết quả
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'ttq6_sadmin@thaotrangq6.com';
