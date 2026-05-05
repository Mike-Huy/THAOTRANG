import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  X,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Users = () => {
  const { users, loading, error, updateRole, toggleBan, addUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    role: 'customer'
  });
  const [addError, setAddError] = useState(null);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError(null);
    
    try {
      const { error } = await addUser(formData);
      if (error) throw new Error(error);
      setIsAddModalOpen(false);
      setFormData({ email: '', password: '', username: '', phone: '', role: 'customer' });
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.role !== 'super_admin' && (
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    )
  );

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: 'text-red-700 font-semibold',
      admin: 'text-blue-600 font-semibold',
      staff: 'text-black font-medium',
      user: 'text-black font-medium',
      customer: 'text-black font-medium'
    };
    return (
      <span className={`text-[10px] uppercase tracking-wider ${styles[role] || 'text-black font-medium'}`}>
        {role?.replace('_', ' ')}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý người dùng</h1>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus size={16} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00c853]/10 flex items-center justify-center text-[#00c853]">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0d1117] uppercase tracking-tight">Thêm người dùng mới</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tạo tài khoản quản trị hoặc khách hàng</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {addError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-wider">
                    {addError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email đăng nhập</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text"
                          placeholder="09xxx..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['customer', 'staff', 'admin'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({...formData, role})}
                          className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                            formData.role === role 
                            ? 'bg-[#00c853] border-[#00c853] text-white shadow-lg shadow-[#00c853]/20' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0d1117] hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00c853]">
              <option>Tất cả vai trò</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>User</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#008200] text-xs font-semibold uppercase tracking-wider text-white border-b border-[#008200]">
                <th className="px-6 py-1 border-r border-white/20">Người dùng</th>
                <th className="px-6 py-1 border-r border-white/20">Vai trò</th>
                <th className="px-6 py-1 border-r border-white/20">Liên hệ</th>
                <th className="px-6 py-1 border-r border-white/20">Ngày tham gia</th>
                <th className="px-6 py-1 border-r border-white/20">Trạng thái</th>
                <th className="px-6 py-1 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8">
                      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-yellow-100 transition-colors">
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="text-xs font-medium text-black uppercase tracking-tight">{user.username || 'Chưa đặt tên'}</div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-medium text-gray-600 flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        {user.phone || '---'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi }) : '---'}
                    </div>
                  </td>
                  <td className="px-6 py-1 border-r border-b border-green-200">
                    {user.is_banned ? (
                      <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-medium uppercase tracking-wider">
                        <ShieldAlert size={14} /> Bị khóa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-blue-600 text-[10px] font-medium uppercase tracking-wider">
                        <Shield size={14} /> Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-1 border-b border-green-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleBan(user.id, !user.is_banned)}
                        className={`p-2 rounded-lg transition-all ${user.is_banned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        title={user.is_banned ? 'Mở khóa' : 'Khóa tài khoản'}
                      >
                        {user.is_banned ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <UserX size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
