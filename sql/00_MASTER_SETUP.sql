-- ============================================================
-- TTQ6 - MASTER SETUP (chạy một lần, an toàn để chạy lại)
-- Dự án: Thảo Trang Badminton — Supabase: jhebreoxwuimlqwvjdok
-- Thứ tự: Profiles → Functions/RLS → 7 modules → Settings → Seed
-- ============================================================


-- ============================================================
-- PHẦN 1: BẢNG ttq6_profiles + TRIGGER + HELPER FUNCTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('super_admin', 'admin', 'staff', 'customer')),
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  banned_at   TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE FUNCTION public.ttq6_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ttq6_profiles_updated_at ON public.ttq6_profiles;
CREATE TRIGGER ttq6_profiles_updated_at
  BEFORE UPDATE ON public.ttq6_profiles
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

-- Trigger tự tạo profile khi user đăng ký mới
-- Role luôn là 'customer' — admin gán role cao hơn qua dashboard
CREATE OR REPLACE FUNCTION public.ttq6_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ttq6_profiles (id, username, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ttq6_on_auth_user_created ON auth.users;
CREATE TRIGGER ttq6_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_handle_new_user();

-- Helper functions (SECURITY DEFINER = bỏ qua RLS, không bị infinite recursion)
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

CREATE OR REPLACE FUNCTION public.ttq6_is_staff_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ttq6_profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'staff')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- PHẦN 2: RLS — ttq6_profiles
-- ============================================================

ALTER TABLE public.ttq6_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_profiles_select_own"    ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_staff"  ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_select_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_update_sadmin" ON public.ttq6_profiles;
DROP POLICY IF EXISTS "ttq6_profiles_insert"        ON public.ttq6_profiles;

CREATE POLICY "ttq6_profiles_select_own"
  ON public.ttq6_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "ttq6_profiles_select_staff"
  ON public.ttq6_profiles FOR SELECT
  USING (public.ttq6_is_staff_or_above());

CREATE POLICY "ttq6_profiles_update_sadmin"
  ON public.ttq6_profiles FOR UPDATE
  USING (public.ttq6_is_super_admin());

CREATE POLICY "ttq6_profiles_insert"
  ON public.ttq6_profiles FOR INSERT
  WITH CHECK (
    id = auth.uid() AND role = 'customer'
  );


-- ============================================================
-- PHẦN 3: MODULE BÀI ĐĂNG / TIN TỨC
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'news'
                 CHECK (category IN ('news', 'event', 'promotion', 'guide')),
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'published', 'archived')),
  author_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ttq6_posts_updated_at ON public.ttq6_posts;
