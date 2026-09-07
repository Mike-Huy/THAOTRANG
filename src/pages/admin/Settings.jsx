import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign, 
  Share2,
  AtSign,
  Save,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Shield,
  Users,
  Settings as SettingsIcon,
  ChevronRight,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Upload,
  X,
  FolderOpen,
  RefreshCw,
  Check
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Component duyệt & chọn ảnh từ Supabase bucket ───────────────────────────
const BucketImagePicker = ({ bucket = 'thaotrang', onSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      // Lấy tất cả file trong bucket (đệ quy tối đa 2 cấp folder)
      const fetchFolder = async (prefix = '') => {
        const { data, error } = await supabase.storage.from(bucket).list(prefix, {
          limit: 200,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });
        if (error) throw error;
        return (data || []).map(item => ({
          ...item,
          fullPath: prefix ? `${prefix}/${item.name}` : item.name,
        }));
      };

      const rootItems = await fetchFolder('');
      const allImages = [];

      for (const item of rootItems) {
        if (!item.id && item.name) {
          // Đây là folder — lấy nội dung bên trong
          const subItems = await fetchFolder(item.name);
          subItems.forEach(sub => {
            const ext = sub.name.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(sub.fullPath);
              allImages.push({ name: sub.name, path: sub.fullPath, url: urlData?.publicUrl || '' });
            }
          });
        } else {
          const ext = item.name.split('.').pop()?.toLowerCase();
          if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(item.fullPath);
            allImages.push({ name: item.name, path: item.fullPath, url: urlData?.publicUrl || '' });
          }
        }
      }

      setImages(allImages);
    } catch (err) {
      console.error('Lỗi tải danh sách ảnh:', err);
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const filtered = images.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00c853]/10 rounded-xl text-[#00c853]">
              <FolderOpen size={18} />
            </div>
            <div>
              <h3 className="font-black text-[#0d1117] text-sm uppercase tracking-wide">Chọn ảnh từ bucket</h3>
              <p className="text-[10px] text-gray-400 font-medium">Bucket: <span className="text-[#008200] font-black">{bucket}</span> — {images.length} ảnh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchImages} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all" title="Làm mới">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c853]/30 focus:border-[#00c853]/50 bg-gray-50"
            placeholder="Tìm kiếm theo tên file hoặc thư mục..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RefreshCw size={28} className="animate-spin mb-3 text-[#00c853]" />
              <p className="text-xs font-bold uppercase tracking-widest">Đang tải danh sách ảnh...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageIcon size={32} className="mb-3 opacity-40" />
              <p className="text-xs font-bold uppercase tracking-widest">{searchQuery ? 'Không tìm thấy ảnh phù hợp' : 'Bucket trống hoặc không có ảnh'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((img) => (
                <button
                  key={img.path}
                  type="button"
                  onClick={() => setSelected(img)}
                  className={`relative group rounded-xl overflow-hidden border-2 aspect-square transition-all duration-200 ${
                    selected?.path === img.path
                      ? 'border-[#00c853] shadow-lg shadow-[#00c853]/20 scale-[1.02]'
                      : 'border-gray-200 hover:border-[#00c853]/50 hover:shadow-md'
                  }`}
                  title={img.path}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {selected?.path === img.path && (
                    <div className="absolute inset-0 bg-[#00c853]/20 flex items-center justify-center">
                      <div className="bg-[#00c853] rounded-full p-1">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white font-bold truncate">{img.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between shrink-0">
          {selected ? (
            <div className="flex items-center gap-2 text-[#008200]">
              <Check size={14} />
              <span className="text-xs font-bold truncate max-w-[300px]">{selected.path}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Chưa chọn ảnh nào</span>
          )}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-100 border border-gray-200 transition-all">
              Hủy
            </button>
            <button
              onClick={() => { if (selected) { onSelect(selected.url); onClose(); } }}
              disabled={!selected}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#00c853] hover:bg-[#008200] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#00c853]/20"
            >
              Chọn ảnh này
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Component upload ảnh (máy tính + bucket) ────────────────────────────────
const ImageUploadField = ({ label, value, onChange, fieldKey, bucket = 'thaotrang', folder = 'settings' }) => {
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleUploadFromPC = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
      return alert('Chỉ chấp nhận: JPG, JPEG, PNG, WEBP, GIF');
    }
    setUploading(true);
    try {
      const fileName = `${folder}/${fieldKey}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (data?.publicUrl) onChange(data.publicUrl);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Lỗi: ' + (err.message || err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
      )}

      {/* URL Input */}
      <div className="flex gap-2 items-stretch">
        <input
          type="text"
          className="input-field flex-1 text-xs"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán URL ảnh hoặc chọn file bên phải..."
        />

        {/* Upload từ máy tính */}
        <label
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            uploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait'
              : 'bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white border-[#008200]/20'
          }`}
          title="Tải lên từ máy tính"
        >
          <Upload size={14} />
          <span className="hidden sm:inline">{uploading ? 'Đang tải...' : 'Máy tính'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleUploadFromPC}
          />
        </label>

        {/* Chọn từ bucket Supabase */}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200"
          title="Chọn từ bucket Supabase"
        >
          <FolderOpen size={14} />
          <span className="hidden sm:inline">Bucket</span>
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mt-1 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Xóa ảnh"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Bucket Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <BucketImagePicker
            bucket={bucket}
            onSelect={onChange}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Trình chỉnh sửa danh sách JSON động (milestones, why_us, home_gallery) ──
const ListEditor = ({ items = [], onChange, fields = [] }) => {
  const [uploadingState, setUploadingState] = useState({});

  const handleItemChange = (index, key, val) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleUpload = async (index, key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExt.toLowerCase())) {
      return alert('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF');
    }

    const stateKey = `${index}_${key}`;
    setUploadingState(prev => ({ ...prev, [stateKey]: true }));

    try {
      const fileName = `gallery/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('thaotrang')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('thaotrang').getPublicUrl(fileName);
      if (data?.publicUrl) {
        handleItemChange(index, key, data.publicUrl);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Lỗi tải ảnh: ' + (err.message || err));
    } finally {
      setUploadingState(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  const handleAddItem = () => {
    const newItem = {};
    fields.forEach(f => { newItem[f.key] = f.default || ''; });
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveItem = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const currentItems = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-4">
      {currentItems.map((item, index) => (
        <div 
          key={index} 
          className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3 relative group transition-all hover:border-[#00c853]/40 hover:shadow-md"
        >
          {/* Card Header with Item Number & Actions */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2">
            <span className="text-xs font-black text-[#008200] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-green-100 text-[#008200] flex items-center justify-center text-[10px] font-black">
                {index + 1}
              </span>
              <span>{item.title || item.year || `Mục #${index + 1}`}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMoveItem(index, 'up')}
                disabled={index === 0}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 disabled:opacity-30 border border-gray-200 transition-all"
                title="Di chuyển lên"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveItem(index, 'down')}
                disabled={index === currentItems.length - 1}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 disabled:opacity-30 border border-gray-200 transition-all"
                title="Di chuyển xuống"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-all ml-1"
                title="Xóa mục này"
              >
                <Trash size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    className="input-field min-h-[60px] resize-none"
                    value={item[f.key] || ''}
                    onChange={(e) => handleItemChange(index, f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'image' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="input-field flex-1"
                        value={item[f.key] || ''}
                        onChange={(e) => handleItemChange(index, f.key, e.target.value)}
                        placeholder={f.placeholder || 'Dán URL ảnh hoặc chọn file...'}
                      />
                      <label className="flex items-center gap-1.5 px-3 py-2.5 bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white border border-[#008200]/20 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0">
                        <Upload size={14} />
                        <span>{uploadingState[`${index}_${f.key}`] ? 'Đang tải...' : 'Tải ảnh'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingState[`${index}_${f.key}`]}
                          onChange={(e) => handleUpload(index, f.key, e)}
                        />
                      </label>
                    </div>
                    {item[f.key] && (
                      <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mt-1 shadow-sm">
                        <img src={item[f.key]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="input-field"
                    value={item[f.key] || ''}
                    onChange={(e) => handleItemChange(index, f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {currentItems.length === 0 && (
        <p className="text-center py-4 text-xs text-gray-400 font-bold uppercase tracking-wider border border-dashed border-gray-200 rounded-xl">
          Chưa có mục nào. Hãy bấm thêm mục mới bên dưới.
        </p>
      )}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#00c853]/30 hover:border-[#00c853]/60 rounded-xl text-xs font-black text-[#00c853] uppercase tracking-widest bg-green-50/10 hover:bg-green-50/30 transition-all duration-300"
      >
        <Plus size={14} />
        <span>Thêm mục mới</span>
      </button>
    </div>
  );
};

const Settings = () => {
  const { settings, loading, error, updateMany } = useSettings();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  const handleSettingImageUpload = async (key, setUploading, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt.toLowerCase())) {
      return alert('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF');
    }
    setUploading(true);
    try {
      const fileName = `settings/${key}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('thaotrang')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('thaotrang').getPublicUrl(fileName);
      if (data?.publicUrl) handleChange(key, data.publicUrl);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Lỗi tải ảnh: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (settings) {
      const defaultGallery = [
        { title: 'Giải đấu chuyên nghiệp', image_url: '' },
        { title: 'Luyện tập hàng ngày', image_url: '' },
        { title: 'Cộng đồng badminton', image_url: '' }
      ];

      // Chuẩn hóa gallery: chấp nhận cả array lẫn JSON string (dữ liệu cũ bị lưu sai type)
      let gallery = settings.home_gallery;
      if (typeof gallery === 'string') {
        try { gallery = JSON.parse(gallery); } catch { gallery = null; }
      }

      setFormData({
        ...settings,
        home_gallery: (Array.isArray(gallery) && gallery.length > 0) ? gallery : defaultGallery,
      });
    }
  }, [settings]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Truyền formData trực tiếp — updateMany tự nhận diện type (object/array → json, string → string)
    const { error } = await updateMany(formData);
    if (error) alert('Lỗi: ' + (error.message || JSON.stringify(error)));
    else alert('Đã lưu cấu hình hệ thống thành công!');
    setIsSaving(false);
  };

  if (loading) return <div className="p-10 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Đang tải cấu hình cài đặt...</div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  const tabs = [
    { id: 'permissions', label: 'Phân quyền', icon: Shield, description: 'Quản lý quyền truy cập menu và chức năng' },
    { id: 'general', label: 'Cơ bản', icon: SettingsIcon, description: 'Cấu hình thông tin cơ bản' },
    { id: 'home', label: 'Trang chủ', icon: Globe, description: 'Nội dung hiển thị ngoài Trang chủ' },
    { id: 'about', label: 'Giới thiệu', icon: Globe, description: 'Nội dung hiển thị ngoài trang Giới thiệu' },
    { id: 'roles', label: 'ROLE', icon: Users, description: 'Quản lý nhóm quyền và gán quyền cho user' },
  ];

  // Các trường cài đặt cơ bản
  const generalSections = [
    {
      id: 'general_info',
      title: 'Thông tin chung',
      icon: Globe,
      fields: [
        { key: 'site_name', label: 'Tên Website', type: 'text', placeholder: 'VD: Thảo Trang Badminton' },
        { key: 'site_tagline', label: 'Slogan / Khẩu hiệu', type: 'text', placeholder: 'Slogan...' },
      ]
    },
    {
      id: 'contact',
      title: 'Thông tin liên hệ',
      icon: Smartphone,
      fields: [
        { key: 'contact_phone', label: 'Số điện thoại', type: 'text', icon: Phone },
        { key: 'contact_email', label: 'Email liên hệ', type: 'text', icon: Mail },
        { key: 'contact_address', label: 'Địa chỉ', type: 'text', icon: MapPin },
        { key: 'contact_map_url', label: 'Google Maps Link', type: 'text', icon: MapPin },
      ]
    },
    {
      id: 'business',
      title: 'Vận hành',
      icon: Clock,
      fields: [
        { key: 'business_hours', label: 'Giờ hoạt động', type: 'text', placeholder: 'VD: 06:00 - 22:00' },
        { key: 'booking_open_days', label: 'Đặt trước tối đa (ngày)', type: 'number' },
        { key: 'booking_min_hours', label: 'Giờ đặt tối thiểu', type: 'number' },
      ]
    },
    {
      id: 'social',
      title: 'Mạng xã hội',
      icon: Share2,
      fields: [
        { key: 'social_facebook', label: 'Facebook URL', type: 'text', icon: Share2 },
        { key: 'social_zalo', label: 'Số Zalo', type: 'text', icon: Phone },
        { key: 'social_tiktok', label: 'TikTok URL', type: 'text', icon: AtSign },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-gray-500 text-sm">Quản lý nội dung website public, quyền hạn và phân vai trò người dùng.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-[#00c853] shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {generalSections.map(section => (
                <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <section.icon size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">{section.title}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {section.fields.map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          {field.icon && <field.icon size={12} />}
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea 
                            className="input-field min-h-[80px] resize-none"
                            value={formData[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input 
                            type={field.type}
                            className="input-field"
                            value={formData[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HOME PAGE CONTENT */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cấu hình Hero Banner */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <Globe size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Nội dung Banner chính (Hero)</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề Banner</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={formData['home_hero_title'] || ''}
                        onChange={(e) => handleChange('home_hero_title', e.target.value)}
                        placeholder="VD: NÂNG TẦM ĐAM MÊ CẦU LÔNG"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả Banner</label>
                      <textarea 
                        className="input-field min-h-[100px] resize-none"
                        value={formData['home_hero_subtitle'] || ''}
                        onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
                        placeholder="Nội dung mô tả ngắn xuất hiện dưới tiêu đề..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh nền Banner</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          className="input-field flex-1"
                          value={formData['home_hero_image_url'] || ''}
                          onChange={(e) => handleChange('home_hero_image_url', e.target.value)}
                          placeholder="Dán URL ảnh hoặc chọn file..."
                        />
                        <label className="flex items-center gap-1.5 px-3 py-2.5 bg-green-50 text-[#008200] hover:bg-[#008200] hover:text-white border border-[#008200]/20 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0">
                          <Upload size={14} />
                          <span>{uploadingHero ? 'Đang tải...' : 'Tải ảnh'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingHero}
                            onChange={(e) => handleSettingImageUpload('home_hero_image_url', setUploadingHero, e)}
                          />
                        </label>
                      </div>
                      {formData['home_hero_image_url'] && (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mt-1">
                          <img src={formData['home_hero_image_url']} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gallery (Hoạt động tại sân) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Hoạt động tại sân (Gallery Trang chủ)</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Thay đổi hình ảnh và tiêu đề cho các thẻ hoạt động ngoài Trang chủ</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <ListEditor
                      items={formData['home_gallery'] || [
                        { title: 'Giải đấu chuyên nghiệp', image_url: '' },
                        { title: 'Luyện tập hàng ngày', image_url: '' },
                        { title: 'Cộng đồng badminton', image_url: '' }
                      ]}
                      onChange={(val) => handleChange('home_gallery', val)}
                      fields={[
                        { key: 'title', label: 'Tiêu đề hoạt động', placeholder: 'VD: Giải đấu chuyên nghiệp' },
                        { key: 'image_url', label: 'Hình ảnh hoạt động', type: 'image', placeholder: 'Dán URL hoặc chọn ảnh...' }
                      ]}
                    />
                  </div>
                </div>

                {/* Why Choose Us (Trang chủ) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <ShieldCheck size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Đặc sắc / Lý do chọn (Trang chủ)</h3>
                  </div>
                  <div className="p-6">
                    <ListEditor
                      items={formData['home_why_us'] || []}
                      onChange={(val) => handleChange('home_why_us', val)}
                      fields={[
                        { key: 'title', label: 'Tiêu đề cột', placeholder: 'VD: Sân Chuẩn BWF' },
                        { key: 'desc', label: 'Nội dung chi tiết', type: 'textarea', placeholder: 'Mô tả ngắn gọn về đặc sắc này...' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Stats Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <Clock size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Chỉ số nổi bật</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số học viên</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={formData['home_stats_students'] || ''}
                        onChange={(e) => handleChange('home_stats_students', e.target.value)}
                        placeholder="VD: 500+"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số giải đấu/năm</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={formData['home_stats_tournaments'] || ''}
                        onChange={(e) => handleChange('home_stats_tournaments', e.target.value)}
                        placeholder="VD: 12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số sân đạt chuẩn BWF</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={formData['home_stats_courts'] || ''}
                        onChange={(e) => handleChange('home_stats_courts', e.target.value)}
                        placeholder="VD: 9"
                      />
                    </div>
                  </div>
                </div>

                {/* Partners List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <Users size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Đối tác chiến lược</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách (ngăn cách bởi dấu phẩy)</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={Array.isArray(formData['home_partners']) ? formData['home_partners'].join(', ') : (formData['home_partners'] || '')}
                        onChange={(e) => {
                          const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          handleChange('home_partners', arr);
                        }}
                        placeholder="VD: Yonex, Victor, Li-Ning"
                      />
                      <p className="text-[9px] text-gray-400">Các đối tác này sẽ hiển thị cuộn chéo ở chân trang chủ.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT PAGE CONTENT */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Giới thiệu chung */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <Globe size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Giới thiệu chung</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề Giới thiệu</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={formData['about_title'] || ''}
                        onChange={(e) => handleChange('about_title', e.target.value)}
                        placeholder="VD: THAOTRANG GROUP - ĐA NGÀNH NGHỀ..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đoạn giới thiệu 1</label>
                      <textarea 
                        rows={4}
                        className="input-field min-h-[120px] resize-none"
                        value={formData['about_description_p1'] || ''}
                        onChange={(e) => handleChange('about_description_p1', e.target.value)}
                        placeholder="Mô tả quá trình hình thành..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đoạn giới thiệu 2</label>
                      <textarea 
                        rows={2}
                        className="input-field min-h-[80px] resize-none"
                        value={formData['about_description_p2'] || ''}
                        onChange={(e) => handleChange('about_description_p2', e.target.value)}
                        placeholder="Mô tả phương châm phục vụ..."
                      />
                    </div>
                    <ImageUploadField
                      label="Ảnh Giới thiệu"
                      value={formData['about_image_url'] || ''}
                      onChange={(url) => handleChange('about_image_url', url)}
                      fieldKey="about_image_url"
                      bucket="thaotrang"
                      folder="settings"
                    />
                  </div>
                </div>

                {/* Milestones (Hành trình) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <Clock size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Hành trình & Cột mốc phát triển</h3>
                  </div>
                  <div className="p-6">
                    <ListEditor
                      items={formData['about_milestones'] || []}
                      onChange={(val) => handleChange('about_milestones', val)}
                      fields={[
                        { key: 'year', label: 'Năm cột mốc', placeholder: 'VD: 2026' },
                        { key: 'title', label: 'Tiêu đề cột mốc', placeholder: 'VD: Thành lập Thảo Trang' },
                        { key: 'desc', label: 'Nội dung cột mốc', type: 'textarea', placeholder: 'Mô tả chi tiết về cột mốc này...' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Giá trị cốt lõi */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <ShieldCheck size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Sứ mệnh - Tầm nhìn</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Sứ mệnh */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#00c853] uppercase tracking-widest">Sứ mệnh</label>
                      <input 
                        type="text"
                        className="input-field font-bold"
                        value={formData['about_mission_title'] || ''}
                        onChange={(e) => handleChange('about_mission_title', e.target.value)}
                        placeholder="Tiêu đề Sứ mệnh"
                      />
                      <textarea 
                        className="input-field min-h-[60px] mt-1 text-xs"
                        value={formData['about_mission_desc'] || ''}
                        onChange={(e) => handleChange('about_mission_desc', e.target.value)}
                        placeholder="Nội dung Sứ mệnh..."
                      />
                    </div>
                    <hr className="border-gray-100" />
                    {/* Tầm nhìn */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#00c853] uppercase tracking-widest">Tầm nhìn</label>
                      <input 
                        type="text"
                        className="input-field font-bold"
                        value={formData['about_vision_title'] || ''}
                        onChange={(e) => handleChange('about_vision_title', e.target.value)}
                        placeholder="Tiêu đề Tầm nhìn"
                      />
                      <textarea 
                        className="input-field min-h-[60px] mt-1 text-xs"
                        value={formData['about_vision_desc'] || ''}
                        onChange={(e) => handleChange('about_vision_desc', e.target.value)}
                        placeholder="Nội dung Tầm nhìn..."
                      />
                    </div>
                    <hr className="border-gray-100" />
                    {/* Giá trị cốt lõi */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#00c853] uppercase tracking-widest">Giá trị cốt lõi</label>
                      <input 
                        type="text"
                        className="input-field font-bold"
                        value={formData['about_values_title'] || ''}
                        onChange={(e) => handleChange('about_values_title', e.target.value)}
                        placeholder="Tiêu đề Giá trị cốt lõi"
                      />
                      <textarea 
                        className="input-field min-h-[60px] mt-1 text-xs"
                        value={formData['about_values_desc'] || ''}
                        onChange={(e) => handleChange('about_values_desc', e.target.value)}
                        placeholder="Nội dung Giá trị..."
                      />
                    </div>
                  </div>
                </div>

                {/* Why Us (Trang giới thiệu) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00c853]/10 text-[#00c853]">
                      <ShieldCheck size={18} />
                    </div>
                    <h3 className="font-black text-[#0d1117] text-xs uppercase tracking-widest">Lý do chọn (Giới thiệu)</h3>
                  </div>
                  <div className="p-6">
                    <ListEditor
                      items={formData['about_why_us'] || []}
                      onChange={(val) => handleChange('about_why_us', val)}
                      fields={[
                        { key: 'title', label: 'Lý do', placeholder: 'VD: Chất lượng hàng đầu' },
                        { key: 'desc', label: 'Giải thích chi tiết', type: 'textarea', placeholder: 'Mô tả ngắn...' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <Shield size={40} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-[#0d1117] uppercase">Quản lý Phân quyền</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Giao diện thiết lập quyền truy cập cho từng chức năng (CRUD) và menu trong hệ thống.
                  Tính năng này cho phép tùy chỉnh chi tiết từng hành động của người dùng.
                </p>
                <button className="btn-primary mt-6 mx-auto">
                  <Plus size={16} />
                  <span>Thêm quyền mới</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ROLES */}
          {activeTab === 'roles' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-500">
                <Users size={40} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-[#0d1117] uppercase">Quản lý Vai trò (Roles)</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Tạo mới các nhóm vai trò (VD: Quản lý sân, Kế toán, Nhân viên trực ca) 
                  và gán bộ quyền hạn tương ứng cho người dùng.
                </p>
                <button className="btn-primary mt-6 mx-auto">
                  <Plus size={16} />
                  <span>Tạo Role mới</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-20 flex items-center justify-center gap-4">
        <div className="max-w-6xl w-full flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-3 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Chế độ Super Admin</span>
          </div>
          
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={() => setFormData(settings)}
              className="btn-outline bg-white"
            >
              <RotateCcw size={16} />
              <span>Hủy thay đổi</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shadow-xl shadow-[#00c853]/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={16} />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
