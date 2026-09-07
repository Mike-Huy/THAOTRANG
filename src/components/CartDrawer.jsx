import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import productsImg from '../assets/badminton_products_1777876769461.png';

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQty,
    totalPrice,
    totalQuantity,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-[201] w-full max-w-sm flex flex-col shadow-2xl"
              style={{ background: '#fff' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
                style={{ background: 'linear-gradient(135deg, #008200, #00c853)' }}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart size={20} className="text-white" />
                  <span className="text-white font-black text-sm uppercase tracking-widest">
                    Giỏ hàng
                  </span>
                  {totalQuantity > 0 && (
                    <span className="bg-white text-[#008200] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #f0faf0, #e8f5e9)' }}
                    >
                      <ShoppingBag size={36} className="text-[#008200]/40" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                      Giỏ hàng trống
                    </p>
                    <p className="text-gray-300 text-xs">
                      Hãy thêm sản phẩm vào giỏ!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100"
                      >
                        {/* Image */}
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #f0faf0, #e8f5e9)' }}
                        >
                          <img
                            src={item.cover_url || productsImg}
                            alt={item.name}
                            className="w-full h-full object-contain p-1.5"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-gray-800 leading-tight line-clamp-2 mb-1">
                            {item.name}
                          </p>
                          <p
                            className="text-sm font-black"
                            style={{
                              background: 'linear-gradient(135deg, #00c853, #007a00)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {(item.price * item.qty).toLocaleString('vi-VN')}đ
                          </p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#008200] hover:text-[#008200] transition-all"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-xs font-black w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#008200] hover:text-[#008200] transition-all"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="px-5 py-4 border-t border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng cộng</span>
                    <span
                      className="text-xl font-black"
                      style={{
                        background: 'linear-gradient(135deg, #00c853, #007a00)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button
                    onClick={() => { closeCart(); setShowCheckout(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #00c853, #008200)',
                      boxShadow: '0 8px 20px rgba(0,200,83,0.35)',
                    }}
                  >
                    Chốt đơn ngay <ArrowRight size={16} />
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-2">
                    Giao hàng tận nơi · Thanh toán khi nhận hàng
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout modal rendered outside the drawer */}
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
};

export default CartDrawer;
