import React, { useState } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  MailWarning, 
  Trash2, 
  MessageSquare,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Contacts = () => {
  const { contacts, loading, error, updateStatus, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      unread: 'bg-red-50 text-red-600 border-red-100 font-black',
      read: 'bg-gray-100 text-gray-500 border-gray-200 font-bold',
      responded: 'bg-green-50 text-green-600 border-green-100 font-black'
    };
    const labels = {
      unread: 'Chưa đọc',
      read: 'Đã đọc',
      responded: 'Đã phản hồi'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${styles[status] || styles.unread}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Hộp thư liên hệ</h1>
          <p className="text-gray-500 text-sm">Quản lý và phản hồi các yêu cầu từ khách hàng qua website.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm theo tên, email, chủ đề..."
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
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Chủ đề / Tin nhắn</th>
                <th className="px-6 py-4">Thời gian</th>
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
              ) : filteredContacts.map((contact) => (
                <tr key={contact.id} className={`hover:bg-gray-50/80 transition-colors group ${contact.status === 'unread' ? 'bg-red-50/20' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight">{contact.full_name}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Mail size={10} /> {contact.email}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Phone size={10} /> {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <div className="flex flex-col gap-1">
                      <div className="text-[11px] font-black text-[#008200] uppercase tracking-wide truncate">{contact.subject}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-2 italic">"{contact.message}"</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      {contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {contact.status === 'unread' && (
                        <button 
                          onClick={() => updateStatus(contact.id, 'read')}
                          className="p-2 bg-[#00c853]/10 text-[#00c853] hover:bg-[#00c853]/20 rounded-lg transition-all"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all" title="Phản hồi">
                        <MessageSquare size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa liên hệ này?')) deleteContact(contact.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredContacts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <MailWarning size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Hộp thư trống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
