import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

const STATUS = {
  pending:   { bg: 'bg-amber-50',   border: 'border-amber-300', text: 'text-amber-800',  label: 'Chờ duyệt' },
  confirmed: { bg: 'bg-[#008200]',  border: 'border-[#005f00]', text: 'text-white',       label: 'Đã duyệt'  },
  cancelled: { bg: 'bg-gray-100',   border: 'border-gray-300',  text: 'text-gray-400',   label: 'Đã hủy'    },
  completed: { bg: 'bg-blue-50',    border: 'border-blue-200',  text: 'text-blue-700',   label: 'Hoàn thành' },
};

const BookingBlock = ({ booking, style, isAdmin, onConfirm, onCancel }) => {
  const [acting, setActing] = useState(false);
  const cfg = STATUS[booking.status] || STATUS.pending;

  const handle = async (fn) => {
    setActing(true);
    await fn();
    setActing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute left-0.5 right-0.5 rounded-lg border-l-4 shadow-sm z-10 overflow-hidden flex flex-col
        ${cfg.bg} ${cfg.border}`}
      style={style}
    >
      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-1 py-1 min-h-0">
        <span className={`text-[8px] sm:text-[9px] font-bold uppercase leading-none ${cfg.text}`}>
          {booking.time_start?.slice(0, 5)}–{booking.time_end?.slice(0, 5)}
        </span>
        <span className={`text-[9px] sm:text-[11px] font-black truncate w-full text-center leading-tight mt-0.5 ${cfg.text}`}>
          {booking.booker_name}
        </span>
        {booking.status === 'pending' && (
          <span className="text-[7px] font-bold uppercase text-amber-600 flex items-center gap-0.5 mt-0.5">
            <Clock size={8} />Chờ duyệt
          </span>
        )}
      </div>

      {/* Nút admin — chỉ hiện khi pending và đủ chiều cao */}
      {isAdmin && booking.status === 'pending' && (
        <div className="flex border-t border-amber-200/60 shrink-0">
          {acting ? (
            <div className="flex-1 flex items-center justify-center py-1">
              <Loader2 size={11} className="animate-spin text-amber-600" />
            </div>
          ) : (
            <>
              <button
                onClick={e => { e.stopPropagation(); handle(onConfirm); }}
                title="Duyệt"
                className="flex-1 flex items-center justify-center py-1 bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                <CheckCircle2 size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); handle(onCancel); }}
                title="Hủy"
                className="flex-1 flex items-center justify-center py-1 bg-red-400 hover:bg-red-500 text-white transition-colors"
              >
                <XCircle size={11} />
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BookingBlock;
