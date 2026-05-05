-- ============================================================
-- TTQ6 - ADMIN SCHEMA (7 modules)
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================


-- ============================================================
-- MODULE 1: USERS (đã có ttq6_profiles, bổ sung thêm)
-- ============================================================

ALTER TABLE public.ttq6_profiles
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url  TEXT,
  ADD COLUMN IF NOT EXISTS is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes       TEXT;


-- ============================================================
-- MODULE 2: BÀI ĐĂNG / TIN TỨC
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

CREATE TRIGGER ttq6_posts_updated_at
  BEFORE UPDATE ON public.ttq6_posts
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_posts_status   ON public.ttq6_posts(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_posts_category ON public.ttq6_posts(category);
CREATE INDEX IF NOT EXISTS idx_ttq6_posts_slug     ON public.ttq6_posts(slug);


-- ============================================================
-- MODULE 3: SẢN PHẨM
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

CREATE TRIGGER ttq6_products_updated_at
  BEFORE UPDATE ON public.ttq6_products
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_products_status      ON public.ttq6_products(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_products_category_id ON public.ttq6_products(category_id);
CREATE INDEX IF NOT EXISTS idx_ttq6_products_featured    ON public.ttq6_products(is_featured);


-- ============================================================
-- MODULE 4: ĐẶT SÂN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_courts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price_per_hour NUMERIC(12,0) NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ttq6_bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id     UUID NOT NULL REFERENCES public.ttq6_courts(id) ON DELETE RESTRICT,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booker_name  TEXT NOT NULL,
  booker_phone TEXT NOT NULL,
  booker_email TEXT,
  date         DATE NOT NULL,
  time_start   TIME NOT NULL,
  time_end     TIME NOT NULL,
  duration_hours NUMERIC(4,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (time_end - time_start)) / 3600
  ) STORED,
  total_price  NUMERIC(12,0) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes        TEXT,
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER ttq6_bookings_updated_at
  BEFORE UPDATE ON public.ttq6_bookings
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_date     ON public.ttq6_bookings(date);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_court_id ON public.ttq6_bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_status   ON public.ttq6_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_bookings_user_id  ON public.ttq6_bookings(user_id);


-- ============================================================
-- MODULE 5: HOẠT ĐỘNG / SỰ KIỆN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  content      TEXT,
  cover_url    TEXT,
  type         TEXT NOT NULL DEFAULT 'tournament'
                 CHECK (type IN ('tournament', 'training', 'community', 'other')),
  status       TEXT NOT NULL DEFAULT 'upcoming'
                 CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  start_date   TIMESTAMPTZ,
  end_date     TIMESTAMPTZ,
  location     TEXT,
  max_participants INT,
  current_participants INT NOT NULL DEFAULT 0,
  fee          NUMERIC(12,0) NOT NULL DEFAULT 0,
  author_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER ttq6_activities_updated_at
  BEFORE UPDATE ON public.ttq6_activities
  FOR EACH ROW EXECUTE FUNCTION public.ttq6_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_ttq6_activities_status ON public.ttq6_activities(status);
CREATE INDEX IF NOT EXISTS idx_ttq6_activities_type   ON public.ttq6_activities(type);


-- ============================================================
-- MODULE 6: LIÊN HỆ
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


-- ============================================================
-- MODULE 7: CÀI ĐẶT WEBSITE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ttq6_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  type       TEXT NOT NULL DEFAULT 'string'
               CHECK (type IN ('string', 'number', 'boolean', 'json')),
  setting_group TEXT NOT NULL DEFAULT 'general',
  label      TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed dữ liệu mặc định cho Settings
INSERT INTO public.ttq6_settings (key, value, type, setting_group, label) VALUES
  -- General
  ('site_name',        'Thảo Trang Badminton',         'string',  'general',  'Tên website'),
  ('site_tagline',     'Hệ thống sân cầu lông đẳng cấp quốc tế', 'string', 'general', 'Slogan'),
  ('site_logo_url',    '',                              'string',  'general',  'URL Logo'),
  ('site_favicon_url', '',                              'string',  'general',  'URL Favicon'),
  -- Contact
  ('contact_email',    'info@thaotrangq6.com',          'string',  'contact',  'Email liên hệ'),
  ('contact_phone',    '',                              'string',  'contact',  'Số điện thoại'),
  ('contact_hotline',  '',                              'string',  'contact',  'Hotline'),
  ('contact_address',  '',                              'string',  'contact',  'Địa chỉ'),
  ('contact_map_url',  '',                              'string',  'contact',  'Link Google Maps'),
  -- Social
  ('social_facebook',  '',                              'string',  'social',   'Facebook URL'),
  ('social_youtube',   '',                              'string',  'social',   'YouTube URL'),
  ('social_zalo',      '',                              'string',  'social',   'Zalo'),
  ('social_tiktok',    '',                              'string',  'social',   'TikTok URL'),
  -- Business
  ('business_hours',   'Thứ 2 - Chủ nhật: 06:00 - 22:00', 'string', 'business', 'Giờ hoạt động'),
  ('booking_open_days','7',                             'number',  'business', 'Đặt sân trước tối đa (ngày)'),
  ('booking_min_hours','1',                             'number',  'business', 'Số giờ đặt tối thiểu'),
  -- SEO
  ('seo_description',  'Thảo Trang Badminton cung cấp hệ thống sân cầu lông chuyên nghiệp.', 'string', 'seo', 'Meta description'),
  ('seo_keywords',     'cầu lông, sân cầu lông, badminton, quận 6', 'string', 'seo', 'Meta keywords')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- RLS POLICIES — Tất cả các bảng mới
-- ============================================================

-- Enable RLS
ALTER TABLE public.ttq6_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_courts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_contacts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttq6_settings           ENABLE ROW LEVEL SECURITY;

-- ── POSTS ──
CREATE POLICY "ttq6_posts_public_read"
  ON public.ttq6_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "ttq6_posts_admin_all"
  ON public.ttq6_posts FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── PRODUCT CATEGORIES ──
CREATE POLICY "ttq6_product_categories_public_read"
  ON public.ttq6_product_categories FOR SELECT USING (true);

CREATE POLICY "ttq6_product_categories_admin_all"
  ON public.ttq6_product_categories FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── PRODUCTS ──
CREATE POLICY "ttq6_products_public_read"
  ON public.ttq6_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "ttq6_products_admin_all"
  ON public.ttq6_products FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── COURTS ──
CREATE POLICY "ttq6_courts_public_read"
  ON public.ttq6_courts FOR SELECT
  USING (is_active = true);

CREATE POLICY "ttq6_courts_admin_all"
  ON public.ttq6_courts FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── BOOKINGS ──
-- User xem booking của chính mình
CREATE POLICY "ttq6_bookings_select_own"
  ON public.ttq6_bookings FOR SELECT
  USING (user_id = auth.uid());

-- Guest đặt sân không cần đăng nhập (INSERT)
CREATE POLICY "ttq6_bookings_insert_public"
  ON public.ttq6_bookings FOR INSERT
  WITH CHECK (true);

-- Admin xem và xử lý tất cả
CREATE POLICY "ttq6_bookings_admin_all"
  ON public.ttq6_bookings FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── ACTIVITIES ──
CREATE POLICY "ttq6_activities_public_read"
  ON public.ttq6_activities FOR SELECT
  USING (status != 'cancelled');

CREATE POLICY "ttq6_activities_admin_all"
  ON public.ttq6_activities FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── CONTACTS ──
-- Ai cũng gửi được liên hệ
CREATE POLICY "ttq6_contacts_insert_public"
  ON public.ttq6_contacts FOR INSERT
  WITH CHECK (true);

-- Chỉ admin đọc và xử lý
CREATE POLICY "ttq6_contacts_admin_all"
  ON public.ttq6_contacts FOR ALL
  USING (public.ttq6_is_super_admin() OR (
    EXISTS (SELECT 1 FROM public.ttq6_profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff'))
  ));

-- ── SETTINGS ──
-- Public đọc được settings (cần cho frontend hiển thị thông tin)
CREATE POLICY "ttq6_settings_public_read"
  ON public.ttq6_settings FOR SELECT
  USING (true);

-- Chỉ super_admin mới được sửa settings
CREATE POLICY "ttq6_settings_sadmin_write"
  ON public.ttq6_settings FOR ALL
  USING (public.ttq6_is_super_admin());


-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'ttq6_%'
ORDER BY table_name;
