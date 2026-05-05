import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Loader2, Layers, X } from 'lucide-react';

const STATUS = {
  pending:   { bg: 'bg-amber-50',  border: 'border-amber-400',  text: 'text-amber-800',  label: 'Chờ duyệt'  },
  confirmed: { bg: 'bg-[#008200]', border: 'border-[#005f00]',  text: 'text-white',       label: 'Đã duyệt'   },
  cancelled: { bg: 'bg-gray-100',  border: 'border-gray-300',   text: 'text-gray-400',   label: 'Đã hủy'     },
  completed: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   label: 'Hoàn thành' },
};

// Row trong popover cho từng booking
const BookingRow = ({ booking, isAdmin, onConfirm, onCancel }) => {
  const [acting, setActing] = useState(false);
  const cfg = STATUS[booking.status] || STATUS.pending;

  const handle = async (fn) => {
    setActing(true);
    await fn();
    setActing(false);
  };

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#008200] ${cfg.bg}`}>
      {booking.booker_name && (
        <span className={`text-[10px] font-black shrink-0 ${cfg.text}`}>
          {booking.booker_name}
        </span>
      )}
      <span className={`text-[9px] font-bold shrink-0 ${cfg.text} opacity-80 bg-black/5 px-1.5 py-0.5 rounded`}>
        {booking.time_start?.slice(0, 5)}–{booking.time_end?.slice(0, 5)}
      </span>
      <span className={`text-[8px] font-black uppercase tracking-wide shrink-0 ${cfg.text} opacity-70`}>
        {cfg.label}
      </span>
      {isAdmin && booking.status === 'pending' && (
        <div className="flex gap-1 shrink-0 border-l border-black/10 pl-1.5 ml-0.5">
          {acting ? (
            <Loader2 size={13} className="animate-spin text-amber-600" />
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handle(onConfirm); }}
                title="Duyệt"
                className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                <CheckCircle2 size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handle(onCancel); }}
                title="Hủy"
                className="p-1 bg-red-400 hover:bg-red-500 text-white rounded transition-colors"
              >
                <XCircle size={12} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Block hiển thị trên calendar khi có nhiều booking chồng nhau
const OverlapStack = ({ bookings, style, isAdmin, onConfirm, onCancel }) => {
  const [open, setOpen] = useState(false);
  const [popoverSide, setPopoverSide] = useState('right');
  const ref = useRef(null);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Nếu mép phải của block + chiều rộng popover tối đa (320px) + margin (20px) vượt quá viewport, lật sang trái
      if (rect.right + 340 > window.innerWidth) {
        setPopoverSide('left');
      } else {
        setPopoverSide('right');
      }
    }
    setOpen(v => !v);
  };

  return (
    <div
      ref={ref}
      className="absolute left-0.5 right-0.5 z-10"
      style={style}
      data-booking-block="1"
    >
      {/* Block chính — click để mở popover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleOpen}
        className="w-full h-full rounded-lg border-2 border-dashed border-black bg-amber-50 shadow-sm cursor-pointer
          flex flex-col justify-center items-center text-center px-1 py-1 overflow-hidden
          hover:bg-amber-100 transition-all select-none"
      >
        <Layers size={11} className="text-black shrink-0" />
        <span className="text-[8px] font-black uppercase text-black leading-tight mt-0.5">
          {bookings.length} lịch
        </span>
        {pendingCount > 0 && (
          <span className="mt-0.5 bg-red-500 text-white text-[7px] font-black rounded-full px-1 leading-tight shadow-sm">
            {pendingCount} chờ
          </span>
        )}
        <Clock size={8} className="text-black/60 mt-0.5" />
      </motion.div>

      {/* Popover danh sách booking */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden ${
              popoverSide === 'left' ? 'right-full mr-2' : 'left-full ml-2'
            }`}
            style={{ width: 'max-content', minWidth: '200px', maxWidth: '340px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header popover */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-[9px] font-normal uppercase tracking-wider text-black">
                {bookings.length} lịch trùng giờ
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Danh sách booking */}
            <div className="flex flex-col items-start gap-1.5 p-2 max-h-64 overflow-y-auto">
              {bookings.map(b => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  isAdmin={isAdmin}
                  onConfirm={() => onConfirm(b.id)}
                  onCancel={() => onCancel(b.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverlapStack;
