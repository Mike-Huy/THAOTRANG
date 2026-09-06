import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingBag, 
  Calendar, 
  Zap, 
  Mail, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/admin/users', icon: Users, label: 'Người dùng' },
    { path: '/admin/posts', icon: FileText, label: 'Bài đăng' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Sản phẩm' },
    { path: '/admin/bookings', icon: Calendar, label: 'Đặt sân' },
    { path: '/admin/activities', icon: Zap, label: 'Hoạt động' },
    { path: '/admin/about', icon: Globe, label: 'Trang Giới thiệu' },
    { path: '/admin/contacts', icon: Mail, label: 'Liên hệ' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0d1117] text-white transition-all duration-300 flex flex-col sticky top-0 h-screen z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-xl tracking-tighter text-[#00c853]"
            >
              TTQ6<span className="text-white">ADMIN</span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 bg-[#00c853] rounded-lg flex items-center justify-center font-bold">T</div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[#00c853] text-white shadow-lg shadow-[#00c853]/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-[#00c853] transition-colors'} />
                {isSidebarOpen && (
                  <span className="font-bold text-[11px] uppercase tracking-wider">{item.label}</span>
                )}
                {!isSidebarOpen && (
                   <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-[11px] uppercase tracking-wider">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-[#0d1117] font-bold">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white border border-[#008200]/20 text-xs font-bold transition-all shadow-sm"
              title="Mở trang chủ website trong tab mới"
            >
              <ExternalLink size={15} />
              <span>Xem website</span>
            </a>

            <button className="relative p-2 text-gray-400 hover:text-[#00c853] transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight">
                  {profile?.role === 'super_admin' ? 'Admin' : (profile?.username || 'Admin')}
                </div>
                <div className="text-[10px] font-bold text-[#00c853] uppercase tracking-widest">
                  {profile?.role === 'super_admin' ? 'Quản trị viên' : profile?.role}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c853] to-[#008200] flex items-center justify-center text-white font-black shadow-lg shadow-[#00c853]/20">
                {profile?.role === 'super_admin' ? 'A' : (profile?.username?.[0]?.toUpperCase() || 'A')}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <AnimatePresence mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
