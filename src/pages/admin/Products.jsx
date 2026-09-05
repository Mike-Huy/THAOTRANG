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
  ImageIcon,
  X,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';

const Products = () => {
  const { products, categories, loading, error, refetch, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    stock: 0,
    category_id: '',
    brand: '',
    tag: '',
    cover_url: '',
    description: '',
    status: 'active',
    is_featured: false
  });

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle product toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await updateProduct(id, { status: newStatus });
    if (error) alert('Lỗi: ' + error);
  };

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: 0,
      stock: 10,
      category_id: categories[0]?.id || '',
      brand: '',
      tag: 'New',
      cover_url: '',
      description: '',
      status: 'active',
      is_featured: false
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category_id: product.category_id || '',
      brand: product.brand || '',
      tag: product.tag || '',
      cover_url: product.cover_url || '',
      description: product.description || '',
      status: product.status || 'active',
      is_featured: product.is_featured || false
    });
    setIsModalOpen(true);
  };

  // Handle image upload to Supabase storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate if it is an image
    const fileExt = file.name.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExt.toLowerCase())) {
      return alert('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF');
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to the 'thaotrang' bucket
      const { error: uploadError } = await supabase.storage
        .from('thaotrang')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('thaotrang')
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, cover_url: data.publicUrl }));
    } catch (error) {
      console.error('Lỗi tải ảnh:', error);
      alert('Lỗi tải ảnh: ' + (error.message || error));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle save product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name) return alert('Vui lòng nhập tên sản phẩm');
    if (!productForm.category_id) return alert('Vui lòng chọn danh mục');

    const payload = {
      name: productForm.name,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category_id: productForm.category_id,
      brand: productForm.brand,
      tag: productForm.tag,
      cover_url: productForm.cover_url,
      description: productForm.description,
      status: productForm.status,
      is_featured: productForm.is_featured
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setIsModalOpen(false);
    }
  };

  // Handle save category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return alert('Vui lòng nhập tên danh mục');
    setIsCategorySaving(true);

    const slug = newCategoryName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-');

    const { error } = await supabase
      .from('ttq6_product_categories')
      .insert({ name: newCategoryName, slug, sort_order: categories.length + 1 });

    setIsCategorySaving(false);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      setNewCategoryName('');
      alert('Thêm danh mục mới thành công!');
      // Refetch both categories and products
      refetch();
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Xóa danh mục này? Các sản phẩm thuộc danh mục này sẽ bị mất liên kết.')) return;
    const { error } = await supabase
      .from('ttq6_product_categories')
      .delete()
      .eq('id', catId);
    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Xóa danh mục thành công!');
      refetch();
    }
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-xl border border-red-100 font-bold uppercase text-[10px] tracking-widest">{error}</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d1117] uppercase tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý kho hàng, giá cả và danh mục sản phẩm của cửa hàng.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Layers size={16} />
            <span>Danh mục</span>
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#00c853]">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng sản phẩm</div>
            <div className="text-xl font-black text-black mt-1">{products.length}</div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <Package size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng hàng tồn</div>
            <div className="text-xl font-black text-black mt-1">
              {products.reduce((acc, curr) => acc + (curr.stock || 0), 0)}
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm nổi bật</div>
            <div className="text-xl font-black text-black mt-1">
              {products.filter(p => p.is_featured).length}
            </div>
          </div>
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
              className="w-full md:w-auto text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00c853]"
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
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 group-hover:shadow-md transition-all shrink-0">
                        {product.cover_url ? (
                          <img src={product.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-black text-[#0d1117] uppercase tracking-tight">{product.name}</div>
                          {product.is_featured && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[8px] font-black uppercase tracking-wider">
                              <Sparkles size={8} /> Nổi bật
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            SKU: {product.id.slice(0, 8).toUpperCase()}
                          </span>
                          {product.tag && (
                            <span className="badge !text-[8px] !px-1.5 !py-0.2">{product.tag}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-[#00c853]" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {product.category?.name || 'Chưa phân loại'}
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
                    {product.status === 'active' ? (
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
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-gray-100 rounded-lg transition-all"
                        title={product.status === 'active' ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                      >
                        {product.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-all"
                        title="Sửa sản phẩm"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Xóa sản phẩm này?')) deleteProduct(product.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                        title="Xóa sản phẩm"
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

      {/* PRODUCT ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-gray-100 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-black text-[#0d1117] uppercase tracking-tight">
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <p className="text-xs text-gray-400">Điền thông tin chi tiết của sản phẩm để đồng bộ lên website.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tên sản phẩm *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ví dụ: Vợt Yonex Astrox 88D"
                    className="input-field"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Danh mục *</label>
                  <select 
                    className="input-field"
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Giá bán (VNĐ) *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    placeholder="Ví dụ: 4500000"
                    className="input-field"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Số lượng tồn *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    placeholder="Ví dụ: 15"
                    className="input-field"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Thương hiệu</label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: Yonex, Victor"
                    className="input-field"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nhãn / Badge</label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: New, Hot, -10%, Best Seller"
                    className="input-field"
                    value={productForm.tag}
                    onChange={(e) => setProductForm({...productForm, tag: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ảnh sản phẩm</label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-[#00c853] transition-all bg-gray-50/50 flex flex-col items-center justify-center min-h-[120px]">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-[#00c853]" size={24} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Đang tải ảnh lên...</span>
                      </div>
                    ) : productForm.cover_url ? (
                      <div className="relative w-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={productForm.cover_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                          <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                            <span className="text-[10px] font-bold text-gray-700 block">Đã tải ảnh lên</span>
                            <span className="text-[9px] text-gray-400 font-medium block overflow-hidden text-ellipsis">{productForm.cover_url.split('/').pop()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="cursor-pointer px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all">
                            Thay đổi
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={handleImageUpload}
                            />
                          </label>
                          <button 
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, cover_url: '' }))}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-2 gap-2 text-center">
                        <div className="w-10 h-10 bg-gray-100 hover:bg-[#00c853]/10 rounded-full flex items-center justify-center text-gray-400 transition-all">
                          <Upload size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-black text-gray-700 uppercase tracking-tight block">Tải ảnh lên</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mt-0.5">Click để chọn ảnh từ máy</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mô tả sản phẩm</label>
                <textarea 
                  rows="3"
                  placeholder="Mô tả các thông số kỹ thuật, chất liệu..."
                  className="input-field min-h-[80px]"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap gap-6 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-4.5 h-4.5 rounded border-gray-300 text-[#00c853] focus:ring-[#00c853]/10"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                  />
                  <span className="text-xs font-bold text-gray-700">Sản phẩm nổi bật (Hiển thị trang chủ)</span>
                </label>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-700">Trạng thái:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="modal_status"
                        value="active"
                        className="text-[#00c853] focus:ring-[#00c853]/10"
                        checked={productForm.status === 'active'}
                        onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                      />
                      <span className="text-xs text-gray-600 font-bold">Hiển thị</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="modal_status"
                        value="inactive"
                        className="text-[#00c853] focus:ring-[#00c853]/10"
                        checked={productForm.status === 'inactive'}
                        onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                      />
                      <span className="text-xs text-gray-600 font-bold">Ẩn bản nháp</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline !py-2.5"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-primary !py-2.5 flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>{editingProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-black text-[#0d1117] uppercase tracking-tight">Quản lý Danh mục</h3>
                <p className="text-[10px] text-gray-400">Thêm mới hoặc xóa các loại danh mục sản phẩm.</p>
              </div>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Form add category */}
              <form onSubmit={handleSaveCategory} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập tên danh mục mới..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#00c853]"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isCategorySaving}
                  className="btn-primary !px-4 !py-2 text-xs font-black flex items-center gap-1 uppercase tracking-wider shrink-0"
                >
                  <Plus size={14} />
                  <span>{isCategorySaving ? 'Lưu...' : 'Thêm'}</span>
                </button>
              </form>

              {/* List of categories */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Danh sách hiện tại</label>
                <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Tag size={12} className="text-[#00c853]" />
                        <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Xóa danh mục"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Chưa có danh mục nào.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
