import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Người dùng', value: '1,284', trend: '+12%', isUp: true, icon: Users, color: 'blue' },
    { label: 'Doanh thu', value: '45.2M', trend: '+8%', isUp: true, icon: TrendingUp, color: 'green' },
    { label: 'Đơn đặt sân', value: '156', trend: '-3%', isUp: false, icon: Calendar, color: 'purple' },
    { label: 'Sản phẩm', value: '42', trend: '+2%', isUp: true, icon: ShoppingBag, color: 'orange' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm">Chào mừng bạn quay lại, đây là những gì đang diễn ra hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="text-2xl font-black text-[#0d1117] mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-[#0d1117] uppercase tracking-tight">Biểu đồ hoạt động</h3>
            <select className="text-xs font-bold border-none bg-gray-50 rounded-lg px-3 py-2 outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-300 font-medium italic border-2 border-dashed border-gray-50 rounded-xl">
            Biểu đồ sẽ được KA tích hợp sau
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-black text-[#0d1117] uppercase tracking-tight mb-6">Thông báo mới</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#00c853]/10 flex items-center justify-center text-[#00c853] flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0d1117]">Khách hàng mới đặt sân</div>
                  <div className="text-[10px] text-gray-500">Sân số 2 - 18:00 hôm nay</div>
                  <div className="text-[9px] text-gray-400 mt-1">2 phút trước</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
