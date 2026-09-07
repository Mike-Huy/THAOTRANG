import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, FileText, CheckCircle, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../hooks/useOrders';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: dbError } = await createOrder({
        ...form,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          cover_url: i.cover_url,
        })),
        total_amount: totalPrice,
        status: 'pending',
      });

      if (dbError) {
        setError('Lỗi khi gửi đơn: ' + dbError.message);
      } else {
        setSuccess(true);
        clearCart();
        setForm({ customer_name: '', customer_phone: '', customer_address: '', note: '' });
      }
    } catch (err) {
      setError('Lỗi hệ thống: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10"
            >
              <X size={16} />
            </button>

            {success ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00c853, #008200)' }}
                >
                  <CheckCircle size={40} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 uppercase">Đặt hàng thành công!</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-8 py-3 rounded-2xl text-white font-black text-sm uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(135deg, #00c853, #008200)',
                    boxShadow: '0 8px 20px rgba(0,200,83,0.35)',
                  }}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  className="px-6 py-5"
                  style={{ background: 'linear-gradient(135deg, #008200, #00c853)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-base uppercase tracking-wide">Chốt đơn hàng</h2>
                      <p className="text-white/70 text-xs mt-0.5">
                        {items.length} sản phẩm · Tổng{' '}
                        <span className="font-black text-white">
                          {totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order summary */}
                <div className="mx-5 mt-4 bg-gray-50 rounded-2xl p-3 border border-gray-100 max-h-32 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1 text-xs">
                      <span className="text-gray-700 font-medium line-clamp-1 flex-1 pr-2">
                        {item.name} <span className="text-gray-400">×{item.qty}</span>
                      </span>
                      <span className="font-black text-[#008200] shrink-0">
                        {(item.price * item.qty).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Họ tên *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="customer_name"
                        required
                        placeholder="Nhập họ và tên..."
                        value={form.customer_name}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="customer_phone"
                        required
                        placeholder="0909 xxx xxx"
                        value={form.customer_phone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Địa chỉ giao hàng
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        name="customer_address"
                        placeholder="Số nhà, đường, phường..."
                        value={form.customer_address}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Ghi chú
                    </label>
                    <div className="relative">
                      <FileText size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <textarea
                        name="note"
                        rows={2}
                        placeholder="Yêu cầu đặc biệt, thời gian giao..."
                        value={form.note}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #00c853, #008200)',
                      boxShadow: '0 8px 20px rgba(0,200,83,0.35)',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang gửi đơn...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400">
                    Thanh toán khi nhận hàng · Miễn phí đổi trả trong 7 ngày
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
