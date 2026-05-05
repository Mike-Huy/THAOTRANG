# TTQ6 - PROJECT PROGRESS LOG
> Dự án: Thảo Trang Badminton (TTQ6)
> File theo dõi tiến độ nội bộ team: KA (Backend) · MI (Frontend) · MIKE (Owner)

---

====== KA - START ======

## [2026-05-05] — Khởi tạo file theo dõi tiến độ

### Tổng quan kiến trúc hiện tại
- **Stack:** React 19 + Vite 8 + TailwindCSS 3 + Supabase + Framer Motion
- **Routing:** 7 trang (`/`, `/gioi-thieu`, `/san-pham`, `/dat-san`, `/hoat-dong`, `/tin-tuc`, `/lien-he`)
- **Backend:** Supabase project `jhebreoxwuimlqwvjdok`, prefix bảng `ttq6_`
- **File kết nối DB:** `src/lib/supabase.js`

### Trạng thái hiện tại
- Toàn bộ dữ liệu đang hardcode trong từng page component
- Chưa có bảng nào được tạo trên Supabase
- Chưa có logic gọi API thực sự
- `src/hooks/` còn trống — chưa có custom hook nào

### Việc cần làm (Backend backlog)
- [x] Thiết kế schema & tạo super admin
- [x] Thiết kế schema database cho các module: sản phẩm, đặt sân, tin tức, hoạt động
- [x] Tạo custom hooks để fetch data từ Supabase
- [x] Xây dựng logic đặt sân (kiểm tra lịch, xác nhận booking)

---

## [2026-05-05] — Super Admin Setup

### File tạo mới
- `sql/01_super_admin_setup.sql`

### Các thành phần đã tạo

| Thành phần | Loại | Mô tả |
|---|---|---|
| `ttq6_profiles` | Table | Lưu username, role của mọi user |
| `ttq6_set_updated_at()` | Function | Trigger tự cập nhật `updated_at` |
| `ttq6_get_my_role()` | Function | Trả về role của user đang đăng nhập |
| `ttq6_is_super_admin()` | Function | Kiểm tra có phải super_admin không |
| RLS Policies (3) | Security | select_own · select_sadmin · update_sadmin |

### Thông tin tài khoản super admin
- **Email:** `ttq6_sadmin@ttq6.local`
- **Username:** `ttq6_sadmin`
- **Role:** `super_admin`

### Lưu ý quan trọng cho MI
- Không cần xử lý Frontend cho bước này
- Khi làm trang Login: dùng `email = ttq6_sadmin@ttq6.local` để đăng nhập (không phải username)
- Sau đăng nhập thành công gọi `ttq6_get_my_role()` để kiểm tra quyền và render UI tương ứng

---

## [2026-05-05] — Admin Schema & Custom Hooks (7 modules)

### Files tạo mới
- `sql/02_admin_schema.sql` — Toàn bộ schema database
- `src/hooks/useAuth.js` — Auth + profile + role check
- `src/hooks/useUsers.js` — Quản lý users
- `src/hooks/usePosts.js` — CRUD bài đăng / tin tức
- `src/hooks/useProducts.js` — CRUD sản phẩm + danh mục
- `src/hooks/useBookings.js` — Đặt sân + kiểm tra lịch trống
- `src/hooks/useActivities.js` — CRUD hoạt động / sự kiện
- `src/hooks/useContacts.js` — Form liên hệ + xử lý
- `src/hooks/useSettings.js` — Cài đặt website

### Database tables (prefix ttq6_)
| Bảng | Module |
|---|---|
| `ttq6_profiles` | Users (đã có, bổ sung phone/avatar/ban) |
| `ttq6_posts` | Tin tức / Bài đăng |
| `ttq6_product_categories` | Danh mục sản phẩm |
| `ttq6_products` | Sản phẩm |
| `ttq6_courts` | Sân cầu lông |
| `ttq6_bookings` | Đặt sân |
| `ttq6_activities` | Hoạt động / Sự kiện |
| `ttq6_contacts` | Form liên hệ |
| `ttq6_settings` | Cài đặt website (18 keys mặc định) |

### Logic quan trọng
- `useAuth`: `isAdmin`, `isSuperAdmin`, `isStaff` — dùng để guard route admin
- `useBookings.checkAvailability()` — kiểm tra trùng lịch trước khi tạo booking
- `useSettings.updateMany()` — lưu nhiều cài đặt 1 lần (dùng cho trang Settings)
- RLS: public chỉ đọc data published/active, admin/staff được full CRUD, chỉ super_admin sửa settings

