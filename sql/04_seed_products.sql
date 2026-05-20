-- SQL Script to seed categories and products matching the homepage mockups
-- Project Reference: jhebreoxwuimlqwvjdok

BEGIN;

-- 1. Insert categories
INSERT INTO ttq6_product_categories (name, slug, sort_order)
VALUES 
  ('Vợt Cầu Lông', 'vot-cau-long', 1),
  ('Quả Cầu Lông', 'qua-cau-long', 2),
  ('Phụ Kiện Cầu Lông', 'phu-kien-cau-long', 3),
  ('Giày Cầu Lông', 'giay-cau-long', 4);

-- 2. Insert products referencing the generated category UUIDs
INSERT INTO ttq6_products (name, slug, description, price, stock, category_id, brand, tag, is_featured, status)
VALUES
  (
    'Vợt Yonex Astrox 88D', 
    'vot-yonex-astrox-88d', 
    'Vợt cầu lông Yonex Astrox 88D cao cấp hỗ trợ tấn công mạnh mẽ, độ đàn hồi cao, kiến tạo những cú smash cực mạnh.', 
    4500000, 
    50, 
    (SELECT id FROM ttq6_product_categories WHERE slug = 'vot-cau-long' LIMIT 1), 
    'Yonex', 
    'New', 
    true, 
    'active'
  ),
  (
    'Cầu Hải Yến S90', 
    'cau-hai-yen-s90', 
    'Hộp quả cầu lông Hải Yến S90 chính hãng, tiêu chuẩn thi đấu chuyên nghiệp, đường bay ổn định và độ bền vượt trội.', 
    250000, 
    200, 
    (SELECT id FROM ttq6_product_categories WHERE slug = 'qua-cau-long' LIMIT 1), 
    'Hải Yến', 
    'Hot', 
    true, 
    'active'
  ),
  (
    'Quấn cán Yonex AC102EX', 
    'quan-can-yonex-ac102ex', 
    'Quấn cán vợt cầu lông Yonex AC102EX siêu êm, bám tay tốt, thấm hút mồ hôi cực tốt, bảo vệ cán vợt hiệu quả.', 
    30000, 
    1000, 
    (SELECT id FROM ttq6_product_categories WHERE slug = 'phu-kien-cau-long' LIMIT 1), 
    'Yonex', 
    'Best Seller', 
    true, 
    'active'
  ),
  (
    'Giày Victor SH-P9200', 
    'giay-victor-sh-p9200', 
    'Giày cầu lông Victor SH-P9200 chuyên dụng, đệm giảm chấn hấp thụ rung động cực tốt, đế cao su chống trượt bám sân tối ưu.', 
    2100000, 
    30, 
    (SELECT id FROM ttq6_product_categories WHERE slug = 'giay-cau-long' LIMIT 1), 
    'Victor', 
    '-10%', 
    true, 
    'active'
  );

COMMIT;
