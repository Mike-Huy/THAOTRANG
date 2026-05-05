import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  Layers, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

const Products = () => {
  const { products, categories, loading, error, toggleStatus, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý kho hàng, giá cả và danh mục sản phẩm.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline">
            <Layers size={16} />
            <span>Danh mục</span>
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00c853] focus:ring-4 focus:ring-[#00c853]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              className="flex-1 md:flex-none text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00c853]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8">
                      <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 group-hover:shadow-md transition-all">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight">{product.name}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          SKU: {product.id.slice(0, 8).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-[#00c853]" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {product.ttq6_product_categories?.name || 'Chưa phân loại'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-black text-[#0d1117]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={12} className="text-gray-400" />
                      <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_active ? (
                      <span className="flex items-center gap-1.5 text-green-500 text-[9px] font-black uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        <Eye size={12} /> Hiển thị
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400 text-[9px] font-black uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                        <EyeOff size={12} /> Đang ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(product.id, !product.is_active)}
                        className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-gray-100 rounded-lg transition-all"
                        title={product.is_active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                      >
                        {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa sản phẩm này?')) deleteProduct(product.id) }}
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
          {!loading && filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
              <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
