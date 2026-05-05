# THẢO TRANG BADMINTON — CHUẨN THIẾT KẾ BẢNG ADMIN SIÊU NÉN (HIGH-DENSITY TABLE SPEC)

Tài liệu này đóng gói toàn bộ quy chuẩn thiết kế, mã nguồn mẫu, mã màu và cấu trúc của **bảng quản trị siêu nén (High-Density Table)** đặc trưng của hệ thống Thảo Trang Badminton. Tất cả các trang quản trị hiển thị dữ liệu dạng bảng mới phải tuân thủ nghiêm ngặt chuẩn này để đảm bảo tính nhất quán cao nhất của dự án.

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI
1. **Siêu nén (High Density):** Chiều cao dòng tối thiểu (`py-1` - tương đương 4px trên-dưới) để tăng tối đa diện tích hiển thị dữ liệu hữu ích trên màn hình.
2. **Nguyên tắc dòng đơn (Strictly Single-Line Rows):** KHÔNG bao giờ hiển thị 2 dòng thông tin xếp chồng trong cùng một ô dữ liệu (ví dụ: xếp chồng Tên khách hàng lên Tên sân, hoặc Ngày đặt lên Giờ đặt). Tất cả thông tin phải được trải rộng thành **thêm các cột mới riêng biệt**, đảm bảo mỗi hàng chỉ cao đúng 1 dòng văn bản thẳng tắp.
3. **Tiêu đề tinh gọn (No Description):** Tiêu đề trang quản trị sử dụng kích thước chuẩn `text-xl font-black uppercase` và **TUYỆT ĐỐI KHÔNG** hiển thị bất kỳ dòng mô tả phụ (`<p>` tag) nào bên dưới để giải phóng tối đa khoảng trống phần đầu trang.
4. **Không lòe loẹt, tinh giản:** Loại bỏ các hình đại diện avatar thừa thải, bỏ in đậm (`font-bold`, `font-black`) ở các cột phụ để tránh rối mắt.
5. **Màu sắc thương hiệu đồng bộ:**
   * Tiêu đề bảng sử dụng nền xanh lá đặc trưng (`#008200`) và chữ trắng.
   * Lưới bảng là vạch chia xanh lá nhạt dịu mắt (`border-green-200`).
   * Hiệu ứng rê chuột (`hover`) dùng nền màu vàng ấm tinh tế (`bg-yellow-100`).

---

## 2. QUY CHUẨN MÃ MÀU & TIÊU CHUẨN LỚP (CLASSES)

| Thành phần | Thuộc tính CSS / Tailwind CSS | Ý nghĩa thiết kế |
| :--- | :--- | :--- |
| **Tiêu đề bảng (`thead`)** | `bg-[#008200] text-white` | Màu nền xanh lá thương hiệu đậm, chữ trắng. |
| **Cỡ chữ tiêu đề** | `text-xs font-semibold uppercase tracking-wider` | Chữ in hoa thanh mảnh, dễ đọc. |
| **Vách chia dọc tiêu đề** | `border-r border-white/20` | Vạch ngăn trong suốt tinh tế trên nền xanh. |
| **Lưới chia ô dữ liệu (`td`)** | `border-r border-b border-green-200` | Lưới xanh nhạt mỏng, ô cuối không có `border-r`. |
| **Đệm dọc dòng (`Padding`)** | `py-1` (4px) | Chiều cao dòng siêu gọn. |
| **Hiệu ứng hover dòng** | `hover:bg-yellow-100 transition-colors` | Nền vàng ấm nổi bật mượt mà, viền giữ nguyên xanh nhạt. |

---

## 3. QUY CHUẨN ĐỊNH DẠNG THEO CỘT TRONG BẢNG

### A. Cột Tên đối tượng (Tên người dùng / Sản phẩm / Bài viết)
* **Quy tắc:** BỎ toàn bộ avatar tròn phía trước. Hiển thị chữ in hoa rõ nét.
* **Tailwind Class:** `text-xs font-medium text-black uppercase tracking-tight`

