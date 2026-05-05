import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User,
  CreditCard,
  MoreVertical
} from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Bookings = () => {
  const { bookings, loading, error, confirmBooking, cancelBooking } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.booker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booker_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.court?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'text-amber-500',
      confirmed: 'text-blue-600',
      completed: 'text-blue-600',
      cancelled: 'text-red-500'
    };
    const icons = {
      pending: <Clock size={14} />,
      confirmed: <CheckCircle2 size={14} />,
      completed: <CheckCircle2 size={14} />,
      cancelled: <XCircle size={14} />
    };
    const labels = {
      pending: 'Chờ duyệt',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };

    return (
      <span className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider ${styles[status] || styles.pending}`}>
        {icons[status] || <Clock size={14} />}
        {labels[status] || status}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý đặt sân</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline">
            <Filter size={16} />
            <span>Bộ lọc nâng cao</span>
          </button>
          <button className="btn-primary">
            <CalendarIcon size={16} />
            <span>Đặt sân mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm theo tên khách, tên sân..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              className="flex-1 md:flex-none text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00c853]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#008200] text-xs font-semibold uppercase tracking-wider text-white border-b border-[#008200]">
                <th className="px-6 py-1 border-r border-white/20">Khách hàng</th>
                <th className="px-6 py-1 border-r border-white/20">Sân</th>
                <th className="px-6 py-1 border-r border-white/20">Ngày đặt</th>
                <th className="px-6 py-1 border-r border-white/20">Giờ đặt</th>
                <th className="px-6 py-1 border-r border-white/20">Thanh toán</th>
                <th className="px-6 py-1 border-r border-white/20">Trạng thái</th>
                <th className="px-6 py-1 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-8">
                      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-yellow-100 transition-colors">
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <span className="text-xs font-medium text-black uppercase tracking-tight">
                      {booking.booker_name || 'Khách vãng lai'}
                    </span>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {booking.court?.name || 'Chưa rõ sân'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <CalendarIcon size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium">
                        {booking.date ? format(new Date(booking.date), 'dd/MM/yyyy', { locale: vi }) : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {booking.time_start?.slice(0, 5)} - {booking.time_end?.slice(0, 5)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-black">
                      <CreditCard size={14} className="text-gray-400" />
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-1 border-b border-green-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => confirmBooking(booking.id)}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                            title="Xác nhận"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Hủy"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredBookings.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <CalendarIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Không tìm thấy đơn đặt sân nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
