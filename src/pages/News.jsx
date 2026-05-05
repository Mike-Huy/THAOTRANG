import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const News = () => {
  const articles = [
    {
      id: 1,
      title: '5 Kỹ thuật di chuyển bước chân cơ bản cho người mới bắt đầu',
      excerpt: 'Di chuyển bước chân là nền tảng quan trọng nhất trong cầu lông. Hiểu rõ cách di chuyển sẽ giúp bạn tiết kiệm thể lực và đón cầu chính xác hơn.',
      date: '01/05/2026',
      author: 'Admin Thảo Trang',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: 2,
      title: 'Cách lựa chọn vợt cầu lông phù hợp với lối chơi tấn công',
      excerpt: 'Lối chơi tấn công đòi hỏi một cây vợt có độ cứng cao và nặng đầu. Bài viết này sẽ phân tích các thông số quan trọng như 3U, 4U, G5...',
      date: '28/04/2026',
      author: 'Chuyên gia thể thao',
      image: 'https://images.unsplash.com/photo-1613918431208-67324451ecd2?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: 3,
      title: 'Chế độ dinh dưỡng tối ưu cho vận động viên cầu lông phong trào',
      excerpt: 'Ăn gì trước và sau khi ra sân để duy trì bền bỉ suốt 2-3 tiếng đồng hồ? Hãy cùng khám phá thực đơn vàng cho dân chơi cầu lông.',
      date: '25/04/2026',
      author: 'Học viện Thảo Trang',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  return (
    <div className="news-page pt-12 min-h-screen bg-gray-50">
      <section className="py-6 sm:py-8">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6 sm:mb-8">
            <div>
              <h2 className="text-[#008200] font-bold text-[10px] uppercase tracking-widest mb-2">Bản tin cầu lông</h2>
              <h1 className="text-xl sm:text-2xl font-bold uppercase text-[#008200]">TIN TỨC & KIẾN THỨC</h1>
            </div>
            <p className="text-black/60 italic text-[11px] sm:text-right sm:max-w-[220px]">
              Cập nhật những thông tin mới nhất về kỹ thuật, sản phẩm và sự kiện tại Thảo Trang Badminton.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {articles.map((article) => (
              <motion.article
                key={article.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#008200]/20"
              >
                <div className="h-44 sm:h-52 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#008200] px-3 py-1 rounded-full text-white font-bold text-[8px] shadow-sm uppercase tracking-wider">
                    KIẾN THỨC
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-black/50 mb-3 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-3 hover:text-[#008200] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-black/70 mb-4 sm:mb-5 line-clamp-2 text-[11px] leading-relaxed">
                    {article.excerpt}
                  </p>
                  <button className="flex items-center gap-2 text-[#008200] font-bold hover:gap-3 transition-all uppercase text-[9px] tracking-widest">
                    Đọc tiếp <ArrowRight size={14} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-8 sm:py-10 bg-[#e6f3e6]">
        <div className="container px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-lg sm:text-xl font-bold mb-3 text-[#008200] uppercase">Đăng ký nhận bản tin</h2>
            <p className="text-black/60 mb-5 sm:mb-6 text-xs">Nhận ngay cẩm nang kỹ thuật cầu lông và thông báo về các giải đấu mới nhất.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="flex-1 px-4 sm:px-5 py-3 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-[#008200] outline-none text-xs"
              />
              <button className="bg-[#008200] text-white px-5 sm:px-6 py-3 rounded-xl font-bold hover:bg-[#00a300] transition-all shadow-lg text-xs uppercase tracking-wider shrink-0">
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