### B. Cột Vai trò (Role) / Danh mục (Category)
* **Quy tắc:** BỎ hoàn toàn các thẻ badge/khung tròn bo viền. Chỉ hiển thị chữ trơn viết hoa cách điệu (loại bỏ dấu gạch dưới `_`).
* **Quy chuẩn màu sắc:**
  * `SUPER ADMIN` ➜ `text-red-700 font-semibold uppercase text-[10px] tracking-wider`
  * `ADMIN` ➜ `text-blue-600 font-semibold uppercase text-[10px] tracking-wider`
  * `CUSTOMER / STAFF / USER` ➜ `text-black font-medium uppercase text-[10px] tracking-wider`

### C. Cột Trạng thái (Status)
* **Quy tắc:** Chữ in hoa kèm icon nhỏ (`size={14}`). BỎ in đậm (`font-medium`). Không dùng badge nền hay viền.
* **Quy chuẩn màu sắc:**
  * **HOẠT ĐỘNG / ĐÃ THANH TOÁN** ➜ Màu xanh dương (`text-blue-600`), icon `<Shield size={14} />`.
  * **BỊ KHÓA / HỦY BỎ / HẾT HÀNG** ➜ Màu đỏ (`text-red-500`), icon `<ShieldAlert size={14} />`.
  * **Tailwind Class chung:** `text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5`

### D. Cột Dữ liệu phụ (Số điện thoại, Ngày tháng, Sân, Thể loại)
* **Quy tắc:** Chữ cỡ nhỏ (`text-[10px]`), nét thường (`font-medium`), màu xám đậm (`text-gray-500` hoặc `text-gray-600`).
* **Biểu tượng:** Đi kèm icon Lucide màu xám nhạt (`text-gray-400`, `size={12}`) nằm bên trái với khoảng cách `gap-1.5`.

---

## 4. BẢN MẪU CẤU TRÚC JSX CHUẨN (BOILERPLATE)

Dưới đây là cấu trúc JSX mẫu chuẩn chỉ đã được áp dụng nguyên tắc dòng đơn (Single-line) và chia cột hoàn thiện:

```jsx
import React from 'react';
import { Shield, ShieldAlert, Phone, Calendar, Clock, MapPin, UserCheck, UserX } from 'lucide-react';

const TableBoilerplate = ({ items }) => {
  return (
    <div className="space-y-6">
      {/* 1. Tiêu đề không có dòng mô tả bên dưới */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý đặt sân</h1>
      </div>

      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#008200] text-xs font-semibold uppercase tracking-wider text-white border-b border-[#008200]">
                <th className="px-6 py-1 border-r border-white/20">Khách hàng</th>
                <th className="px-6 py-1 border-r border-white/20">Sân</th>
                <th className="px-6 py-1 border-r border-white/20">Ngày đặt</th>
                <th className="px-6 py-1 border-r border-white/20">Giờ đặt</th>
                <th className="px-6 py-1 border-r border-white/20">Trạng thái</th>
                <th className="px-6 py-1 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-yellow-100 transition-colors">
                  {/* Cột 1: Khách hàng */}
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <span className="text-xs font-medium text-black uppercase tracking-tight">
                      {item.booker_name}
                    </span>
                  </td>

                  {/* Cột 2: Sân (Được tách thành cột riêng biệt) */}
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {item.court_name}
                      </span>
                    </div>
                  </td>

                  {/* Cột 3: Ngày đặt (Tách riêng cột) */}
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium">
                        {item.date}
                      </span>
                    </div>
                  </td>

                  {/* Cột 4: Giờ đặt (Tách riêng cột) */}
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {item.time_slot}
                      </span>
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <span className="flex items-center gap-1.5 text-blue-600 text-[10px] font-medium uppercase tracking-wider">
                      <Shield size={14} /> Hoạt động
                    </span>
                  </td>

                  {/* Cột 6: Thao tác (Không có viền phải border-r) */}
                  <td className="px-6 py-1 border-b border-green-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all">
                        <UserCheck size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableBoilerplate;
```

