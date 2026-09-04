import { motion } from 'framer-motion';
import { ChevronRight, Star, ArrowRight, Users, Trophy, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useProducts } from '../hooks/useProducts';
import action1 from '../assets/badminton_action_1_1777876749514.png';
import products from '../assets/badminton_products_1777876769461.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Home = () => {
  const { settings } = useSettings();
  const { products: fetchedProducts } = useProducts({ status: 'active', limit: 4 });

  const stats = [
    { icon: <Users size={26} />, value: settings.home_stats_students || '500+', label: 'Học viên' },
    { icon: <Trophy size={26} />, value: settings.home_stats_tournaments || '12', label: 'Giải đấu/năm' },
    { icon: <Award size={26} />, value: settings.home_stats_courts || '9', label: 'Sân đạt chuẩn' },
  ];

  const defaultProductList = [
    { name: 'Vợt Yonex Astrox 88D', price: 4500000, tag: 'New', image_url: products },
    { name: 'Cầu Hải Yến S90', price: 250000, tag: 'Hot', image_url: products },
    { name: 'Quấn cán Yonex AC102EX', price: 30000, tag: 'Best Seller', image_url: products },
    { name: 'Giày Victor SH-P9200', price: 2100000, tag: '-10%', image_url: products },
  ];

  const productList = fetchedProducts && fetchedProducts.length > 0
    ? fetchedProducts.map(p => ({
        name: p.name,
        price: p.price.toLocaleString('vi-VN') + 'đ',
        tag: p.tag || 'Hot',
        image_url: p.cover_url || products,
        rating: p.rating || 5
      }))
    : defaultProductList.map(p => ({
        name: p.name,
        price: p.price.toLocaleString('vi-VN') + 'đ',
        tag: p.tag,
        image_url: p.image_url,
        rating: 5
      }));

  let parsedPartners = settings.home_partners;
  if (typeof parsedPartners === 'string') {
    try { parsedPartners = JSON.parse(parsedPartners); } catch { parsedPartners = null; }
  }
  const partners = Array.isArray(parsedPartners) && parsedPartners.length > 0
    ? parsedPartners
    : ['Yonex', 'Victor', 'Li-Ning', 'Forza', 'Mizuno'];

  const defaultWhyUs = [
    {
      title: 'Sân Chuẩn BWF',
      desc: 'Mặt sân thảm Yonex cao cấp, đèn chiếu sáng chuyên nghiệp, đạt tiêu chuẩn thi đấu quốc tế.',
    },
    {
      title: 'HLV Chuyên Nghiệp',
      desc: 'Đội ngũ huấn luyện viên cấp quốc gia, có kinh nghiệm thi đấu chuyên nghiệp nhiều năm.',
    },
    {
      title: 'Đặt Sân Online 24/7',
      desc: 'Hệ thống đặt sân trực tuyến thông minh, quản lý lịch chơi dễ dàng, nhanh chóng và tiện lợi.',
    },
  ];

  const rawWhyUs = Array.isArray(settings.home_why_us) ? settings.home_why_us : defaultWhyUs;
  const whyUsIcons = [<Zap size={24} />, <Trophy size={24} />, <Award size={24} />];
  const whyUs = rawWhyUs.map((item, index) => ({
    n: String(index + 1).padStart(2, '0'),
    icon: whyUsIcons[index % whyUsIcons.length] || <Zap size={24} />,
    title: item.title,
    desc: item.desc,
  }));

  const defaultGallery = [
    { title: 'Giải đấu chuyên nghiệp', image_url: action1 },
    { title: 'Luyện tập hàng ngày', image_url: action1 },
    { title: 'Cộng đồng badminton', image_url: action1 },
  ];

  // Chấp nhận cả array lẫn JSON string (phòng trường hợp DB có type sai)
  let parsedGallery = settings.home_gallery;
  if (typeof parsedGallery === 'string') {
    try { parsedGallery = JSON.parse(parsedGallery); } catch { parsedGallery = null; }
  }
  const rawGallery = Array.isArray(parsedGallery) && parsedGallery.length > 0
    ? parsedGallery
    : defaultGallery;

  const galleryItems = rawGallery.map((item, index) => ({
    title: item.title || defaultGallery[index]?.title || `Hoạt động ${index + 1}`,
    image_url: item.image_url || action1,
  }));

  return (
    <div className="home-page">
      {/* ─── HERO ─── */}
      <section className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20 z-10" />
        <div className="absolute bottom-0 left-0 w-full sm:w-[500px] h-[200px] sm:h-[300px] z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(0,200,83,0.18) 0%, transparent 70%)' }} />
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          src={settings.home_hero_image_url || action1}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="w-full text-left max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="h-[2px] w-6 sm:w-8 rounded-full" style={{ background: 'linear-gradient(90deg, #00c853, #008200)' }} />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em]" style={{ color: '#00e676' }}>
                International Standard
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase leading-tight mb-3 sm:mb-4 sm:whitespace-nowrap">
              {settings.home_hero_title ? (
                settings.home_hero_title.includes('ĐAM MÊ') ? (
                  <>
                    {settings.home_hero_title.split('ĐAM MÊ')[0]}
                    <span className="gradient-text">ĐAM MÊ</span>
                    {settings.home_hero_title.split('ĐAM MÊ')[1]}
                  </>
                ) : (
                  settings.home_hero_title
                )
              ) : (
                <>NÂNG TẦM <span className="gradient-text">ĐAM MÊ</span> CẦU LÔNG</>
              )}
            </h1>
            <p className="text-white/80 text-xs leading-relaxed mb-4 sm:mb-5 max-w-sm sm:max-w-lg">
              {settings.home_hero_subtitle || 'Hệ thống sân bãi đạt chuẩn quốc tế cùng đội ngũ huấn luyện viên chuyên nghiệp hàng đầu Việt Nam.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/dat-san" className="btn-primary !px-4 sm:!px-5 !py-2 sm:!py-2.5 !text-[10px]">
                Đặt sân ngay <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS FLOATING CARD ─── */}
      <section className="relative z-30 -mt-8 sm:-mt-12 md:-mt-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div
            className="bg-white rounded-2xl grid grid-cols-3 divide-x divide-gray-100 overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,200,83,0.1)' }}
          >
            {stats.map((s, i) => (
              <div key={i} className="stat-box group hover:bg-green-50/50 transition-colors duration-300 !px-3 sm:!px-6 !py-4 sm:!py-5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#008200] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="stat-value text-lg sm:text-xl md:text-2xl text-black">{s.value}</div>
                  <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section className="pt-8 sm:pt-10 pb-6 bg-[#f8faf8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-6 sm:mb-8">
            <span className="section-label mx-auto">Gallery</span>
            <h2 className="section-title mt-1">Hoạt động tại sân</h2>
            <div className="section-divider mt-2" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.map((item, i) => (
              <Link to="/hoat-dong" key={i} className="block">
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="h-[220px] sm:h-[260px] md:h-[300px] rounded-2xl overflow-hidden relative group cursor-pointer"
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                >
                  <img src={item.image_url || action1} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-sm">{item.title}</h3>
                      <span
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0"
                        style={{ background: 'linear-gradient(135deg, #00c853, #008200)' }}
                      >
                        Xem thêm <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#00c853] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section className="pt-6 pb-10 sm:pb-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="flex justify-between items-end mb-6 sm:mb-8">
            <div className="text-left">
              <span className="section-label !ml-0">Shop</span>
              <h2 className="section-title mt-1">Sản phẩm nổi bật</h2>
            </div>
            <Link
              to="/san-pham"
              className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 px-3 sm:px-4 py-2 rounded-full bg-[#008200] text-white hover:bg-[#00a300] shadow-md hover:shadow-lg shrink-0"
            >
              <span className="hidden sm:inline">Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {productList.map((p, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="card group cursor-pointer relative !p-0 overflow-hidden border border-[#008200]/20"
              >
                <div className="absolute top-2 right-2 z-10">
                  <span className="badge !text-[8px] !px-2 !py-0.5">{p.tag}</span>
                </div>
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={p.image_url || products} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-[11px] sm:text-xs text-gray-800 mb-2 group-hover:text-[#008200] transition-colors line-clamp-2 leading-tight">{p.name}</h3>
                  <div className="flex gap-0.5 text-yellow-400 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        size={9} 
                        fill={s <= (p.rating || 5) ? 'currentColor' : 'none'} 
                        className={s <= (p.rating || 5) ? '' : 'text-gray-200'} 
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs sm:text-sm" style={{
                      background: 'linear-gradient(135deg, #00c853, #007a00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>{p.price}</span>
                    <button
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ background: 'linear-gradient(135deg, #00c853, #008200)', boxShadow: '0 3px 10px rgba(0,200,83,0.35)' }}
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="pt-6 pb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f0a 0%, #0d1a0d 50%, #050c05 100%)' }}>
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,130,0,0.1) 0%, transparent 70%)' }} />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-6 sm:mb-8">
            <span className="section-label mx-auto" style={{ color: '#00e676' }}>Tại sao chọn chúng tôi</span>
            <h2 className="section-title-light mt-4">Đẳng cấp quốc tế</h2>
            <div className="section-divider" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="card-dark group !pt-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,130,0,0.05))',
                      border: '1px solid rgba(0,200,83,0.2)',
                      color: '#00c853',
                    }}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-sm font-black text-white uppercase mb-0.5">{item.title}</h3>
                <p className="text-white/60 leading-relaxed text-[11px]">{item.desc}</p>
                <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00c853, #008200)' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNERS ─── */}
      <section className="pt-6 pb-8 bg-white border-t border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <p className="text-center text-[9px] font-bold text-black/30 uppercase tracking-[0.5em] mb-4">Đối tác chiến lược</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-16">
            {partners.map((name) => (
              <span key={name} className="text-lg sm:text-xl font-black text-black/80 hover:text-[#008200] transition-all duration-300 cursor-pointer tracking-tight uppercase hover:scale-110 inline-block">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
