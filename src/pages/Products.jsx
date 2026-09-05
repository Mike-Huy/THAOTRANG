import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Star, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import productsImg from '../assets/badminton_products_1777876769461.png';

const Products = () => {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const { products, categories: hookCategories, loading } = useProducts({ status: 'active' });

  const filteredProducts = products.filter(p =>
    (category === 'all' || p.category_id === category) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm', count: products.length },
    ...hookCategories.map(cat => ({
      ...cat,
      count: products.filter(p => p.category_id === cat.id).length
    }))
  ];

  const FilterList = () => (
    <div className="p-3 flex flex-col gap-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => { setCategory(cat.id); setShowFilter(false); }}
          className={category === cat.id ? 'pill-active' : 'pill-inactive'}
        >
          <span>{cat.name}</span>
          <span
            className="text-xs font-black px-2 py-0.5 rounded-full"
            style={category === cat.id
              ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
              : { background: '#f3f4f6', color: '#6b7280' }
            }
          >
            {cat.count}
          </span>
        </button>
      ))}
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="products-page pt-12 min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f7f0 0%, #f9fafb 100%)' }}>
      <section className="py-6 sm:py-8">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <span className="section-label">Store</span>
              <h1 className="section-title mt-2">Sản phẩm chính hãng</h1>
              <p className="text-gray-400 mt-2 max-w-md text-xs sm:text-sm">Trang thiết bị cầu lông tiêu chuẩn thi đấu từ các thương hiệu hàng đầu thế giới.</p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72 md:w-96">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#008200]" size={15} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="input-field pl-9 sm:pl-11 !border-[#008200]/30 focus:!border-[#008200] !shadow-none bg-white w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#008200]/30 text-[#008200] font-bold text-xs shrink-0"
              >
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">Lọc</span>
              </button>
            </div>
          </div>

          {/* Mobile filter drawer */}
          {showFilter && (
            <div className="lg:hidden mb-4 rounded-2xl bg-white border border-[#008200]/30 shadow-sm relative">
              <button
                onClick={() => setShowFilter(false)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={14} />
              </button>
              <FilterList />
            </div>
          )}

          {/* Mobile: horizontal scroll pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                  category === cat.id
                    ? 'bg-[#008200] text-white border-[#008200]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Sidebar — desktop only */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 rounded-2xl overflow-hidden bg-white border border-[#008200]/30 shadow-sm">
                <FilterList />
              </div>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="card group cursor-pointer relative !p-3 sm:!p-4 border border-[#008200]/20 hover:border-[#008200]/40 shadow-sm"
                    >
                      {p.tag && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="badge !text-[8px] !px-1.5 !py-0.5">{p.tag}</span>
                        </div>
                      )}
                      <div className="aspect-square mb-3 sm:mb-5 overflow-hidden rounded-xl flex items-center justify-center p-3 sm:p-4"
                        style={{ background: 'linear-gradient(135deg, #f0faf0, #e8f5e9)' }}>
                        <img
                          src={p.cover_url || productsImg}
                          alt={p.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="px-0.5 sm:px-1">
                        <h3 className="font-bold text-xs sm:text-base mb-1.5 sm:mb-2 group-hover:text-[#008200] transition-colors leading-tight line-clamp-2">
                          {p.name}
                        </h3>
                        <div className="flex text-yellow-400 mb-2 sm:mb-4 gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} fill={s <= (p.rating || 5) ? 'currentColor' : 'none'} className={s <= (p.rating || 5) ? '' : 'text-gray-200'} />
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-normal text-base sm:text-lg" style={{
                            background: 'linear-gradient(135deg, #00c853, #007a00)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}>
                            {p.price.toLocaleString('vi-VN')}đ
                          </p>
                          <button
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #00c853, #008200)', boxShadow: '0 4px 12px rgba(0,200,83,0.4)' }}
                          >
                            <ShoppingBag size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-black/40 text-sm font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
