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
  const { bookings, loading, error, updateStatus } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.courts?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    const labels = {
      pending: 'Chờ duyệt',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý đặt sân</h1>
          <p className="text-gray-500 text-sm">Theo dõi lịch trình và trạng thái các đơn đặt sân.</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
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
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="px-6 py-4">Khách hàng / Sân</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Thanh toán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8">
                      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-[#00c853]" />
                        <span className="text-xs font-black text-[#0d1117] uppercase tracking-tight">
                          {booking.profiles?.username || 'Khách vãng lai'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {booking.courts?.name || 'Chưa rõ sân'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-700">
                          {format(new Date(booking.booking_date), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#008200]">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#0d1117] font-black text-xs">
                      <CreditCard size={14} className="text-gray-400" />
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                            title="Xác nhận"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Hủy"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
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
