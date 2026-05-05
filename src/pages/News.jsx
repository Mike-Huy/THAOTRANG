import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';

const News = () => {
  const { posts, loading } = usePosts({ status: 'published' });

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-44 sm:h-52 bg-gray-200" />
      <div className="p-4 sm:p-5">
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );

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
            {loading ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <motion.article
                  key={post.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#008200]/20"
                >
                  <div className="h-44 sm:h-52 overflow-hidden relative">
                    <img
                      src={post.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1000'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#008200] px-3 py-1 rounded-full text-white font-bold text-[8px] shadow-sm uppercase tracking-wider">
                      {post.category || 'KIẾN THỨC'}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-black/50 mb-3 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> {post.author?.full_name || post.author?.username || 'Admin'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold mb-3 hover:text-[#008200] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-black/70 mb-4 sm:mb-5 line-clamp-2 text-[11px] leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Link 
                      to={`/tin-tuc/${post.slug}`}
                      className="flex items-center gap-2 text-[#008200] font-bold hover:gap-3 transition-all uppercase text-[9px] tracking-widest"
                    >
                      Đọc tiếp <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-black/40 text-sm font-bold uppercase tracking-widest">Chưa có bài viết nào được đăng.</p>
              </div>
            )}
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
