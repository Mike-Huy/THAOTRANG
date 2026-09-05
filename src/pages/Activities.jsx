import { motion } from 'framer-motion';
import { Trophy, Users, Heart } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';
import action1 from '../assets/badminton_action_1_1777876749514.png';

const typeLabels = {
  tournament: 'Giải đấu chuyên nghiệp',
  training: 'Luyện tập hàng ngày',
  community: 'Cộng đồng badminton',
  other: 'Khác'
};

const Activities = () => {
  const { activities, loading } = useActivities();

  const stats = [
    { label: 'Giải đấu đã tổ chức', value: '45+', icon: <Trophy size={20} /> },
    { label: 'Vận động viên hội viên', value: '1,200', icon: <Users size={20} /> },
    { label: 'Tỉ lệ hài lòng', value: '98%', icon: <Heart size={20} /> },
  ];

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse aspect-[4/3]" />
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="activities-page pt-12 bg-[#f9fafb]">
      {/* Hero Header */}
      <section className="py-10 sm:py-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#008200]/20 z-10" />
        <img src={action1} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" alt="Background" />
        <div className="container relative z-20 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#00ff00] font-bold text-[10px] uppercase tracking-[0.4em] mb-3 block">Our Community</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white uppercase mb-4">Hoạt động & Sự kiện</h1>
            <p className="text-white/60 max-w-2xl mx-auto text-xs px-4">Nơi ghi lại những khoảnh khắc bùng nổ, những giải đấu kịch tính và tinh thần thể thao rực lửa.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats — no negative margin overlap on mobile */}
      <section className="relative z-30 -mt-8 sm:-mt-12 mb-8 sm:mb-12">
        <div className="container px-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 grid grid-cols-3 gap-3 sm:gap-6 border border-gray-100">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center sm:border-r last:border-0 border-gray-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#008200] flex items-center justify-center text-white shadow-lg shadow-green-900/20 shrink-0">
                  {s.icon}
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-base sm:text-lg font-extrabold text-black">{s.value}</div>
                  <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest leading-tight">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <motion.div
                  key={act.id}
                  whileHover={{ y: -10 }}
                  className="card !p-0 overflow-hidden group border-none shadow-lg relative"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={act.cover_url || act.image_url || action1} 
                      alt={act.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-all flex items-end p-4">
                      <div className="w-full text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="bg-[#008200] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase block w-fit">
                            {typeLabels[act.type] || act.type || 'Sự kiện'}
                          </span>
                          <span className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
                            {formatDate(act.start_date)}
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{act.title}</h3>
                        <p className="text-white/70 text-[10px] line-clamp-2 mt-1 font-medium">{act.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-black/40 text-sm font-bold uppercase tracking-widest">Chưa có hoạt động nào được cập nhật.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Activities;
