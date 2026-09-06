import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [msg, setMsg]           = useState('');
  const { signIn, profile, loading } = useAuth();

  // Only redirect to admin if the user has a valid admin/staff role
  // This prevents infinite loops for 'customer' roles
  if (!loading && profile?.role) {
    const isStaff = ['super_admin', 'admin', 'staff'].includes(profile.role);
    if (isStaff) {
      return <Navigate to="/admin" replace />;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('Đang đăng nhập...');
    
    const finalEmail = identifier.includes('@') 
      ? identifier 
      : `${identifier}@thaotrangq6.com`;

    const { error } = await signIn(finalEmail, password);
    if (error) {
      setMsg('Lỗi: ' + error.message);
    } else {
      setMsg('Đăng nhập thành công! Đang kiểm tra quyền hạn...');
      // Note: Redirect will be handled by the useEffect above once profile loads
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00c853] mb-4 shadow-lg shadow-[#00c853]/30">
            <span className="text-white font-black text-2xl">T</span>
          </div>
          <h1 className="text-white font-black text-xl uppercase tracking-tight">
            TTQ6 <span className="text-[#00c853]">ADMIN</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Đăng nhập để quản trị hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161b22] rounded-2xl p-8 border border-white/5 space-y-5">
          {msg && (
            <div className={`text-xs font-bold px-4 py-3 rounded-xl ${msg.startsWith('Lỗi') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
              {msg}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">nickname / SDT</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              placeholder="Hãy nhập nickname hoặc số điện thoại"
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00c853] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00c853] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00c853] hover:bg-[#00a846] text-white font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
