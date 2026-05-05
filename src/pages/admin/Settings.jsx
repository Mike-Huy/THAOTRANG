import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { settings, loading, error, updateMany } = useSettings();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateMany(formData);
    if (error) alert('Lỗi: ' + error);
    else alert('Đã lưu cài đặt hệ thống!');
    setIsSaving(false);
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  const tabs = [
    { id: 'permissions', label: 'Phân quyền', icon: Shield, description: 'Quản lý quyền truy cập menu và chức năng' },
    { id: 'general', label: 'Cài đặt chung', icon: SettingsIcon, description: 'Cấu hình thông tin cơ bản của website' },
    { id: 'roles', label: 'ROLE', icon: Users, description: 'Quản lý nhóm quyền và gán quyền cho user' },
  ];

  const sections = [
    {
      id: 'general_info',
      title: 'Thông tin chung',
      icon: Globe,
      fields: [
        { key: 'site_name', label: 'Tên Website', type: 'text', placeholder: 'VD: Thảo Trang Badminton' },
        { key: 'site_description', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Mô tả cho SEO...' },
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
      ]
    },
    {
      id: 'business',
      title: 'Vận hành & Giá cả',
      icon: Clock,
      fields: [
        { key: 'opening_hours', label: 'Giờ mở cửa', type: 'text', placeholder: 'VD: 05:00 - 22:00' },
        { key: 'price_per_hour', label: 'Giá sân mặc định (/giờ)', type: 'number', icon: DollarSign },
      ]
    },
    {
      id: 'social',
      title: 'Mạng xã hội',
      icon: Share2,
      fields: [
        { key: 'social_facebook', label: 'Facebook URL', type: 'text', icon: Share2 },
        { key: 'social_instagram', label: 'Instagram URL', type: 'text', icon: AtSign },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-gray-500 text-sm">Quản lý quyền hạn, cài đặt website và phân vai trò người dùng.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map(section => (
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
