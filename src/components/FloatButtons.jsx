import { Phone, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

const FloatButtons = () => {
  const { settings } = useSettings();
  
  const phone = settings.phone || '0901234567';
  const zalo = settings.zalo_url || `https://zalo.me/${phone.replace(/\s/g, '')}`;

  return (
    <div className="fixed right-4 bottom-10 z-50 flex flex-col items-end gap-2.5">
      {/* Booking Button - Minimalist */}
      <motion.div
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link 
          to="/dat-san"
          className="flex items-center gap-2 bg-[#005c00] text-white px-3 py-2 rounded-lg transition-all group border border-white/10 shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Đặt sân</span>
          <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
            <CalendarDays size={14} />
          </div>
        </Link>
      </motion.div>

      <div className="flex flex-col gap-2 mr-1">
        {/* Zalo Button - Tiny */}
        <motion.a
          href={zalo}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.1, x: -1 }}
          className="w-8 h-8 bg-[#0068ff] rounded-md flex items-center justify-center shadow-sm hover:bg-[#0052cc] transition-all"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
            alt="Zalo" 
            className="w-5 h-5"
          />
        </motion.a>

        {/* Phone Button - Tiny */}
        <motion.a
          href={`tel:${phone.replace(/\s/g, '')}`}
          whileHover={{ scale: 1.1, x: -1 }}
          className="w-8 h-8 bg-[#005c00] rounded-md flex items-center justify-center hover:bg-[#004d00] transition-all"
        >
          <Phone className="text-white" size={14} />
        </motion.a>
      </div>
    </div>
  );
};

export default FloatButtons;
