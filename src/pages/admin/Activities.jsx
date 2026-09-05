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
  Clock,
  X,
  Save,
  Image,
  Coins,
  Upload
} from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { supabase } from '../../lib/supabase';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Activities = () => {
  const { 
    activities, 
    loading, 
    error, 
    createActivity, 
    updateActivity, 
    deleteActivity 
  } = useActivities();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExt.toLowerCase())) {
      return alert('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF');
    }

    setIsUploading(true);

    try {
      const fileName = `activities/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('thaotrang')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('thaotrang').getPublicUrl(fileName);
      if (data?.publicUrl) {
        setFormData(prev => ({ ...prev, cover_url: data.publicUrl }));
      }
    } catch (error) {
      console.error('Lỗi tải ảnh:', error);
      alert('Lỗi tải ảnh: ' + (error.message || error));
    } finally {
      setIsUploading(false);
    }
  };

  // Form State
  const initialFormState = {
    id: null,
    title: '',
    slug: '',
    description: '',
    content: '',
    cover_url: '',
    type: 'tournament',
    status: 'upcoming',
    start_date: '',
    end_date: '',
    location: 'Sân cầu lông Thảo Trang, Quận 6',
    max_participants: 30,
    current_participants: 0,
    fee: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const typeLabels = {
    tournament: 'Giải đấu chuyên nghiệp',
    training: 'Luyện tập hàng ngày',
    community: 'Cộng đồng badminton',
    other: 'Khác'
  };

  const statusLabels = {
    upcoming: 'Sắp diễn ra',
    ongoing: 'Đang diễn ra',
    completed: 'Đã kết thúc',
    cancelled: 'Đã hủy'
  };

  const filteredActivities = activities.filter(act => 
    act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
      ongoing: 'bg-green-50 text-green-600 border-green-100',
      completed: 'bg-gray-100 text-gray-500 border-gray-200',
      cancelled: 'bg-red-50 text-red-600 border-red-100'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.upcoming}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const slugify = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : slugify(val) // only auto-slugify if new
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act) => {
    setFormData({
      id: act.id,
      title: act.title || '',
      slug: act.slug || '',
      description: act.description || '',
      content: act.content || '',
      cover_url: act.cover_url || '',
      type: act.type || 'tournament',
      status: act.status || 'upcoming',
      start_date: formatForDateTimeLocal(act.start_date),
      end_date: formatForDateTimeLocal(act.end_date),
      location: act.location || 'Sân cầu lông Thảo Trang, Quận 6',
      max_participants: act.max_participants || 30,
      current_participants: act.current_participants || 0,
      fee: act.fee || 0
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      description: formData.description,
      content: formData.content,
      cover_url: formData.cover_url,
      type: formData.type,
      status: formData.status,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      location: formData.location,
      max_participants: parseInt(formData.max_participants) || null,
      current_participants: parseInt(formData.current_participants) || 0,
      fee: parseFloat(formData.fee) || 0
    };

    if (!payload.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề hoạt động');
      setIsSubmitting(false);
      return;
    }

    try {
      let res;
      if (formData.id) {
        res = await updateActivity(formData.id, payload);
      } else {
        res = await createActivity(payload);
      }

      if (res.error) {
        setFormError(res.error.message || res.error);
      } else {
        handleCloseModal();
      }
    } catch (err) {
      setFormError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý hoạt động</h1>
          <p className="text-gray-500 text-sm">Quản lý các sự kiện, buổi giao lưu và giải đấu tại sân.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary">
          <Plus size={16} />
          <span>Tạo hoạt động mới</span>
        </button>
      </div>

      {/* Main Table Card */}
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
                <th className="px-6 py-4">Phí tham gia</th>
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
              ) : filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100 shrink-0">
                        {act.cover_url ? (
                          <img src={act.cover_url} alt={act.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#00c853]/10 flex items-center justify-center text-[#00c853]">
                            <Zap size={20} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight line-clamp-1">{act.title}</div>
                        <div className="text-[9px] text-[#00c853] font-bold uppercase tracking-wider mt-0.5">
                          {typeLabels[act.type] || act.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700">
                        <Calendar size={12} className="text-gray-400" />
                        {act.start_date ? format(new Date(act.start_date), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="line-clamp-1">{act.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0d1117]">
                      <Users size={14} className="text-[#00c853]" />
                      {act.current_participants || 0} / {act.max_participants || '∞'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-xs text-gray-700">
                    {act.fee > 0 ? `${act.fee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(act.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(act)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa hoạt động này?')) deleteActivity(act.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
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

      {/* Editing / Creating Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-base font-black text-[#0d1117] uppercase tracking-tight flex items-center gap-2">
                  <Zap size={18} className="text-[#00c853]" fill="currentColor" />
                  {formData.id ? 'Cập nhật hoạt động' : 'Tạo hoạt động mới'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Nhập đầy đủ thông tin để hiển thị hoạt động trên trang chủ.</p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Tiêu đề hoạt động</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Giải Vô Địch Cầu Lông Mở Rộng 2026"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
                      value={formData.title}
                      onChange={handleTitleChange}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Đường dẫn tĩnh (Slug)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="giai-vo-dich-cau-long-mo-rong"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all text-gray-500"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  {/* Row: Type and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Chuyên mục</label>
                      <select 
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#00c853] transition-all"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="tournament">Giải đấu chuyên nghiệp</option>
                        <option value="training">Luyện tập hàng ngày</option>
                        <option value="community">Cộng đồng badminton</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Trạng thái</label>
                      <select 
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#00c853] transition-all"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra</option>
                        <option value="completed">Đã kết thúc</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Date Start and Date End */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Ngày bắt đầu</label>
                      <input 
                        type="datetime-local" 
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all text-gray-700"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Ngày kết thúc</label>
                      <input 
                        type="datetime-local" 
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all text-gray-700"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Địa điểm tổ chức</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Sân Số 1 - 5, Thảo Trang Badminton"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Fee and Participants */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Lệ phí (VND)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all"
                        value={formData.fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Tối đa (người)</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Không giới hạn"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all"
                        value={formData.max_participants || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Hiện tại (người)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all"
                        value={formData.current_participants}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_participants: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Cover Image URL */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Ảnh bìa hoạt động</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="url" 
                        placeholder="https://images.unsplash.com/... hoặc dán URL/chọn ảnh"
                        className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all"
                        value={formData.cover_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, cover_url: e.target.value }))}
                      />
                      <label className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white border border-[#008200]/20 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm">
                        <Upload size={14} />
                        <span>{isUploading ? 'Đang tải...' : 'Tải ảnh'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    
                    {/* Image Preview Container */}
                    <div className="mt-2 aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-200 overflow-hidden relative flex items-center justify-center text-gray-400">
                      {formData.cover_url ? (
                        <img 
                          src={formData.cover_url} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Image size={24} className="opacity-40" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ảnh xem trước</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Mô tả ngắn</label>
                    <textarea 
                      rows="2"
                      placeholder="Tóm tắt ngắn gọn hoạt động này để hiện ngoài danh sách..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Full Content (RichText Editor) */}
                  <div className="flex-1 min-h-[220px] flex flex-col">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Nội dung chi tiết (Rich Text / HTML)</label>
                    <RichTextEditor 
                      value={formData.content} 
                      onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                      placeholder="Mô tả chi tiết chương trình, điều lệ tham gia..."
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00a300] disabled:bg-gray-300 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md shadow-green-600/10 hover:shadow-lg transition-all duration-300"
              >
                <Save size={14} />
                <span>{isSubmitting ? 'Đang lưu...' : 'Lưu hoạt động'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