### ⚠️ Lưu ý cho MI
1. **MIKE cần chạy `sql/02_admin_schema.sql` trên Supabase trước** khi MI làm bất kỳ UI nào
2. Route admin nên dạng `/admin/*` — guard bằng `useAuth().isStaff`
3. Import hooks theo từng trang: `useUsers` → trang Users, `usePosts` → trang Posts...
4. `useSettings()` trả về object `settings` dạng `{ site_name: '...', contact_phone: '...' }` — dùng trực tiếp bind vào form
5. Trang Login admin dùng `useAuth().signIn(email, password)`

====== KA - END ======

---

====== MI - START ======

## [2026-05-05] — Hoàn tất 100% UI Admin Dashboard (7 Modules)

### Các thành phần đã hoàn thành:
1.  **Cấu trúc chung:** `AdminLayout`, `ProtectedRoute`, Tái cấu trúc `App.jsx`, `Navbar` shortcut.
2.  **Module Users:** Quản lý danh sách, tìm kiếm, phân quyền (Role) và khóa/mở khóa (Ban/Unban) user.
3.  **Module Bookings:** Theo dõi lịch đặt sân, bộ lọc trạng thái, xác nhận/hủy đơn đặt sân.
4.  **Module Products:** Quản lý kho sản phẩm, danh mục, giá cả và trạng thái hiển thị.
5.  **Module Posts:** Hệ thống CMS quản lý tin tức, bài viết, bản nháp và phân loại.
6.  **Module Activities:** Quản lý sự kiện, buổi giao lưu, số lượng người tham gia.
7.  **Module Contacts:** Hộp thư xử lý yêu cầu khách hàng, đánh dấu trạng thái phản hồi.
8.  **Module Settings:** Cấu hình toàn bộ thông tin website, giá cả, mạng xã hội qua form tập trung.

### Công nghệ & Thẩm mỹ:
- Sử dụng **Lucide React** cho hệ thống icon đồng nhất.
- Giao diện **High-density** (mật độ thông tin cao), tối ưu cho quản trị viên.
- Hiệu ứng chuyển cảnh mượt mà với **Framer Motion**.
- Tích hợp đầy đủ các **Custom Hooks** từ KA để đảm bảo logic chạy thực tế với Supabase.

### Lưu ý cho KA:
- Toàn bộ Frontend đã sẵn sàng và kết nối với các hooks.
- **KA** có thể kiểm tra lại logic trong các file `src/pages/admin/*.jsx` để tối ưu hóa performance nếu cần.
- Nếu có bảng database mới hoặc thay đổi schema, hãy báo để **MI** cập nhật UI tương ứng.


## [2026-05-05] — Cập nhật Logo trình duyệt (Favicon)

### Thay đổi:
- Đã thay đổi icon hiển thị trên tab trình duyệt từ mặc định của Vite sang file `logo.png`.
- Cập nhật định dạng file từ `image/svg+xml` sang `image/png` trong `index.html`.

### File thay đổi:
- `index.html`

### Kết quả:
- Website hiện thị logo Thảo Trang Badminton trên tab trình duyệt.

## [2026-05-05] — Tái cấu trúc trang Cài đặt hệ thống

### Thay đổi:
1.  **Hệ thống Tab:** Bổ sung thanh điều hướng tab gồm 3 mục:
    -   **Phân quyền:** Quản lý quyền truy cập menu/function.
    -   **Cài đặt chung:** Các thông tin website hiện tại.
    -   **ROLE:** Quản lý nhóm quyền và gán cho người dùng.
2.  **Bố cục Action:** Di chuyển nút "Lưu cài đặt" và "Hủy thay đổi" từ Header xuống thanh công cụ cố định (Sticky Footer) phía dưới cùng của trang.
3.  **UI/UX:**
    -   Sử dụng `framer-motion` cho hiệu ứng chuyển tab mượt mà.
    -   Thanh footer có hiệu ứng backdrop-blur và shadow tăng độ nổi bật.
    -   Thêm trạng thái "Super Admin" hiển thị dưới footer để nhắc nhở quyền hạn.

### File thay đổi:
- `src/pages/admin/Settings.jsx`

====== MI - END ======

---

====== KA - HOTFIX [2026-05-05] ======

## Bug Fix: Trắng trang & Không đăng nhập được

### 5 lỗi đã phát hiện và sửa

