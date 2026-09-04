-- ============================================================
-- TTQ6 - SECURITY FIXES
-- Chạy toàn bộ file này trong Supabase SQL Editor
--
-- Vấn đề được fix:
-- 1. Trigger ttq6_handle_new_user đọc role từ user_metadata (user tự kiểm soát)
-- 2. ttq6_get_my_role() và ttq6_is_super_admin() đọc JWT thay vì DB
-- 3. RLS profiles dùng JWT user_metadata → bị bypass bằng signup trực tiếp
-- 4. ttq6_profiles INSERT: WITH CHECK (true) → ai cũng insert với role bất kỳ
-- 5. ttq6_bookings INSERT: không validate user_id → giả mạo danh tính người khác
-- ============================================================


-- ============================================================
-- BLOCK 1: Fix trigger — KHÔNG đọc role từ user_metadata
-- Role luôn là 'customer' khi tự đăng ký.
-- Việc gán role cao hơn do admin thực hiện qua trang quản trị.
-- ============================================================

CREATE OR REPLACE FUNCTION public.ttq6_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ttq6_profiles (id, username, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'customer',  -- luôn luôn customer, không tin user_metadata
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- BLOCK 2: Fix helper functions — đọc từ DB thay vì JWT
-- SECURITY DEFINER = chạy với quyền của owner (postgres),
-- bỏ qua RLS khi query ttq6_profiles → KHÔNG bị infinite recursion.
-- ============================================================

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

-- Helper mới: kiểm tra staff trở lên
CREATE OR REPLACE FUNCTION public.ttq6_is_staff_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ttq6_profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'staff')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- BLOCK 3: Fix RLS policies trên ttq6_profiles
-- Xóa các policy cũ (dùng JWT), tạo lại dùng SECURITY DEFINER functions.
-- SECURITY DEFINER functions truy vấn ttq6_profiles với quyền owner
-- → không trigger RLS của bảng → không bị infinite recursion.
-- ============================================================

DROP POLICY IF EXISTS "ttq6_profiles_select_own"    ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_staff"  ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_update_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_insert"        ON public.ttq6_profiles;

-- Mỗi user đọc được profile của chính mình
CREATE POLICY "ttq6_profiles_select_own"
  ON public.ttq6_profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff trở lên đọc được tất cả profiles
-- (dùng SECURITY DEFINER function, không query lại bảng trực tiếp)
CREATE POLICY "ttq6_profiles_select_staff"
  ON public.ttq6_profiles FOR SELECT
  USING (public.ttq6_is_staff_or_above());

-- Chỉ super_admin mới UPDATE được profiles (đổi role, ban user, v.v.)
CREATE POLICY "ttq6_profiles_update_sadmin"
  ON public.ttq6_profiles FOR UPDATE
  USING (public.ttq6_is_super_admin());

-- INSERT: chỉ được insert profile của chính mình, với role = 'customer'
-- (trigger ttq6_handle_new_user chạy với SECURITY DEFINER nên bypass policy này)
CREATE POLICY "ttq6_profiles_insert"
  ON public.ttq6_profiles FOR INSERT
  WITH CHECK (
    id = auth.uid() AND role = 'customer'
  );


-- ============================================================
-- BLOCK 4: Fix RLS policy ttq6_bookings INSERT
-- Trước: WITH CHECK (true) → user_id không được validate
-- Sau:   user_id phải là auth.uid() nếu đã đăng nhập,
--        hoặc NULL nếu là guest đặt sân không cần tài khoản.
-- ============================================================

DROP POLICY IF EXISTS "ttq6_bookings_insert_public" ON public.ttq6_bookings;

CREATE POLICY "ttq6_bookings_insert_public"
  ON public.ttq6_bookings FOR INSERT
  WITH CHECK (
    -- Guest chưa đăng nhập: user_id phải NULL
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    -- Đã đăng nhập: user_id phải là chính họ (không giả mạo người khác)
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );


-- ============================================================
-- BLOCK 5: Kiểm tra kết quả
-- ============================================================

-- Xem tất cả policies trên ttq6_profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ttq6_profiles'
ORDER BY policyname;

-- Xem policies trên ttq6_bookings
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ttq6_bookings'
ORDER BY policyname;

-- Kiểm tra functions
SELECT proname, prosecdef, prosrc
FROM pg_proc
WHERE proname IN ('ttq6_get_my_role', 'ttq6_is_super_admin', 'ttq6_is_staff_or_above', 'ttq6_handle_new_user')
  AND pronamespace = 'public'::regnamespace;
