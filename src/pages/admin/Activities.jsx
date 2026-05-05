import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Zap, 
  MapPin, 
  Calendar, 
  Users, 
  Trash2, 
  Edit3, 
  MoreVertical,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Activities = () => {
  const { activities, loading, error, toggleStatus, deleteActivity } = useActivities();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivities = activities.filter(act => 
    act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-50 text-green-600 border-green-100',
      ended: 'bg-gray-100 text-gray-500 border-gray-200',
      cancelled: 'bg-red-50 text-red-600 border-red-100'
    };
    const labels = {
      active: 'Đang diễn ra',
      ended: 'Đã kết thúc',
      cancelled: 'Đã hủy'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý hoạt động</h1>
          <p className="text-gray-500 text-sm">Quản lý các sự kiện, buổi giao lưu và giải đấu tại sân.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          <span>Tạo hoạt động mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm tên hoạt động, địa điểm..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="px-6 py-4">Hoạt động</th>
                <th className="px-6 py-4">Thời gian / Địa điểm</th>
                <th className="px-6 py-4">Tham gia</th>
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
              ) : filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00c853]/10 flex items-center justify-center text-[#00c853]">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight">{act.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{act.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700">
                        <Calendar size={12} className="text-gray-400" />
                        {act.start_at ? format(new Date(act.start_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <MapPin size={12} />
                        {act.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0d1117]">
                      <Users size={14} className="text-[#00c853]" />
                      {act.current_participants || 0} / {act.max_participants || '∞'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(act.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa hoạt động này?')) deleteActivity(act.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredActivities.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <Zap size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Không tìm thấy hoạt động nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
