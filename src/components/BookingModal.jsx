import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Phone, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookingModal = ({ open, onClose, slot, court, onSubmit }) => {
  const [form, setForm] = useState({ booker_name: '', booker_phone: '', booker_email: '', notes: '' });
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Khi slot thay đổi (click ô mới), reset form và điền giờ đề xuất
  useEffect(() => {
    if (!slot) return;
    setForm({ booker_name: '', booker_phone: '', booker_email: '', notes: '' });
    setTimeStart(slot.timeStart || '');
    setTimeEnd(slot.timeEnd || '');
    setError('');
  }, [slot]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.booker_name.trim()) return setError('Vui lòng nhập họ tên.');
    if (!form.booker_phone.trim()) return setError('Vui lòng nhập số điện thoại.');
    if (!timeStart || !timeEnd) return setError('Vui lòng chọn giờ bắt đầu và kết thúc.');
    if (timeStart >= timeEnd) return setError('Giờ kết thúc phải sau giờ bắt đầu.');

    const courtId = court?.id || slot?.courtId;
    if (!courtId) return setError('Không xác định được sân, vui lòng thử lại.');

    setLoading(true);
    setError('');
    try {
      const result = await onSubmit({
        court_id: courtId,
        date: slot.date,
        time_start: timeStart,
        time_end: timeEnd,
        ...form,
      });
      const submitError = result?.error;
      if (submitError) {
        setError(submitError.message || 'Đặt sân thất bại, vui lòng thử lại.');
      } else {
        onClose();
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const price = court && timeStart && timeEnd
    ? (() => {
        const [sh, sm] = timeStart.split(':').map(Number);
        const [eh, em] = timeEnd.split(':').map(Number);
        const h = (eh * 60 + em - sh * 60 - sm) / 60;
        return h > 0 ? Math.round(court.price_per_hour * h) : 0;
      })()
    : 0;

  // Tạo danh sách giờ từ 06:00 đến 22:00, bước 30 phút
  const timeOptions = [];
  for (let h = 6; h <= 22; h++) {
    timeOptions.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) timeOptions.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-[#008200] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-base uppercase tracking-tight">Đặt sân</h2>
                {slot && (
                  <p className="text-green-200 text-[11px] mt-0.5">
                    {format(new Date(slot.date), 'eeee, dd/MM/yyyy', { locale: vi })}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Info bar */}
            <div className="bg-green-50 px-6 py-3 flex flex-wrap gap-4 border-b border-green-100">
              <div className="flex items-center gap-1.5 text-[#008200]">
                <MapPin size={13} />
                <span className="text-xs font-black uppercase">{court?.name || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Calendar size={13} />
                <span className="text-xs font-bold">{slot ? format(new Date(slot.date), 'dd/MM/yyyy') : '—'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Giờ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    <Clock size={10} className="inline mr-1" />Giờ bắt đầu
                  </label>
                  <select
                    value={timeStart}
                    onChange={e => setTimeStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#008200] focus:ring-2 focus:ring-[#008200]/10"
                  >
                    <option value="">-- Chọn --</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    <Clock size={10} className="inline mr-1" />Giờ kết thúc
                  </label>
                  <select
                    value={timeEnd}
                    onChange={e => setTimeEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#008200] focus:ring-2 focus:ring-[#008200]/10"
                  >
                    <option value="">-- Chọn --</option>
                    {timeOptions.filter(t => t > timeStart).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Giá ước tính */}
              {price > 0 && (
                <div className="bg-green-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tạm tính</span>
                  <span className="text-[#008200] font-black text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                  </span>
                </div>
              )}

              {/* Họ tên */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <User size={10} className="inline mr-1" />Họ tên *
                </label>
                <input
                  name="booker_name" value={form.booker_name} onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#008200] focus:ring-2 focus:ring-[#008200]/10"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <Phone size={10} className="inline mr-1" />Số điện thoại *
                </label>
                <input
                  name="booker_phone" value={form.booker_phone} onChange={handleChange}
                  placeholder="0901 234 567" type="tel"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#008200] focus:ring-2 focus:ring-[#008200]/10"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <FileText size={10} className="inline mr-1" />Ghi chú
                </label>
                <textarea
                  name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Yêu cầu đặc biệt, số lượng người..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#008200] focus:ring-2 focus:ring-[#008200]/10 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <p className="text-[10px] text-amber-700 font-bold">
                  Đặt sân sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi admin xác nhận thanh toán.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm uppercase tracking-wide hover:bg-gray-50 transition-all">
                  Hủy
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#008200] text-white font-black text-sm uppercase tracking-wide hover:bg-[#006600] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Đang gửi...' : 'Xác nhận đặt sân'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
