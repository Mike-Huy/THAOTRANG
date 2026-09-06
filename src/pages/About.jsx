import { motion } from 'framer-motion';
import { Target, Users, Award, ShieldCheck } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const About = () => {
  const { settings } = useSettings();

  const defaultMilestones = [
    { year: '2015', title: 'Thành lập', desc: 'Khởi đầu với khát vọng xây dựng hệ sinh thái thể thao chuyên nghiệp.' },
    { year: '2018', title: 'Mở rộng đa ngành', desc: 'Phát triển sang lĩnh vực thương mại phụ kiện và đào tạo học viên.' },
    { year: '2021', title: 'Hệ thống 5 cơ sở', desc: 'Trở thành đơn vị dẫn đầu về số lượng và chất lượng sân bãi tại TP.HCM.' },
    { year: '2024', title: 'Vươn tầm quốc tế', desc: 'Đạt chứng chỉ chuẩn quốc tế BWF và đăng cai các giải đấu mở rộng.' },
    { year: '2026', title: 'Đổi mới công nghệ', desc: 'Số hóa toàn bộ quy trình vận hành và chăm sóc khách hàng.' },
  ];

  const milestones = Array.isArray(settings.about_milestones) ? settings.about_milestones : defaultMilestones;

  const coreValues = [
    { 
      icon: <Target size={24} />, 
      title: settings.about_mission_title || 'Sứ mệnh', 
      desc: settings.about_mission_desc || 'Xây dựng môi trường thể thao lành mạnh, chuyên nghiệp và đẳng cấp cho mọi lứa tuổi.' 
    },
    { 
      icon: <Users size={24} />, 
      title: settings.about_vision_title || 'Tầm nhìn', 
      desc: settings.about_vision_desc || 'Trở thành chuỗi trung tâm cầu lông hàng đầu khu vực với chất lượng dịch vụ chuẩn quốc tế.' 
    },
    { 
      icon: <ShieldCheck size={24} />, 
      title: settings.about_values_title || 'Giá trị cốt lõi', 
      desc: settings.about_values_desc || 'Chuyên nghiệp - Tận tâm - Sáng tạo - Kết nối cộng đồng yêu thể thao.' 
    },
  ];

  const defaultWhyUs = [
    { title: 'Chất lượng hàng đầu', desc: 'Hệ thống sân bãi đạt tiêu chuẩn thi đấu quốc tế, thảm sàn cao cấp chống chấn thương.' },
    { title: 'Dịch vụ đẳng cấp', desc: 'Đội ngũ nhân viên chuyên nghiệp, tận tâm và hệ thống tiện ích đi kèm đa dạng.' },
    { title: 'Cộng đồng văn minh', desc: 'Nơi giao lưu của những người yêu thể thao chân chính và các doanh nhân thành đạt.' },
  ];

  const rawWhyUs = Array.isArray(settings.about_why_us) ? settings.about_why_us : defaultWhyUs;
  const whyUsIcons = [<Award size={28} />, <ShieldCheck size={28} />, <Users size={28} />];
  const whyUs = rawWhyUs.map((item, index) => ({
    icon: whyUsIcons[index % whyUsIcons.length] || <Award size={28} />,
    title: item.title,
    desc: item.desc,
  }));

  // Sứ mệnh và giá trị thu gọn hiển thị ở Intro
  const missionShortDesc = settings.about_mission_desc 
    ? (settings.about_mission_desc.length > 25 ? settings.about_mission_desc.slice(0, 22) + '...' : settings.about_mission_desc)
    : 'Nâng tầm thể thao Việt';

  const valuesShortDesc = settings.about_values_desc
    ? (settings.about_values_desc.length > 25 ? settings.about_values_desc.slice(0, 22) + '...' : settings.about_values_desc)
    : 'Gắn kết cộng đồng';

  return (
    <div className="about-page pt-12 bg-[#f9fafb]">
      {/* Intro Section */}
      <section className="pt-6 pb-4">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="flex-1 w-full">
              <span className="text-[#008200] font-bold text-[10px] uppercase tracking-widest mb-3 block">VỀ CHÚNG TÔI</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 uppercase text-[#008200] leading-tight">
                {settings.about_title || 'THAOTRANG GROUP - ĐA NGÀNH NGHỀ, TRỌN NIỀM TIN'}
              </h1>
              <p className="text-black mb-4 text-sm leading-relaxed">
                {settings.about_description_p1 || 'Được hình thành từ niềm đam mê mãnh liệt với môn cầu lông, ThaoTrang Group đã không ngừng phát triển để trở thành một tập đoàn đa ngành vững mạnh. Chúng tôi không chỉ cung cấp không gian tập luyện chuyên nghiệp mà còn mở rộng sang lĩnh vực cung ứng trang thiết bị, tổ chức sự kiện và tư vấn giải pháp thể thao toàn diện.'}
              </p>
              <p className="text-black mb-6 text-sm leading-relaxed">
                {settings.about_description_p2 || 'Với phương châm "Khách hàng là trọng tâm", mỗi dịch vụ của chúng tôi đều hướng tới sự hoàn mỹ, sang trọng và đẳng cấp quốc tế.'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 p-3 rounded-xl border border-[#008200]/20 bg-[#e6f3e6]/30">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#e6f3e6] rounded-lg flex items-center justify-center text-[#008200] shrink-0">
                    <Target size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#008200]">
                      {settings.about_mission_title || 'Sứ mệnh'}
                    </h4>
                    <p className="text-[10px] text-black/70">{missionShortDesc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl border border-[#008200]/20 bg-[#e6f3e6]/30">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#e6f3e6] rounded-lg flex items-center justify-center text-[#008200] shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#008200]">
                      {settings.about_values_title || 'Giá trị'}
                    </h4>
                    <p className="text-[10px] text-black/70">{valuesShortDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative mt-4 md:mt-0">
              <div className="absolute -inset-3 sm:-inset-4 border-2 border-[#008200] rounded-[1.5rem] sm:rounded-[2rem] z-0 opacity-20" />
              <img
                src={settings.about_image_url || '/images/badminton_about.png'}
                alt="About"
                className="relative z-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full h-[240px] sm:h-[300px] md:h-[350px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-6 bg-white border-t border-[#008200]/5">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {coreValues.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="card border border-[#008200]/20 bg-white p-5 sm:p-6 shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e6f3e6] shadow-sm flex items-center justify-center text-[#008200] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold mb-2 uppercase text-[#008200]">{item.title}</h3>
                <p className="text-black text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones — mobile: vertical list, desktop: zigzag */}
      <section className="section-padding bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#008200]/10 blur-[150px] rounded-full" />
        <div className="container relative z-10">
          <div className="text-center mb-6">
            <span className="text-[#00ff00] font-bold text-[10px] uppercase tracking-[0.4em] mb-2 block">Hành trình</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase">Cột mốc phát triển</h2>
          </div>

          {/* Mobile: simple vertical list */}
          <div className="flex flex-col gap-4 md:hidden">
            {milestones.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-[#008200] border-2 border-white/20 flex items-center justify-center font-black text-xs shrink-0">
                  {String(m.year || '').slice(-2)}
                </div>
                <div>
                  <div className="text-[#00ff00] font-black text-sm opacity-40 leading-none mb-1">{m.year}</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{m.title}</h3>
                  <p className="text-white/70 text-[11px] leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: zigzag */}
          <div className="max-w-5xl mx-auto relative pt-4 hidden md:block">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 -translate-x-1/2" />
            <div className="flex flex-col gap-12">
              {milestones.map((m, idx) => (
                <div key={idx} className="relative flex items-center">
                  <div className="absolute left-1/2 -translate-x-1/2 z-20">
                    <div className="w-8 h-8 rounded-full bg-[#008200] border-2 border-white/20 shadow-[0_0_15px_rgba(0,130,0,0.5)] flex items-center justify-center font-bold text-[10px]">
                      {String(m.year || '').slice(-2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 w-full gap-24">
                    <div className="flex flex-col">
                      {idx % 2 === 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="items-end text-right"
                        >
                          <div className="text-[#00ff00] font-black text-4xl opacity-10 mb-1">{m.year}</div>
                          <h3 className="text-sm font-bold mb-1 uppercase tracking-wider">{m.title}</h3>
                          <p className="text-white/70 text-[10px] leading-relaxed max-w-xs ml-auto">{m.desc}</p>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      {idx % 2 === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="items-start text-left"
                        >
                          <div className="text-[#00ff00] font-black text-4xl opacity-10 mb-1">{m.year}</div>
                          <h3 className="text-sm font-bold mb-1 uppercase tracking-wider">{m.title}</h3>
                          <p className="text-white/70 text-[10px] leading-relaxed max-w-xs">{m.desc}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {whyUs.map((item, idx) => (
              <div key={idx} className="text-center p-5 sm:p-6 bg-white border border-[#008200]/20 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-[#e6f3e6] rounded-2xl flex items-center justify-center text-[#008200] mx-auto mb-4 sm:mb-6">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold mb-3 uppercase text-[#008200]">{item.title}</h3>
                <p className="text-black text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