| # | File | Lỗi | Trạng thái |
|---|---|---|---|
| 1 | `src/components/Navbar.jsx` | `profile` không được destructure từ `useAuth()` → `ReferenceError` → trắng trang | ✅ Fixed |
| 2 | `src/pages/admin/Login.jsx` + `sql/01_super_admin_setup.sql` | Email super admin dùng `@ttq6.local` nhưng form convert thành `@thaotrangq6.com` → sai email → không đăng nhập được | ✅ Fixed |
| 3 | `src/components/admin/AdminLayout.jsx` | `handleSignOut` gọi `navigate('/')` sau khi `signOut()` đã tự gọi `window.location.replace('/')` → double redirect conflict | ✅ Fixed |
| 4 | `src/hooks/useAuth.jsx` | Dùng cả `getSession` lẫn `onAuthStateChange` → race condition. Supabase v2 bắn event `INITIAL_SESSION` không được xử lý → loading treo | ✅ Fixed |
| 5 | `sql/01_super_admin_setup.sql` | SQL dùng role `'member'` nhưng JS dùng `'customer'` → CHECK constraint fail → profile không tạo được. Thiếu trigger tự tạo profile khi user đăng ký mới | ✅ Fixed |

### Chi tiết thay đổi

**Navbar.jsx:** Thêm `profile, signOut` vào destructure của `useAuth()`

**Login.jsx:** Đổi default pre-fill từ `ttq6_sadmin` → `ttq6_sadmin@thaotrangq6.com`

**AdminLayout.jsx:** Bỏ `navigate('/')` và `useNavigate` import thừa

**useAuth.jsx:** Bỏ `getSession()` riêng, chỉ dùng `onAuthStateChange` với xử lý cả `INITIAL_SESSION`

**sql/01_super_admin_setup.sql:**
- Đổi role default từ `'member'` → `'customer'`, CHECK constraint cập nhật theo
- Đổi email super admin từ `@ttq6.local` → `@thaotrangq6.com`
- Thêm function `ttq6_handle_new_user()` + trigger `ttq6_on_auth_user_created` để tự tạo profile khi user đăng ký

### ⚠️ MIKE cần làm
1. **Nếu chưa chạy SQL:** Chạy lại `sql/01_super_admin_setup.sql` (đã cập nhật) rồi `sql/02_admin_schema.sql`
2. **Nếu đã chạy SQL cũ** (với email `@ttq6.local`): Chạy lệnh này trên Supabase SQL Editor để update email super admin:
```sql
UPDATE auth.users SET email = 'ttq6_sadmin@thaotrangq6.com' WHERE email = 'ttq6_sadmin@ttq6.local';
```

====== KA - HOTFIX END ======

---

====== KA - HOTFIX 2 [2026-05-05] ======

## Bug Fix: Đăng ký báo thành công nhưng không đăng nhập được, không thấy user trong auth.users

### Nguyên nhân gốc rễ

**Supabase mặc định bật "Confirm email".**
Khi user đăng ký với email giả `khach01@thaotrangq6.com`:
1. Supabase tạo row trong `auth.users` nhưng `email_confirmed_at = NULL`
2. Supabase gửi email xác nhận tới `khach01@thaotrangq6.com` — địa chỉ không tồn tại
3. Link xác nhận không bao giờ được click → tài khoản mãi ở trạng thái unconfirmed
4. `signInWithPassword` từ chối unconfirmed user → "Email not confirmed"
5. Code cũ bắt lỗi sai → hiển thị "Đăng ký thành công" dù thực ra không dùng được

### Giải pháp

Thay `signUp` bằng `signUpAndSignIn` — đăng ký xong thử đăng nhập ngay:
- **Nếu Supabase đã tắt confirm email** (khuyến nghị): đăng nhập thành công ngay, modal tự đóng
- **Nếu Supabase vẫn bật confirm email**: hiển thị thông báo rõ "Kiểm tra hộp thư để xác nhận"
- **Nếu email đã tồn tại**: Supabase trả `identities = []` → bắt được và báo lỗi đúng

### Files đã sửa
- `src/hooks/useAuth.jsx` — thêm function `signUpAndSignIn`, export qua context
- `src/components/Navbar.jsx` — dùng `signUpAndSignIn`, thêm `successMsg` state, bỏ `alert()`

### ⚠️ MIKE cần làm NGAY trên Supabase Dashboard

