import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Mail, Lock, ArrowRight, AlertCircle, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, profile, loading: authLoading, signIn, signUpAndSignIn, signOut, isStaff } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const finalEmail = identifier.includes('@')
        ? identifier
        : `${identifier}@thaotrangq6.com`;

      if (isLogin) {
        const { error: authError } = await signIn(finalEmail, password);
        if (authError) {
          setError('Sai tài khoản hoặc mật khẩu.');
        }
      } else {
        const username = identifier.includes('@') ? identifier.split('@')[0] : identifier;
        const { error: authError, needsConfirm } = await signUpAndSignIn(finalEmail, password, { username });

        if (authError) {
          setError(authError.message);
        } else if (needsConfirm) {
          setSuccessMsg(`Đã gửi email xác nhận tới ${finalEmail}. Vui lòng kiểm tra hộp thư rồi đăng nhập lại.`);
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('Lỗi hệ thống: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  // Handle redirect after login if we are in the login popup
  useEffect(() => {
    // Wait until profile loading is finished (!authLoading)
    if (showLogin && user && !authLoading) {
      if (profile) {
        const staffRoles = ['super_admin', 'admin', 'staff'];
        if (staffRoles.includes(profile.role)) {
          setShowLogin(false);
          navigate('/admin');
        } else {
          // Regular customer - just close the popup
          setShowLogin(false);
        }
      } else {
        // User is logged in but profile was not found in DB
        setShowLogin(false);
      }
    }
  }, [user, profile, authLoading, showLogin, navigate]);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Giới thiệu', path: '/gioi-thieu' },
    { name: 'Sản phẩm', path: '/san-pham' },
    { name: 'Đặt sân', path: '/dat-san' },
    { name: 'Hoạt động', path: '/hoat-dong' },
    { name: 'Tin tức', path: '/tin-tuc' },
    { name: 'Liên hệ', path: '/lien-he' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white shadow-sm py-1`}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-base transition-all duration-300 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #00c853, #008200)',
                boxShadow: '0 4px 12px rgba(0,200,83,0.3)'
              }}
            >
              TT
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-tight text-gray-900">
                THAOTRANG
              </span>
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#008200]">
                Badminton
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-[#008200] text-white shadow-lg shadow-green-900/20'
                    : 'text-black hover:text-[#008200] hover:bg-green-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {!(user || profile) ? (
              <button 
                onClick={() => {
                  setIsLogin(true);
                  setShowLogin(true);
                  setError('');
                }}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                    {profile?.username || user?.email?.split('@')[0] || 'Thành viên'}
                  </span>
                  <span className="text-[8px] font-bold text-[#00c853] uppercase tracking-[0.2em]">
                    {profile?.role === 'customer' ? 'Thành viên' : (profile?.role || 'User')}
                  </span>
                </div>
                
                <button 
                  onClick={() => navigate(isStaff ? '/admin' : '/')}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00c853] to-[#008200] flex items-center justify-center text-white border border-white/10 shadow-lg shadow-green-900/20 hover:scale-105 transition-all"
                >
                  <span className="text-xs font-black">
                    {(profile?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </span>
                </button>

                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-900 hover:bg-gray-100 transition-all"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-gray-100 shadow-2xl"
            >
              <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-all ${
                      isActive(link.path)
                        ? 'text-[#008200]'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={isActive(link.path) ? {
                      background: 'linear-gradient(135deg, rgba(0,200,83,0.1), rgba(0,130,0,0.05))',
                      boxShadow: 'inset 3px 0 0 #00c853'
                    } : {}}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/dat-san"
                  className="btn-primary mt-4 justify-center"
                >
                  Đặt sân ngay
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login/Register Popup */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowLogin(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#008200] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-900/20">
                    {isLogin ? <Lock size={28} /> : <User size={28} />}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                  </h2>
                  <p className="text-black/80 text-xs mt-2">
                    {isLogin ? 'Truy cập tài khoản Thảo Trang Badminton' : 'Tạo tài khoản thành viên mới'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-xl text-[10px] font-bold flex items-start gap-2">
                      <Mail size={14} className="mt-0.5 flex-shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">nickname / SDT</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        placeholder="Hãy nhập nickname hoặc số điện thoại"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#008200] focus:bg-white transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => alert("Liên hệ hotline 0909 111 222, chúng tôi sẽ hỗ trợ bạn ngay lập tức !!!")}
                      className="text-xs font-bold text-[#008200] hover:underline block ml-auto"
                    >
                      Quên mật khẩu?
                    </button>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 text-sm mt-2 shadow-lg shadow-green-900/20 disabled:opacity-50"
                  >
                    {loading ? 'Đang xác thực...' : (isLogin ? 'Đăng nhập ngay' : 'Đăng ký ngay')} <ArrowRight size={18} />
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-black">
                    {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} {' '}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[#008200] font-black hover:underline"
                    >
                      {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
