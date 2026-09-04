-- ============================================================
-- TTQ6 - FIX SETTINGS TYPE
-- Sửa các settings bị lưu nhầm type='string' thay vì 'json'
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Tìm và sửa tất cả rows có value trông như JSON nhưng type='string'
UPDATE public.ttq6_settings
SET type = 'json'
WHERE type = 'string'
  AND (
    (value LIKE '[%' AND value LIKE '%]')  -- JSON array
    OR
    (value LIKE '{%' AND value LIKE '%}')  -- JSON object
  );

-- Kiểm tra kết quả
SELECT key, type, LEFT(value, 80) AS value_preview
FROM public.ttq6_settings
WHERE key IN (
  'home_gallery', 'home_partners', 'home_why_us',
  'about_milestones', 'about_why_us'
)
ORDER BY key;
