-- ============================================================
-- TTQ6 - FIX CORRUPT home_gallery DATA
-- Giá trị bị corrupt: [object Object],[object Object],[object Object]
-- Nguyên nhân: JavaScript gọi String() trên array thay vì JSON.stringify()
-- ============================================================

-- Bước 1: Kiểm tra giá trị hiện tại
SELECT key, type, value FROM public.ttq6_settings WHERE key = 'home_gallery';

-- Bước 2: Reset home_gallery về JSON hợp lệ (ảnh để trống, user sẽ upload lại qua admin)
UPDATE public.ttq6_settings
SET
  value = '[{"title":"Giải đấu chuyên nghiệp","image_url":""},{"title":"Luyện tập hàng ngày","image_url":""},{"title":"Cộng đồng badminton","image_url":""}]',
  type  = 'json',
  updated_at = NOW()
WHERE key = 'home_gallery';

-- Bước 3: Xác nhận
SELECT key, type, value FROM public.ttq6_settings WHERE key = 'home_gallery';