Vào **Supabase Dashboard → Authentication → Settings → Email Auth**:
- Tắt **"Enable email confirmations"** (toggle OFF)

Sau khi tắt, user đăng ký bằng nickname (ví dụ `khach01`) sẽ được tạo email `khach01@thaotrangq6.com` và đăng nhập được ngay mà không cần xác nhận.


---

====== KA - HOTFIX 3 [2026-05-05] ======

## Bug Fix: Trắng trang do Loop Redirect & Sửa lỗi đăng nhập cho tài khoản thiếu Profile

### 4 lỗi đã phát hiện và sửa

| # | File | Lỗi | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/admin/Login.jsx` | Redirect loop: User không phải admin vào `/admin/login` → bị Login đẩy sang `/admin` → bị ProtectedRoute đẩy ngược lại `/admin/login` → Lặp vô tận gây trắng trang | ✅ Fixed |
| 2 | `src/hooks/useAuth.jsx` | `loadProfile` thiếu try-catch → nếu query lỗi (ví dụ không tìm thấy profile) sẽ bị treo trạng thái loading | ✅ Fixed |
| 3 | `src/components/Navbar.jsx` | Chỉ đóng Login Popup khi có `profile` → Nếu tài khoản có trong Auth nhưng chưa có record trong bảng `ttq6_profiles` (như `khach03`) sẽ bị kẹt ở popup dù đã login thành công | ✅ Fixed |
| 4 | `src/main.jsx` | `StrictMode` trong React 19 gây ra một số lỗi tương thích với Framer Motion và Supabase Auth event | ✅ Fixed |

### Chi tiết thay đổi

**useAuth.jsx:** 
- Thêm đối tượng `user` (dữ liệu thô từ Supabase Auth) vào context. Ứng dụng giờ nhận biết trạng thái "đã login" ngay khi có session, không đợi profile.
- Thêm try-catch và xử lý lỗi cho `loadProfile`. Nếu không tìm thấy profile, set `profile = null` và tắt loading thay vì treo.

**Navbar.jsx:** 
- Đóng Login Popup ngay khi có `user`, không đợi `profile`.
- UI hiển thị thông minh: Nếu thiếu profile, tự động lấy prefix của Email làm tên hiển thị và chữ cái đầu Email làm avatar.

**Login.jsx:** 
- Chỉ tự động redirect sang `/admin` nếu user có quyền `isStaff` (admin/super_admin/staff).

**main.jsx:** 
- Gỡ bỏ `StrictMode`.
- Chuyển `import styles/index.css` từ `App.jsx` sang `main.jsx` để đồng nhất stylesheet.

### ⚠️ Lưu ý cho MIKE
Hiện tại bảng `ttq6_profiles` mới chỉ có 1 bản ghi (Admin). Các tài khoản khách (như `khach03`) nếu được tạo thủ công hoặc tạo trước khi có Trigger sẽ không có row trong bảng này. Tuy nhiên, code hiện tại đã xử lý hiển thị fallback dựa trên Email nên không còn bị lỗi trắng trang hay kẹt popup.

====== KA - HOTFIX 3 END ======

---

====== KA - HOTFIX 4 [2026-05-05] ======

## Bug Fix: Logout vẫn trung chuyển qua trang trung gian thay vì về thẳng trang chủ

### Nguyên nhân gốc rễ

Khi nhấn Đăng xuất, sequence xảy ra theo thứ tự:
1. `signOut()` gọi `supabase.auth.signOut()`
2. `onAuthStateChange` bắt event `SIGNED_OUT`
3. **`setUser(null)` + `setProfile(null)` chạy trước** → React re-render ngay lập tức
4. `ProtectedRoute` thấy `profile = null` → render `<Navigate to="/admin/login" />` → **flash trang login**
5. Sau đó mới chạy `window.location.replace('/')` → về trang chủ

Ngoài ra Navbar vẫn còn `navigate('/')` sau `signOut()` gây thêm một lần redirect thừa qua React Router.

### Giải pháp

**`window.location.replace('/')` phải là dòng đầu tiên** khi bắt `SIGNED_OUT` — browser bắt đầu load trang chủ ngay lập tức, React không có thời gian render bất kỳ thứ gì.

### Files đã sửa

| File | Thay đổi |
|---|---|
| `src/hooks/useAuth.jsx` | Đưa `window.location.replace('/')` lên đầu tiên trong handler `SIGNED_OUT`, thêm `return` để dừng ngay, không set state |
| `src/components/Navbar.jsx` | Bỏ `navigate('/')` sau `signOut()`, đổi onClick thành `onClick={signOut}` |

