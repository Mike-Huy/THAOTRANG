import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import BookingBlock from '../components/BookingBlock';
import OverlapStack from '../components/OverlapStack';

const START_HOUR = 6;
const END_HOUR   = 22;
const HOUR_H     = 48; // px per hour — tall enough for admin buttons

const timeLabels = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function snapTime(minutesFromTop) {
  const totalMin = START_HOUR * 60 + Math.max(0, minutesFromTop);
  const snapped  = Math.round(totalMin / 30) * 30;
  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const Booking = () => {
  const [viewMode, setViewMode]         = useState('week');
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(null); // null = chưa chọn → dùng court đầu tiên
  const [modalOpen, setModalOpen]       = useState(false);
  const [activeSlot, setActiveSlot]     = useState(null); // { date, timeStart, timeEnd, courtId }
  const gridRef = useRef(null);

  const { bookings, courts, loading, createBooking, confirmBooking, cancelBooking } = useBookings();
  const { isAdmin, profile } = useAuth();

  const activeCourt = courts.find(c => c.id === selectedCourt) || courts[0];

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
  );

  const getTop    = (t) => (toMinutes(t) - START_HOUR * 60) / 60 * HOUR_H;
  const getHeight = (s, e) => (toMinutes(e) - toMinutes(s)) / 60 * HOUR_H;

  // Click vào ô trống → tính giờ từ vị trí chuột
  const handleColumnClick = (e, date, courtId) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY  = e.clientY - rect.top;
    const minFromTop = relY / HOUR_H * 60;

    const snappedStart = snapTime(minFromTop);
    const startMin = toMinutes(snappedStart);
    const endMin   = Math.min(startMin + 60, END_HOUR * 60); // mặc định 1 tiếng
    const snappedEnd = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    // Kiểm tra có booking nào đè lên không
    const colBookings = bookings.filter(b =>
      b.date === date && b.court_id === courtId && b.status !== 'cancelled'
    );
    const clash = colBookings.some(b =>
      toMinutes(b.time_start) < toMinutes(snappedEnd) &&
      toMinutes(b.time_end)   > toMinutes(snappedStart)
    );
    if (clash) return; // click trúng booking đã có → không mở modal

    const courtObj = courts.find(c => c.id === courtId);
    setActiveSlot({ date, timeStart: snappedStart, timeEnd: snappedEnd, courtId, court: courtObj });
    setModalOpen(true);
  };

  const handleBookingSubmit = async (payload) => {
    return await createBooking(payload);
  };

  const statusLegend = [
    { color: 'bg-amber-200 border-amber-400', label: 'Chờ duyệt' },
    { color: 'bg-[#008200] border-[#005f00]', label: 'Đã xác nhận' },
  ];

  const gridHeight = (END_HOUR - START_HOUR + 1) * HOUR_H;

  // Bookings lọc theo view
  const bookingsForColumn = (date, courtId) =>
    bookings.filter(b =>
      b.date === (typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')) &&
      b.court_id === courtId &&
      b.status !== 'cancelled'
    );

  // Nhóm các booking chồng giờ lại thành clusters
  // Mỗi cluster: { bookings[], top, height } — dùng span bao phủ toàn bộ thời gian của nhóm
  const groupOverlaps = (colBookings) => {
    if (colBookings.length === 0) return [];

    const sorted = [...colBookings].sort(
      (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start)
    );

    const clusters = [];
    let current = [sorted[0]];
    let maxEnd = toMinutes(sorted[0].time_end);

    for (let i = 1; i < sorted.length; i++) {
      const b = sorted[i];
      if (toMinutes(b.time_start) < maxEnd) {
        current.push(b);
        maxEnd = Math.max(maxEnd, toMinutes(b.time_end));
      } else {
        clusters.push(current);
        current = [b];
        maxEnd = toMinutes(b.time_end);
      }
    }
    clusters.push(current);
    return clusters;
  };

  return (
    <div className="booking-page pt-12 bg-[#f8fafc] min-h-screen">
      <section className="pt-2 pb-6">
        <div className="container">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('week')}
                className={`text-lg sm:text-xl md:text-2xl font-black uppercase transition-all
                  ${viewMode === 'week' ? 'text-[#008200]' : 'text-gray-300 hover:text-gray-400'}`}
              >Lịch tuần</button>
              <div className="w-[2px] h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`text-lg sm:text-xl md:text-2xl font-black uppercase transition-all
                    ${viewMode === 'day' ? 'text-[#008200]' : 'text-gray-300 hover:text-gray-400'}`}
                >Lịch ngày</button>
                <div className="relative">
                  <button className="p-1.5 rounded-lg bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white transition-all">
                    <CalendarIcon size={18} />
                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={format(currentDate, 'yyyy-MM-dd')}
                      onChange={e => { if (e.target.value) { setCurrentDate(new Date(e.target.value + 'T00:00:00')); setViewMode('day'); } }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Court selector — chỉ hiện ở week view */}
            {viewMode === 'week' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-1 shrink-0">
                  <Info size={12} /> Sân:
                </span>
                <div className="flex gap-[1px] bg-black rounded-lg overflow-hidden border border-black overflow-x-auto">
                  {courts.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourt(c.id)}
                      className={`h-7 min-w-[28px] px-1 sm:px-2 font-bold transition-all flex items-center justify-center text-xs sm:text-[13px] shrink-0
                        ${activeCourt?.id === c.id ? 'bg-[#008200] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      {c.name.replace(/[^0-9]/g, '') || c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden">

            {/* Control bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-100 flex justify-between items-center bg-white gap-3 flex-wrap">
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                    ><ChevronLeft size={16} /></button>
                    <button
                      onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                    ><ChevronRight size={16} /></button>
                  </div>
                  <h2 className="text-sm sm:text-base capitalize text-black">
                    {viewMode === 'week'
                      ? `Tháng ${format(currentDate, 'MM, yyyy', { locale: vi })}`
                      : format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi })}
                  </h2>
                </div>

                {/* Legend */}
                <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 pl-4 sm:pl-6">
                  {statusLegend.map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full border ${s.color}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[#008200] font-black text-[10px] sm:text-xs uppercase tracking-widest shrink-0"
              >Hôm nay</button>
            </div>

            {/* Grid */}
            <div className="overflow-auto max-h-[480px] sm:max-h-[580px] relative border-b-2 border-gray-100">
              <div className="min-w-[600px] sm:min-w-[800px] relative" ref={gridRef}>

                {/* Header row */}
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
                    courts.map(c => (
                      <div key={c.id} className="flex-1 py-2 px-1 text-center border-r-2 border-gray-300 last:border-0 bg-gray-50/30">
                        <div className="text-[9px] sm:text-[10px] font-black uppercase text-black">{c.name}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Timeline */}
                <div className="flex relative" style={{ height: gridHeight }}>
                  {/* Time labels */}
                  <div className="w-10 sm:w-12 shrink-0 border-r-2 border-gray-300 bg-gray-50 sticky left-0 z-10">
                    {timeLabels.map(hour => (
                      <div key={hour} className="absolute left-0 right-0 text-center" style={{ top: (hour - START_HOUR) * HOUR_H - 8 }}>
                        <span className="text-[9px] sm:text-[10px] text-black">{hour}h</span>
                      </div>
                    ))}
                  </div>

                  {/* Columns */}
                  {(viewMode === 'week' ? weekDays : courts).map((item, idx) => {
                    const colDate   = viewMode === 'week' ? format(item, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd');
                    const colCourtId = viewMode === 'week' ? activeCourt?.id : item.id;
                    const colBookings = colCourtId ? bookingsForColumn(colDate, colCourtId) : [];
                    const isPast = new Date(colDate) < new Date(format(new Date(), 'yyyy-MM-dd'));

                    return (
                      <div
                        key={idx}
                        className={`flex-1 relative border-r-2 border-gray-300 last:border-0
                          ${isPast ? 'bg-gray-50/60' : 'cursor-pointer hover:bg-green-50/30 transition-colors'}`}
                        onClick={e => {
                          if (isPast || !colCourtId) return;
                          if (e.target.closest('[data-booking-block]')) return;
                          handleColumnClick(e, colDate, colCourtId);
                        }}
                      >
                        {/* Grid lines */}
                        {timeLabels.map(hour => (
                          <div key={hour} className="absolute left-0 right-0 border-b-2 border-gray-300 w-full pointer-events-none"
                            style={{ top: (hour - START_HOUR) * HOUR_H, height: HOUR_H }}>
                            <div className="absolute top-1/2 left-0 right-0 border-b border-gray-300/50 border-dashed pointer-events-none" />
                          </div>
                        ))}

                        {/* Booking blocks — nhóm theo overlap */}
                        {groupOverlaps(colBookings).map((cluster, ci) => {
                          if (cluster.length === 1) {
                            const b = cluster[0];
                            return (
                              <div key={b.id} data-booking-block="1">
                                <BookingBlock
                                  booking={b}
                                  isAdmin={isAdmin}
                                  style={{
                                    top: getTop(b.time_start) + 2,
                                    height: Math.max(getHeight(b.time_start, b.time_end) - 4, 28),
                                  }}
                                  onConfirm={() => confirmBooking(b.id, profile?.id)}
                                  onCancel={() => cancelBooking(b.id)}
                                />
                              </div>
                            );
                          }
                          // Cluster có nhiều booking chồng nhau
                          const clusterStart = cluster.reduce(
                            (min, b) => Math.min(min, toMinutes(b.time_start)), Infinity
                          );
                          const clusterEnd = cluster.reduce(
                            (max, b) => Math.max(max, toMinutes(b.time_end)), 0
                          );
                          const toHHMM = (m) =>
                            `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                          return (
                            <div key={`cluster-${ci}`} data-booking-block="1">
                              <OverlapStack
                                bookings={cluster}
                                isAdmin={isAdmin}
                                style={{
                                  top: getTop(toHHMM(clusterStart)) + 2,
                                  height: Math.max(
                                    getHeight(toHHMM(clusterStart), toHHMM(clusterEnd)) - 4,
                                    28
                                  ),
                                }}
                                onConfirm={(id) => confirmBooking(id, profile?.id)}
                                onCancel={(id) => cancelBooking(id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {loading && (
              <div className="py-4 flex items-center justify-center gap-2 text-[#008200]">
                <Clock size={14} className="animate-spin" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Đang tải lịch...</span>
              </div>
            )}
          </div>

          <p className="mt-4 sm:mt-6 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
            {isAdmin
              ? 'Admin: click block vàng để duyệt hoặc hủy trực tiếp trên lịch'
              : 'Click vào khung giờ trống để đặt sân'}
          </p>
        </div>
      </section>

      {/* Modal đặt sân */}
      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slot={activeSlot}
        court={activeSlot?.court || courts.find(c => c.id === activeSlot?.courtId)}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
};

export default Booking;
