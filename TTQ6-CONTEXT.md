# TTQ6 - CONTEXT FILE
> Dùng để KA khôi phục trạng thái làm việc khi bắt đầu session mới.
> Cập nhật lần cuối: 2026-05-06

---

## TEAM
- **KA** = AI Backend/Architect (tôi)
- **MIKE** = Owner/User
- **MI** = Frontend Engineer

---

## DỰ ÁN
- **Tên:** Thảo Trang Badminton (TTQ6)
- **Stack:** React 19 + Vite + TailwindCSS + Supabase + Framer Motion
- **Supabase TTQ6:** `https://jhebreoxwuimlqwvjdok.supabase.co`
- **website_id của TTQ6** trong project nguồn = **5** (integer, dạng ARRAY `[5]`)

---

## TÍNH NĂNG ĐÃ HOÀN THÀNH
- Auth (login/logout/register) + Super Admin ẩn khỏi UI
- 7 custom hooks: useAuth, useUsers, usePosts, useProducts, useBookings, useActivities, useContacts
- Admin Dashboard: Users, Bookings, Products, Posts, Activities, Contacts, Settings
- Calendar booking với xử lý overlap (OverlapStack component)
- Responsive toàn bộ trang public
- Bảo vệ tài khoản super_admin: ẩn khỏi danh sách, chặn ban/đổi role

---

## TÍNH NĂNG ĐANG LÀM DỞ — ⚠️ CẦN TIẾP TỤC

### Kết nối sản phẩm từ Project Nguồn (Giải pháp B — Mirror + Sync)

**Kiến trúc đã chọn:**
- Nguồn → TTQ6: Kéo thông tin sản phẩm về mirror table
- TTQ6 → Nguồn: Đẩy giá bán lẻ TTQ6 về bảng giá nguồn (phân biệt bằng `website_id = 5`)
- Bảo mật: Dùng **secret token riêng** qua Edge Function gateway (không dùng anon/service key lộ ra client)
- Sync tự động: **00:00:30** mỗi ngày (30 giây sau nửa đêm)

**Thông tin bảng `product` tại project nguồn — ĐÃ CÓ:**

| Cột nguồn | Kiểu | Dùng cho TTQ6 |
|---|---|---|
| `id` | integer | → `source_id` |
| `product_code` | varchar | → mã SP |
| `product_long` | text | → tên đầy đủ |
| `product_short` | varchar | → tên ngắn |
| `unit` | varchar | → đơn vị tính |
| `image` | text | → ảnh chính |
| `images` | jsonb | → ảnh bộ |
| `brand` | varchar | → thương hiệu |
| `sale_price` | numeric | → giá mặc định (khi TTQ6 chưa set giá riêng) |
| `status` | boolean | → trạng thái |
| `website_id` | ARRAY | → filter `@> '[5]'` để chỉ lấy SP của TTQ6 |
| `description` | text | → mô tả |
| `cate_code` | varchar | → mã danh mục |
| `vat_rate` | numeric | → thuế VAT |

**Lưu ý quan trọng:**
- `website_id` là **ARRAY** (ví dụ `[1,3]`) — filter bằng `website_id @> '[5]'::jsonb` hoặc `@> ARRAY[5]`
- `image` chỉ lưu tên file (ví dụ `P002984.webp?t=1773541183239`) — cần biết base URL ảnh của project nguồn để hiển thị đúng

---

## ⛔ CÒN THIẾU — MIKE CẦN CUNG CẤP KHI GẶP LẠI KA

### Kết quả câu SQL số 3 — Tìm bảng giá riêng theo website

MIKE cần chạy 3 câu sau trên **SQL Editor của project nguồn** rồi gửi kết quả cho KA:

**Câu A — Tìm bảng có cột website_id:**
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name ILIKE '%website%'
ORDER BY table_name;
```

**Câu B — Tìm bảng có cột giá:**
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name ILIKE '%price%'
    OR column_name ILIKE '%gia%'
    OR column_name ILIKE '%sale%'
  )
ORDER BY table_name, ordinal_position;
```

**Câu C — Liệt kê tất cả bảng:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## SAU KHI CÓ KẾT QUẢ CÂU 3, KA SẼ VIẾT

1. **SQL chạy tại project nguồn:**
   - Edge Function gateway với secret token
   - RLS policy cho phép TTQ6 đọc bảng `product`
   - Cho phép TTQ6 ghi vào bảng giá (filter `website_id = 5`)

2. **SQL chạy tại TTQ6:**
   - Bảng `ttq6_products_mirror` (lưu data từ nguồn)
   - Bảng `ttq6_product_prices` (giá TTQ6 tự quản lý)
   - RLS bảo vệ: frontend không thể sửa giá trực tiếp vào mirror

3. **Code TTQ6:**
   - `src/hooks/useProducts.js` — cập nhật đọc từ mirror + cho phép sửa giá
   - `src/lib/sourceClient.js` — Supabase client kết nối project nguồn
   - Edge Function sync cron `00:00:30`
   - Nút "Đồng bộ ngay" trong trang admin Products

---

## GHI CHÚ KỸ THUẬT
- File progress: `TTQ6-PROGRESS.md` — KA chỉ viết trong vùng `====== KA - START ======` đến `====== KA - END ======`
- Khi token < 10%: KA tự cập nhật file này
