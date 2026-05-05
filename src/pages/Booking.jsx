import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';

const Booking = () => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(1);

  const courts = Array.from({ length: 9 }, (_, i) => i + 1);
  const hourHeight = 35;
  const startHour = 6;
  const endHour = 22;
  const timeLabels = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const bookings = [
    { id: 1, date: format(new Date(), 'yyyy-MM-dd'), court: 1, start: '06:30', end: '08:00', status: 2, user: 'Minh Tuấn' },
    { id: 2, date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), court: 1, start: '09:15', end: '11:45', status: 1, user: 'Hoàng Nam' },
    { id: 3, date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), court: 1, start: '14:00', end: '15:30', status: 2, user: 'Cộng đồng Cầu Lông' },
    { id: 4, date: format(addDays(new Date(), 4), 'yyyy-MM-dd'), court: 1, start: '18:00', end: '20:30', status: 2, user: 'CLB Quận 7' },
    { id: 5, date: format(addDays(new Date(), 6), 'yyyy-MM-dd'), court: 1, start: '07:00', end: '09:00', status: 1, user: 'Trọng Nghĩa' },
    { id: 6, date: format(new Date(), 'yyyy-MM-dd'), court: 3, start: '10:00', end: '12:00', status: 2, user: 'Nhóm SV' },
  ];

  const statusConfig = {
    1: { color: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Chờ thanh toán', icon: <AlertCircle size={14} /> },
    2: { color: 'bg-[#008200]', border: 'border-[#008200]', text: 'text-white', label: 'Đã xác nhận', icon: <CheckCircle2 size={14} /> },
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));

  const getTimePosition = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return ((h - startHour) * 60 + m) / 60 * hourHeight;
  };

  const getBlockHeight = (start, end) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60 * hourHeight;
  };

  return (
    <div className="booking-page pt-12 bg-[#f8fafc] min-h-screen">
      <section className="pt-2 pb-6">
        <div className="container">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            {/* View mode switcher */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('week')}
                className={`text-lg sm:text-xl md:text-2xl font-black uppercase transition-all ${viewMode === 'week' ? 'text-[#008200]' : 'text-gray-300 hover:text-gray-400'}`}
              >
                Lịch tuần
              </button>
              <div className="w-[2px] h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`text-lg sm:text-xl md:text-2xl font-black uppercase transition-all ${viewMode === 'day' ? 'text-[#008200]' : 'text-gray-300 hover:text-gray-400'}`}
                >
                  Lịch ngày
                </button>
                <div className="relative group">
                  <button className="p-1.5 rounded-lg bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white transition-all">
                    <CalendarIcon size={18} />
                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={format(currentDate, 'yyyy-MM-dd')}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCurrentDate(new Date(e.target.value));
                          setViewMode('day');
                        }
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Court selector — only in week view, scrollable on mobile */}
            {viewMode === 'week' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-1 shrink-0">
                  <Info size={12} /> Sân:
                </span>
                <div className="flex gap-[1px] bg-black rounded-lg overflow-hidden overflow-x-auto border border-black">
                  {courts.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCourt(c)}
                      className={`h-7 w-7 sm:w-8 font-bold transition-all flex items-center justify-center text-xs sm:text-[13px] shrink-0
                        ${selectedCourt === c ? 'bg-[#008200] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden">
            {/* Control Bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-100 flex justify-between items-center bg-white gap-3">
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <h2 className="text-sm sm:text-base capitalize text-black">
                    {viewMode === 'week'
                      ? `Tháng ${format(currentDate, 'MM, yyyy', { locale: vi })}`
                      : format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi })
                    }
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 pl-4 sm:pl-6">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${config.color} border ${config.border}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[#008200] font-black text-[10px] sm:text-xs uppercase tracking-widest shrink-0"
              >
                Hôm nay
              </button>
            </div>

            {/* Calendar grid — horizontal scroll on mobile */}
            <div className="overflow-auto max-h-[420px] sm:max-h-[500px] relative border-b-2 border-gray-100">
              <div className="min-w-[600px] sm:min-w-[800px] relative">
                {/* Header Row */}
                <div className="flex border-b-2 border-gray-300 bg-white sticky top-0 z-20">
                  <div className="w-10 sm:w-12 shrink-0 border-r-2 border-gray-300 bg-gray-50" />
                  {viewMode === 'week' ? (
                    weekDays.map((day, idx) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <div key={idx} className={`flex-1 py-1 px-0.5 text-center border-r-2 border-gray-300 last:border-0 ${isToday ? 'bg-[#e6f3e6]/40' : ''}`}>
                          <div className="text-[8px] sm:text-[9px] uppercase font-normal text-black leading-tight">
                            {format(day, 'eee', { locale: vi })}
                          </div>
                          <div className="text-[10px] sm:text-[11px] font-normal leading-tight text-black">
                            {format(day, 'dd')}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    courts.map((c) => (
                      <div key={c} className="flex-1 py-2 px-1 text-center border-r-2 border-gray-300 last:border-0 bg-gray-50/30">
                        <div className="text-[9px] sm:text-[10px] font-black uppercase text-black">SÂN {c}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Timeline Grid */}
                <div className="flex relative" style={{ height: (endHour - startHour + 1) * hourHeight }}>
                  <div className="w-10 sm:w-12 shrink-0 border-r-2 border-gray-300 bg-gray-50 sticky left-0 z-10">
                    {timeLabels.map((hour) => (
                      <div key={hour} className="absolute left-0 right-0 text-center" style={{ top: (hour - startHour) * hourHeight - 8 }}>
                        <span className="text-[9px] sm:text-[10px] text-black">{hour}h</span>
                      </div>
                    ))}
                  </div>

                  {(viewMode === 'week' ? weekDays : courts).map((item, idx) => (
                    <div key={idx} className="flex-1 relative border-r-2 border-gray-300 last:border-0">
                      {timeLabels.map((hour) => (
                        <div key={hour} className="absolute left-0 right-0 border-b-2 border-gray-300 w-full" style={{ top: (hour - startHour) * hourHeight, height: hourHeight }}>
                          <div className="absolute top-1/2 left-0 right-0 border-b border-gray-300/50 border-dashed" />
                        </div>
                      ))}
                      {bookings.filter(b => {
                        if (viewMode === 'week') return b.date === format(item, 'yyyy-MM-dd') && b.court === selectedCourt;
                        return b.date === format(currentDate, 'yyyy-MM-dd') && b.court === (idx + 1);
                      }).map((b) => (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`absolute left-0.5 right-0.5 rounded-lg p-1 border-l-4 shadow-sm z-10 flex flex-col justify-center items-center text-center overflow-hidden ${statusConfig[b.status].color} ${statusConfig[b.status].border}`}
                          style={{ top: getTimePosition(b.start) + 3, height: getBlockHeight(b.start, b.end) - 6 }}
                        >
                          <span className={`text-[8px] sm:text-[10px] font-normal uppercase leading-none ${statusConfig[b.status].text}`}>
                            {b.start}–{b.end}
                          </span>
                          <h4 className={`text-[9px] sm:text-[11px] font-normal truncate w-full text-center ${b.status === 2 ? 'text-white' : 'text-gray-800'}`}>
                            {b.user}
                          </h4>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
            Mẹo: Click vào khoảng trống để chọn giờ đặt sân mới
          </p>
        </div>
      </section>
    </div>
  );
};

export default Booking;
