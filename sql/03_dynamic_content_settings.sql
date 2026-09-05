-- ============================================================
-- TTQ6 - DYNAMIC CONTENT SETTINGS
-- Chạy toàn bộ file này trong Supabase SQL Editor cho dự án 'jhebreoxwuimlqwvjdok'
-- ============================================================

INSERT INTO public.ttq6_settings (key, value, type, setting_group, label) VALUES
  -- TRANG CHỦ: HERO SECTION
  ('home_hero_title',        'NÂNG TẦM ĐAM MÊ CẦU LÔNG',                             'string',  'home',  'Tiêu đề Hero'),
  ('home_hero_subtitle',     'Hệ thống sân bãi đạt chuẩn quốc tế cùng đội ngũ huấn luyện viên chuyên nghiệp hàng đầu Việt Nam.', 'string', 'home', 'Mô tả Hero'),
  ('home_hero_image_url',    '',                                                    'string',  'home',  'URL ảnh nền Hero'),
  
  -- TRANG CHỦ: FLOATING STATS
  ('home_stats_students',    '500+',                                                'string',  'home',  'Số học viên'),
  ('home_stats_tournaments', '12',                                                  'string',  'home',  'Số giải đấu/năm'),
  ('home_stats_courts',      '9',                                                   'string',  'home',  'Số sân đạt chuẩn'),

  -- TRANG CHỦ: PARTNERS (JSON array)
  ('home_partners',          '["Yonex", "Victor", "Li-Ning", "Forza", "Mizuno"]',    'json',    'home',  'Đối tác chiến lược'),

  -- TRANG CHỦ: GALLERY (JSON array)
  ('home_gallery',           '[{"title": "Giải đấu chuyên nghiệp", "image_url": ""}, {"title": "Luyện tập hàng ngày", "image_url": ""}, {"title": "Cộng đồng badminton", "image_url": ""}]', 'json', 'home', 'Hoạt động tại sân (Gallery)'),

  -- TRANG CHỦ: WHY CHOOSE US (JSON array)
  ('home_why_us',            '[{"title": "Sân Chuẩn BWF", "desc": "Mặt sân thảm Yonex cao cấp, đèn chiếu sáng chuyên nghiệp, đạt tiêu chuẩn thi đấu quốc tế."}, {"title": "HLV Chuyên Nghiệp", "desc": "Đội ngũ huấn luyện viên cấp quốc gia, có kinh nghiệm thi đấu chuyên nghiệp nhiều năm."}, {"title": "Đặt Sân Online 24/7", "desc": "Hệ thống đặt sân trực tuyến thông minh, quản lý lịch chơi dễ dàng, nhanh chóng và tiện lợi."}]', 'json', 'home', 'Lý do chọn (Trang chủ)'),

  -- TRANG GIỚI THIỆU: INTRO SECTION
  ('about_title',            'THAOTRANG GROUP - ĐA NGÀNH NGHỀ, TRỌN NIỀM TIN',        'string',  'about', 'Tiêu đề Giới thiệu'),
  ('about_description_p1',   'Được hình thành từ niềm đam mê mãnh liệt với môn cầu lông, ThaoTrang Group đã không ngừng phát triển để trở thành một tập đoàn đa ngành vững mạnh. Chúng tôi không chỉ cung cấp không gian tập luyện chuyên nghiệp mà còn mở rộng sang lĩnh vực cung ứng trang thiết bị, tổ chức sự kiện và tư vấn giải pháp thể thao toàn diện.', 'string', 'about', 'Đoạn giới thiệu 1'),
  ('about_description_p2',   'Với phương châm "Khách hàng là trọng tâm", mỗi dịch vụ của chúng tôi đều hướng tới sự hoàn mỹ, sang trọng và đẳng cấp quốc tế.', 'string', 'about', 'Đoạn giới thiệu 2'),
  ('about_image_url',        'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=1000', 'string', 'about', 'URL ảnh giới thiệu'),

  -- TRANG GIỚI THIỆU: SỨ MỆNH - TẦM NHÌN - GIÁ TRỊ CỐT LÕI
  ('about_mission_title',    'Sứ mệnh',                                             'string',  'about', 'Tiêu đề Sứ mệnh'),
  ('about_mission_desc',     'Xây dựng môi trường thể thao lành mạnh, chuyên nghiệp và đẳng cấp cho mọi lứa tuổi.', 'string', 'about', 'Nội dung Sứ mệnh'),
  ('about_vision_title',     'Tầm nhìn',                                             'string',  'about', 'Tiêu đề Tầm nhìn'),
  ('about_vision_desc',      'Trở thành chuỗi trung tâm cầu lông hàng đầu khu vực với chất lượng dịch vụ chuẩn quốc tế.', 'string', 'about', 'Nội dung Tầm nhìn'),
  ('about_values_title',     'Giá trị cốt lõi',                                      'string',  'about', 'Tiêu đề Giá trị cốt lõi'),
  ('about_values_desc',      'Chuyên nghiệp - Tận tâm - Sáng tạo - Kết nối cộng đồng yêu thể thao.', 'string', 'about', 'Nội dung Giá trị cốt lõi'),

  -- TRANG GIỚI THIỆU: MILESTONES (JSON array)
  ('about_milestones',       '[{"year": "2015", "title": "Thành lập", "desc": "Khởi đầu với khát vọng xây dựng hệ sinh thái thể thao chuyên nghiệp."}, {"year": "2018", "title": "Mở rộng đa ngành", "desc": "Phát triển sang lĩnh vực thương mại phụ kiện và đào tạo học viên."}, {"year": "2021", "title": "Hệ thống 5 cơ sở", "desc": "Trở thành đơn vị dẫn đầu về số lượng và chất lượng sân bãi tại TP.HCM."}, {"year": "2024", "title": "Vươn tầm quốc tế", "desc": "Đạt chứng chỉ chuẩn quốc tế BWF và đăng cai các giải đấu mở rộng."}, {"year": "2026", "title": "Đổi mới công nghệ", "desc": "Số hóa toàn bộ quy trình vận hành và chăm sóc khách hàng."}]', 'json', 'about', 'Hành trình phát triển'),

  -- TRANG GIỚI THIỆU: WHY CHOOSE US (JSON array)
  ('about_why_us',           '[{"title": "Chất lượng hàng đầu", "desc": "Hệ thống sân bãi đạt tiêu chuẩn thi đấu quốc tế, thảm sàn cao cấp chống chấn thương."}, {"title": "Dịch vụ đẳng cấp", "desc": "Đội ngũ nhân viên chuyên nghiệp, tận tâm và hệ thống tiện ích đi kèm đa dạng."}, {"title": "Cộng đồng văn minh", "desc": "Nơi giao lưu của những người yêu thể thao chân chính và các doanh nhân thành đạt."}]', 'json', 'about', 'Lý do chọn (Trang giới thiệu)')
ON CONFLICT (key) DO UPDATE 
SET 
  value = EXCLUDED.value,
  type = EXCLUDED.type,
  setting_group = EXCLUDED.setting_group,
  label = EXCLUDED.label,
  updated_at = NOW();