====== KA - HOTFIX 4 END ======

---

====== KA - SESSION 2 [2026-05-05] ======

## User Data Cleanup — Tách riêng data TTQ6 khỏi dự án khác

### Vấn đề phát hiện
Bảng `ttq6_profiles` chứa lẫn 5 user từ domain `@huysaigon.com` (dự án khác).
Đồng thời 7 user TTQ6 (`khach01~06`, `tainguyen`) được tạo trước khi có trigger → không có row trong `ttq6_profiles`.

### SQL đã chạy (MIKE thực hiện trên Supabase)

```sql
-- Bước 1: Xóa user dự án khác khỏi ttq6_profiles
DELETE FROM public.ttq6_profiles
WHERE id IN (
  SELECT p.id FROM public.ttq6_profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE u.email LIKE '%@huysaigon.com'
);

-- Bước 2: Backfill profile cho khach01~06, tainguyen
INSERT INTO public.ttq6_profiles (id, username, role)
SELECT
  u.id,
  split_part(u.email, '@', 1),
  'customer'
FROM auth.users u
LEFT JOIN public.ttq6_profiles p ON p.id = u.id
WHERE u.email LIKE '%@thaotrangq6.com'
  AND p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Trạng thái sau cleanup

| Email | Username | Role |
|---|---|---|
| `ttq6_sadmin@thaotrangq6.com` | ttq6_sadmin | super_admin |
| `khach01@thaotrangq6.com` | khach01 | customer |
| `khach02@thaotrangq6.com` | khach02 | customer |
| `khach03@thaotrangq6.com` | khach03 | customer |
| `khach04@thaotrangq6.com` | khach04 | customer |
| `khach06@thaotrangq6.com` | khach06 | customer |
| `tainguyen@thaotrangq6.com` | tainguyen | customer |

**7 rows — toàn bộ TTQ6, không còn data lẫn từ dự án khác.**
Trigger `ttq6_on_auth_user_created` đang hoạt động đúng — user mới đăng ký từ web tự có profile.

====== KA - SESSION 2 END ======

---

====== KA - SESSION 3 [2026-05-05] ======

## Responsive — Toàn bộ trang public & components

### Vấn đề gốc (trước khi fix)
- Hero `h-[460px]` cố định, `whitespace-nowrap` trên h1 tràn màn hình nhỏ
- Stats card `-mt-16` bị che khuất trên mobile
- Milestone timeline zigzag vỡ layout trên mobile
- Sidebar filter Products không ẩn trên mobile
- Calendar Booking `min-w-[900px]` tràn ngang, court selector 9 nút không vừa màn hình nhỏ
- Stats Activities `-mt-12` chồng lên hero quá nhiều trên mobile
- Newsletter News 2 input/button bị squeeze
- Contact info cards không dùng grid hiệu quả trên tablet
- Footer 4 cột không wrap đẹp trên mobile

### Files đã sửa

| File | Thay đổi chính |
|---|---|
| `src/pages/Home.jsx` | Hero height `360px→460px` responsive, bỏ `whitespace-nowrap`, stats 3 cột mọi breakpoint, padding co giãn |
| `src/pages/About.jsx` | Ảnh stack đúng mobile, timeline đổi thành list dọc `<768px`, grid 1→3 cols |
| `src/pages/Products.jsx` | Sidebar ẩn `<lg`, thêm horizontal scroll pills + toggle filter button, grid 2 cột mobile |
| `src/pages/Booking.jsx` | `min-w` giảm 900→600px, court selector scroll ngang, control bar compact mobile |
| `src/pages/Activities.jsx` | Stats `-mt-8` mobile, 3 cột stats flex-col→flex-row theo breakpoint |
| `src/pages/News.jsx` | Newsletter stack dọc `<sm`, grid bài viết 1→2→3 cols |
| `src/pages/Contact.jsx` | Info cards dùng grid 3 cột tablet, map height 48→64 theo breakpoint |
| `src/components/Footer.jsx` | Grid 2 cột mobile, brand span full-width mobile |

### Nguyên tắc áp dụng
- Breakpoints: `sm` (640px) · `md` (768px) · `lg` (1024px)
- Mobile-first: default = mobile, scale up với prefix
- Không thay đổi design, chỉ điều chỉnh layout và spacing

====== KA - SESSION 3 END ======