CREATE TRIGGER ttq6_posts_updated_at
  BEFORE UPDATE ON public.ttq6_posts
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_posts_status   ON public.ttq6_posts(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_posts_category ON public.ttq6_posts(category);
CREATE INDEX IF NOT EXISTS idx_ttq6_posts_slug     ON public.ttq6_posts(slug);

ALTER TABLE public.ttq6_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_posts_public_read" ON public.ttq6_posts;
DROP POLICY IF EXISTS "ttq6_posts_admin_all"   ON public.ttq6_posts;

CREATE POLICY "ttq6_posts_public_read"
  ON public.ttq6_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "ttq6_posts_admin_all"
  ON public.ttq6_posts FOR ALL
  USING (public.ttq6_is_staff_or_above());


-- ============================================================
-- PHẦN 4: MODULE SẢN PHẨM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_product_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ttq6_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  price         NUMERIC(12,0) NOT NULL DEFAULT 0,
  price_sale    NUMERIC(12,0),
  stock         INT NOT NULL DEFAULT 0,
  cover_url     TEXT,
  images        TEXT[] DEFAULT '{}',
  category_id   UUID REFERENCES public.ttq6_product_categories(id) ON DELETE SET NULL,
  brand         TEXT,
  tag           TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ttq6_products_updated_at ON public.ttq6_products;
CREATE TRIGGER ttq6_products_updated_at
  BEFORE UPDATE ON public.ttq6_products
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_products_status      ON public.ttq6_products(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_products_category_id ON public.ttq6_products(category_id);
CREATE INDEX IF NOT EXISTS idx_ttq6_products_featured    ON public.ttq6_products(is_featured);

ALTER TABLE public.ttq6_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_products           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_product_categories_public_read" ON public.ttq6_product_categories;
DROP POLICY IF EXISTS "ttq6_product_categories_admin_all"   ON public.ttq6_product_categories;
DROP POLICY IF EXISTS "ttq6_products_public_read"           ON public.ttq6_products;
DROP POLICY IF EXISTS "ttq6_products_admin_all"             ON public.ttq6_products;

CREATE POLICY "ttq6_product_categories_public_read"
  ON public.ttq6_product_categories FOR SELECT USING (true);

CREATE POLICY "ttq6_product_categories_admin_all"
  ON public.ttq6_product_categories FOR ALL
  USING (public.ttq6_is_staff_or_above());

CREATE POLICY "ttq6_products_public_read"
  ON public.ttq6_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "ttq6_products_admin_all"
  ON public.ttq6_products FOR ALL
  USING (public.ttq6_is_staff_or_above());


-- ============================================================
-- PHẦN 5: MODULE ĐẶT SÂN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_courts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  price_per_hour NUMERIC(12,0) NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ttq6_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id        UUID NOT NULL REFERENCES public.ttq6_courts(id) ON DELETE RESTRICT,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booker_name     TEXT NOT NULL,
  booker_phone    TEXT NOT NULL,
  booker_email    TEXT,
  date            DATE NOT NULL,
  time_start      TIME NOT NULL,
  time_end        TIME NOT NULL,
  duration_hours  NUMERIC(4,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (time_end - time_start)) / 3600
  ) STORED,
  total_price     NUMERIC(12,0) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes           TEXT,
  confirmed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ttq6_bookings_updated_at ON public.ttq6_bookings;
CREATE TRIGGER ttq6_bookings_updated_at
  BEFORE UPDATE ON public.ttq6_bookings
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_date     ON public.ttq6_bookings(date);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_court_id ON public.ttq6_bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_status   ON public.ttq6_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_user_id  ON public.ttq6_bookings(user_id);

ALTER TABLE public.ttq6_courts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_courts_public_read"        ON public.ttq6_courts;
DROP POLICY IF EXISTS "ttq6_courts_admin_all"           ON public.ttq6_courts;
DROP POLICY IF EXISTS "ttq6_bookings_select_own"        ON public.ttq6_bookings;
DROP POLICY IF EXISTS "ttq6_bookings_insert_public"     ON public.ttq6_bookings;
DROP POLICY IF EXISTS "ttq6_bookings_admin_all"         ON public.ttq6_bookings;

CREATE POLICY "ttq6_courts_public_read"
  ON public.ttq6_courts FOR SELECT
  USING (is_active = true);

CREATE POLICY "ttq6_courts_admin_all"
  ON public.ttq6_courts FOR ALL
  USING (public.ttq6_is_staff_or_above());

CREATE POLICY "ttq6_bookings_select_own"
  ON public.ttq6_bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ttq6_bookings_insert_public"
  ON public.ttq6_bookings FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "ttq6_bookings_admin_all"
  ON public.ttq6_bookings FOR ALL
  USING (public.ttq6_is_staff_or_above());


-- ============================================================
-- PHẦN 6: MODULE HOẠT ĐỘNG / SỰ KIỆN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_activities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,
  description          TEXT,
  content              TEXT,
  cover_url            TEXT,
  type                 TEXT NOT NULL DEFAULT 'tournament'
                         CHECK (type IN ('tournament', 'training', 'community', 'other')),
  status               TEXT NOT NULL DEFAULT 'upcoming'
                         CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  start_date           TIMESTAMPTZ,
  end_date             TIMESTAMPTZ,
  location             TEXT,
  max_participants     INT,
  current_participants INT NOT NULL DEFAULT 0,
  fee                  NUMERIC(12,0) NOT NULL DEFAULT 0,
  author_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ttq6_activities_updated_at ON public.ttq6_activities;
CREATE TRIGGER ttq6_activities_updated_at
  BEFORE UPDATE ON public.ttq6_activities
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_activities_status ON public.ttq6_activities(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_activities_type   ON public.ttq6_activities(type);

ALTER TABLE public.ttq6_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_activities_public_read" ON public.ttq6_activities;
DROP POLICY IF EXISTS "ttq6_activities_admin_all"   ON public.ttq6_activities;

CREATE POLICY "ttq6_activities_public_read"
  ON public.ttq6_activities FOR SELECT
  USING (status != 'cancelled');

CREATE POLICY "ttq6_activities_admin_all"
  ON public.ttq6_activities FOR ALL
  USING (public.ttq6_is_staff_or_above());


-- ============================================================
-- PHẦN 7: MODULE LIÊN HỆ
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'unread'
               CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  reply      TEXT,
  replied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ttq6_contacts_status ON public.ttq6_contacts(status);

ALTER TABLE public.ttq6_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_contacts_insert_public" ON public.ttq6_contacts;
DROP POLICY IF EXISTS "ttq6_contacts_admin_all"     ON public.ttq6_contacts;

CREATE POLICY "ttq6_contacts_insert_public"
  ON public.ttq6_contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "ttq6_contacts_admin_all"
  ON public.ttq6_contacts FOR ALL
  USING (public.ttq6_is_staff_or_above());


-- ============================================================
-- PHẦN 8: MODULE CÀI ĐẶT WEBSITE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_settings (
  key           TEXT PRIMARY KEY,
  value         TEXT,
  type          TEXT NOT NULL DEFAULT 'string'
                  CHECK (type IN ('string', 'number', 'boolean', 'json')),
  setting_group TEXT NOT NULL DEFAULT 'general',
  label         TEXT,
  updated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ttq6_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttq6_settings_public_read"  ON public.ttq6_settings;
DROP POLICY IF EXISTS "ttq6_settings_sadmin_write" ON public.ttq6_settings;

CREATE POLICY "ttq6_settings_public_read"
  ON public.ttq6_settings FOR SELECT
  USING (true);

CREATE POLICY "ttq6_settings_sadmin_write"
  ON public.ttq6_settings FOR ALL
  USING (public.ttq6_is_super_admin());

-- Seed settings mặc định
INSERT INTO public.ttq6_settings (key, value, type, setting_group, label) VALUES
  -- General
  ('site_name',              'Thảo Trang Badminton',                               'string', 'general',  'Tên website'),
  ('site_tagline',           'Hệ thống sân cầu lông đẳng cấp quốc tế',            'string', 'general',  'Slogan'),
  ('site_logo_url',          '',                                                   'string', 'general',  'URL Logo'),
  ('site_favicon_url',       '',                                                   'string', 'general',  'URL Favicon'),
  -- Contact
  ('contact_email',          'info@thaotrangq6.com',                               'string', 'contact',  'Email liên hệ'),
  ('contact_phone',          '',                                                   'string', 'contact',  'Số điện thoại'),
  ('contact_hotline',        '',                                                   'string', 'contact',  'Hotline'),
  ('contact_address',        '',                                                   'string', 'contact',  'Địa chỉ'),
  ('contact_map_url',        '',                                                   'string', 'contact',  'Link Google Maps'),
  -- Social
  ('social_facebook',        '',                                                   'string', 'social',   'Facebook URL'),
  ('social_youtube',         '',                                                   'string', 'social',   'YouTube URL'),
  ('social_zalo',            '',                                                   'string', 'social',   'Zalo'),
  ('social_tiktok',          '',                                                   'string', 'social',   'TikTok URL'),
  -- Business
  ('business_hours',         'Thứ 2 - Chủ nhật: 06:00 - 22:00',                  'string', 'business', 'Giờ hoạt động'),
  ('booking_open_days',      '7',                                                  'number', 'business', 'Đặt sân trước tối đa (ngày)'),
  ('booking_min_hours',      '1',                                                  'number', 'business', 'Số giờ đặt tối thiểu'),
  -- SEO
  ('seo_description',        'Thảo Trang Badminton cung cấp hệ thống sân cầu lông chuyên nghiệp.', 'string', 'seo', 'Meta description'),
  ('seo_keywords',           'cầu lông, sân cầu lông, badminton, quận 6',         'string', 'seo',      'Meta keywords'),
  -- Home: Hero
  ('home_hero_title',        'NÂNG TẦM ĐAM MÊ CẦU LÔNG',                        'string', 'home',     'Tiêu đề Hero'),
  ('home_hero_subtitle',     'Hệ thống sân bãi đạt chuẩn quốc tế cùng đội ngũ huấn luyện viên chuyên nghiệp hàng đầu Việt Nam.', 'string', 'home', 'Mô tả Hero'),
  ('home_hero_image_url',    '',                                                   'string', 'home',     'URL ảnh nền Hero'),
  -- Home: Stats
  ('home_stats_students',    '500+',                                               'string', 'home',     'Số học viên'),
  ('home_stats_tournaments', '12',                                                 'string', 'home',     'Số giải đấu/năm'),
  ('home_stats_courts',      '9',                                                  'string', 'home',     'Số sân đạt chuẩn'),
  -- Home: Partners
  ('home_partners',          '["Yonex","Victor","Li-Ning","Forza","Mizuno"]',      'json',   'home',     'Đối tác chiến lược'),
  -- Home: Gallery
  ('home_gallery',           '[{"title":"Giải đấu chuyên nghiệp","image_url":""},{"title":"Luyện tập hàng ngày","image_url":""},{"title":"Cộng đồng badminton","image_url":""}]', 'json', 'home', 'Hoạt động tại sân (Gallery)'),
  -- Home: Why Us
  ('home_why_us',            '[{"title":"Sân Chuẩn BWF","desc":"Mặt sân thảm Yonex cao cấp, đèn chiếu sáng chuyên nghiệp, đạt tiêu chuẩn thi đấu quốc tế."},{"title":"HLV Chuyên Nghiệp","desc":"Đội ngũ huấn luyện viên cấp quốc gia, có kinh nghiệm thi đấu chuyên nghiệp nhiều năm."},{"title":"Đặt Sân Online 24/7","desc":"Hệ thống đặt sân trực tuyến thông minh, quản lý lịch chơi dễ dàng, nhanh chóng và tiện lợi."}]', 'json', 'home', 'Lý do chọn (Trang chủ)'),
  -- About
  ('about_title',            'THAOTRANG GROUP - ĐA NGÀNH NGHỀ, TRỌN NIỀM TIN',   'string', 'about',    'Tiêu đề Giới thiệu'),
  ('about_description_p1',   'Được hình thành từ niềm đam mê mãnh liệt với môn cầu lông, ThaoTrang Group đã không ngừng phát triển để trở thành một tập đoàn đa ngành vững mạnh.', 'string', 'about', 'Đoạn giới thiệu 1'),
  ('about_description_p2',   'Với phương châm "Khách hàng là trọng tâm", mỗi dịch vụ của chúng tôi đều hướng tới sự hoàn mỹ, sang trọng và đẳng cấp quốc tế.', 'string', 'about', 'Đoạn giới thiệu 2'),
  ('about_image_url',        '/images/badminton_about.png', 'string', 'about', 'URL ảnh giới thiệu'),
  ('about_mission_title',    'Sứ mệnh',                                            'string', 'about',    'Tiêu đề Sứ mệnh'),
  ('about_mission_desc',     'Xây dựng môi trường thể thao lành mạnh, chuyên nghiệp và đẳng cấp cho mọi lứa tuổi.', 'string', 'about', 'Nội dung Sứ mệnh'),
  ('about_vision_title',     'Tầm nhìn',                                           'string', 'about',    'Tiêu đề Tầm nhìn'),
  ('about_vision_desc',      'Trở thành chuỗi trung tâm cầu lông hàng đầu khu vực với chất lượng dịch vụ chuẩn quốc tế.', 'string', 'about', 'Nội dung Tầm nhìn'),
  ('about_values_title',     'Giá trị cốt lõi',                                   'string', 'about',    'Tiêu đề Giá trị cốt lõi'),
  ('about_values_desc',      'Chuyên nghiệp - Tận tâm - Sáng tạo - Kết nối cộng đồng yêu thể thao.', 'string', 'about', 'Nội dung Giá trị cốt lõi'),
  ('about_milestones',       '[{"year":"2015","title":"Thành lập","desc":"Khởi đầu với khát vọng xây dựng hệ sinh thái thể thao chuyên nghiệp."},{"year":"2018","title":"Mở rộng đa ngành","desc":"Phát triển sang lĩnh vực thương mại phụ kiện và đào tạo học viên."},{"year":"2021","title":"Hệ thống 5 cơ sở","desc":"Trở thành đơn vị dẫn đầu về số lượng và chất lượng sân bãi tại TP.HCM."},{"year":"2024","title":"Vươn tầm quốc tế","desc":"Đạt chứng chỉ chuẩn quốc tế BWF và đăng cai các giải đấu mở rộng."},{"year":"2026","title":"Đổi mới công nghệ","desc":"Số hóa toàn bộ quy trình vận hành và chăm sóc khách hàng."}]', 'json', 'about', 'Hành trình phát triển'),
  ('about_why_us',           '[{"title":"Chất lượng hàng đầu","desc":"Hệ thống sân bãi đạt tiêu chuẩn thi đấu quốc tế, thảm sàn cao cấp chống chấn thương."},{"title":"Dịch vụ đẳng cấp","desc":"Đội ngũ nhân viên chuyên nghiệp, tận tâm và hệ thống tiện ích đi kèm đa dạng."},{"title":"Cộng đồng văn minh","desc":"Nơi giao lưu của những người yêu thể thao chân chính và các doanh nhân thành đạt."}]', 'json', 'about', 'Lý do chọn (Trang giới thiệu)')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- PHẦN 9: SEED SẢN PHẨM MẪU (chỉ chạy khi bảng còn rỗng)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ttq6_product_categories LIMIT 1) THEN
    INSERT INTO public.ttq6_product_categories (name, slug, sort_order) VALUES
      ('Vợt Cầu Lông',    'vot-cau-long',        1),
      ('Quả Cầu Lông',    'qua-cau-long',         2),
      ('Phụ Kiện Cầu Lông','phu-kien-cau-long',   3),
      ('Giày Cầu Lông',   'giay-cau-long',        4);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ttq6_products LIMIT 1) THEN
    INSERT INTO public.ttq6_products (name, slug, description, price, stock, category_id, brand, tag, is_featured, status) VALUES
      ('Vợt Yonex Astrox 88D', 'vot-yonex-astrox-88d',
       'Vợt cầu lông Yonex Astrox 88D cao cấp hỗ trợ tấn công mạnh mẽ.',
       4500000, 50,
       (SELECT id FROM ttq6_product_categories WHERE slug = 'vot-cau-long' LIMIT 1),
       'Yonex', 'New', true, 'active'),
      ('Cầu Hải Yến S90', 'cau-hai-yen-s90',
       'Hộp quả cầu lông Hải Yến S90 chính hãng, tiêu chuẩn thi đấu chuyên nghiệp.',
       250000, 200,
       (SELECT id FROM ttq6_product_categories WHERE slug = 'qua-cau-long' LIMIT 1),
       'Hải Yến', 'Hot', true, 'active'),
      ('Quấn cán Yonex AC102EX', 'quan-can-yonex-ac102ex',
       'Quấn cán vợt siêu êm, bám tay tốt, thấm hút mồ hôi tốt.',
       30000, 1000,
       (SELECT id FROM ttq6_product_categories WHERE slug = 'phu-kien-cau-long' LIMIT 1),
       'Yonex', 'Best Seller', true, 'active'),
      ('Giày Victor SH-P9200', 'giay-victor-sh-p9200',
       'Giày cầu lông Victor SH-P9200 chuyên dụng, đệm giảm chấn tốt, chống trượt.',
       2100000, 30,
       (SELECT id FROM ttq6_product_categories WHERE slug = 'giay-cau-long' LIMIT 1),
       'Victor', '-10%', true, 'active');
  END IF;
END;
$$;


-- ============================================================
-- PHẦN 10: SEED SÂN MẪU (chỉ chạy khi bảng còn rỗng)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ttq6_courts LIMIT 1) THEN
    INSERT INTO public.ttq6_courts (name, description, price_per_hour, is_active, sort_order) VALUES
      ('Sân 1', 'Sân cầu lông tiêu chuẩn BWF, mặt sàn thảm Yonex', 100000, true, 1),
      ('Sân 2', 'Sân cầu lông tiêu chuẩn BWF, mặt sàn thảm Yonex', 100000, true, 2),
      ('Sân 3', 'Sân cầu lông tiêu chuẩn BWF, mặt sàn thảm Yonex', 100000, true, 3),
      ('Sân VIP', 'Sân VIP với hệ thống âm thanh và chiếu sáng cao cấp', 150000, true, 4);
  END IF;
END;
$$;


-- ============================================================
-- PHẦN 11: STORAGE — BUCKET "thaotrang"
-- Chạy lệnh này trên Supabase SQL Editor hoặc cài qua Dashboard
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thaotrang',
  'thaotrang',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760;

-- Storage RLS: ai cũng xem được, chỉ admin mới upload/xóa
DROP POLICY IF EXISTS "thaotrang_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "thaotrang_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "thaotrang_admin_delete" ON storage.objects;

CREATE POLICY "thaotrang_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thaotrang');

CREATE POLICY "thaotrang_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thaotrang'
    AND public.ttq6_is_staff_or_above()
  );

CREATE POLICY "thaotrang_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thaotrang'
    AND public.ttq6_is_staff_or_above()
  );


-- ============================================================
-- KIỂM TRA KẾT QUẢ CUỐI CÙNG
-- ============================================================

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'ttq6_%'
ORDER BY table_name;
