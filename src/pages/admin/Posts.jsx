import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  ExternalLink,
  MoreVertical,
  Tag
} from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Posts = () => {
  const { posts, loading, error, toggleStatus, deletePost } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-50 text-green-600 border-green-100',
      draft: 'bg-gray-100 text-gray-500 border-gray-200',
      archived: 'bg-red-50 text-red-600 border-red-100'
    };
    const labels = {
      published: 'Đã xuất bản',
      draft: 'Bản nháp',
      archived: 'Lưu trữ'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getCategoryBadge = (cat) => {
    const colors = {
      news: 'text-blue-500',
      event: 'text-purple-500',
      promotion: 'text-orange-500',
      guide: 'text-green-500'
    };
    return (
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${colors[cat] || 'text-gray-400'}`}>
        <Tag size={12} />
        {cat}
      </div>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý bài đăng</h1>
          <p className="text-gray-500 text-sm">Viết tin tức, sự kiện và hướng dẫn cho người dùng.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          <span>Viết bài mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm tiêu đề bài viết..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00c853]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="news">Tin tức</option>
              <option value="event">Sự kiện</option>
              <option value="promotion">Khuyến mãi</option>
              <option value="guide">Hướng dẫn</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8">
                      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                        {post.cover_url ? (
                          <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight truncate">{post.title}</div>
                        <div className="text-[10px] text-gray-400 truncate italic mt-0.5">{post.excerpt || 'Không có mô tả ngắn...'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(post.category)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <User size={12} className="text-[#00c853]" />
                      {post.author_id ? 'Admin' : 'Ẩn danh'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      {post.published_at ? format(new Date(post.published_at), 'dd/MM/yyyy', { locale: vi }) : '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa bài viết này?')) deletePost(post.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-gray-100 rounded-lg transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredPosts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
