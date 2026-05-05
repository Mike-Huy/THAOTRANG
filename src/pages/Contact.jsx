import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { useSettings } from '../hooks/useSettings';

const Contact = () => {
  const { submitContact } = useContacts();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await submitContact(formData);
    
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    }
    setIsSubmitting(false);
  };

  const contactInfo = [
    { 
      icon: <MapPin size={20} />, 
      title: 'Địa chỉ', 
      content: settings.address || '123 Đường Cầu Lông, Quận 7, TP. Hồ Chí Minh' 
    },
    { 
      icon: <Phone size={20} />, 
      title: 'Hotline', 
      content: settings.phone || '090 123 4567', 
      sub: 'Phục vụ 24/7' 
    },
    { 
      icon: <Mail size={20} />, 
      title: 'Email', 
      content: settings.email || 'contact@thaotrang.vn' 
    },
  ];

  return (
    <div className="contact-page pt-12 min-h-screen bg-gray-50">
      <section className="py-6 sm:py-8">
        <div className="container px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 uppercase text-[#008200]">Liên hệ với chúng tôi</h1>
            <p className="text-black/60 text-xs">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
              {contactInfo.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-start gap-3 sm:gap-4 border border-[#008200]/20"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#e6f3e6] rounded-xl flex items-center justify-center text-[#008200] shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider text-[#008200]">{item.title}</h3>
                    <p className="text-black/70 text-[11px] leading-relaxed">{item.content}</p>
                    {item.sub && <p className="text-[#008200] text-[9px] font-bold mt-1 uppercase tracking-tighter">{item.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#008200]/20">
                <h2 className="text-base sm:text-lg font-bold mb-5 sm:mb-6 flex items-center gap-2 uppercase tracking-wide text-[#008200]">
                  GỬI YÊU CẦU TƯ VẤN <Send className="text-[#008200]" size={16} />
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">Họ và tên *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-gray-50 border border-[#008200]/20 focus:ring-1 focus:ring-[#008200] focus:bg-white outline-none text-xs transition-all" 
                      placeholder="Nguyễn Văn A" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-gray-50 border border-[#008200]/20 focus:ring-1 focus:ring-[#008200] focus:bg-white outline-none text-xs transition-all" 
                      placeholder="090..." 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-gray-50 border border-[#008200]/20 focus:ring-1 focus:ring-[#008200] focus:bg-white outline-none text-xs transition-all" 
                      placeholder="example@gmail.com" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">Nội dung tin nhắn *</label>
                    <textarea 
                      rows="4" 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-gray-50 border border-[#008200]/20 focus:ring-1 focus:ring-[#008200] focus:bg-white outline-none resize-none text-xs transition-all" 
                      placeholder="Bạn cần tư vấn về vấn đề gì?"
                    ></textarea>
                  </div>
                  
                  {status === 'success' && (
                    <div className="sm:col-span-2 p-3 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-xl uppercase tracking-wider text-center">
                      Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="sm:col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-xl uppercase tracking-wider text-center">
                      {!formData.name || !formData.message ? 'Vui lòng nhập đầy đủ các trường bắt buộc (*)' : 'Có lỗi xảy ra. Vui lòng thử lại sau.'}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#008200] text-white py-3 rounded-xl font-bold hover:bg-[#00a300] transition-all shadow-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> ĐANG GỬI...
                        </>
                      ) : 'GỬI TIN NHẮN NGAY'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-8 sm:mt-12 h-48 sm:h-64 w-full rounded-2xl overflow-hidden shadow-sm relative grayscale hover:grayscale-0 transition-all duration-700 border border-gray-100">
            <iframe
              src={settings.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954415523533!2d106.6919702758368!3d10.73800245989824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f9708709a39%3A0xc48c9735d46816a7!2zMTIzIMSQxrDhu51uZyBD4bqndSBMw7RuZywgUXXhuq1uIDcsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1714800000000!5m2!1svi!2s"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
