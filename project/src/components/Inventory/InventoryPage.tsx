import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Save,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types/database';

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'normal'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    quantity: 0,
    min_quantity: 10,
    cost_price: '',
    sale_price: '',
    unit: 'un',
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockQuantity, setStockQuantity] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('categories').select('*'),
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id || null,
        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        cost_price: parseFloat(formData.cost_price),
        sale_price: parseFloat(formData.sale_price),
        unit: formData.unit,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (!error) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        if (data) {
          setProducts([...products, data]);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  async function updateStock(productId: string, newQuantity: number) {
    const { error } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId);

    if (!error) {
      setProducts(products.map(p =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      ));
      setShowStockModal(false);
      setStockProduct(null);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      quantity: 0,
      min_quantity: 10,
      cost_price: '',
      sale_price: '',
      unit: 'un',
    });
    setEditingProduct(null);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category_id: product.category_id || '',
      quantity: product.quantity,
      min_quantity: product.min_quantity,
      cost_price: product.cost_price.toString(),
      sale_price: product.sale_price.toString(),
      unit: product.unit,
    });
    setShowModal(true);
  }

  // Filtered products
  const filteredProducts = products.filter(p => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    if (filterStock === 'low' && p.quantity > p.min_quantity) return false;
    if (filterStock === 'normal' && p.quantity <= p.min_quantity) return false;
    return true;
  });

  // Stats
  const lowStockCount = products.filter(p => p.quantity <= p.min_quantity).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * Number(p.cost_price)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">Controle de Estoque</h1>
          <p className="text-gray-500">{products.length} produtos cadastrados</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowModal(true); resetForm(); }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus size={18} />
          Novo Produto
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-100">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning-100">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-bold text-warning-600">{lowStockCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success-100">
              <Package className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-success-600">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'low', label: 'Baixo' },
              { id: 'normal', label: 'Normal' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterStock(type.id as typeof filterStock)}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  filterStock === type.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => {
          const isLowStock = product.quantity <= product.min_quantity;
          const category = categories.find(c => c.id === product.category_id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 group hover:shadow-lg transition-all"
            >
              {/* Stock indicator */}
              {isLowStock && (
                <div className="bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-medium py-1 px-3 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Estoque baixo
                </div>
              )}

              <div className="p-5">
                {/* Product icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-xl ${isLowStock ? 'bg-warning-100' : 'bg-primary-100'}`}>
                    <Package className={`w-8 h-8 ${isLowStock ? 'text-warning-600' : 'text-primary-600'}`} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Product info */}
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                {category && (
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-lg mb-3">
                    {category.name}
                  </span>
                )}

                {/* Stock controls */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
                  <span className="text-sm text-gray-500">Quantidade</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setStockProduct(product);
                        setStockQuantity(product.quantity);
                        setShowStockModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <ArrowDown size={16} />
                    </motion.button>
                    <span className={`font-bold text-lg min-w-[3rem] text-center ${isLowStock ? 'text-warning-600' : 'text-gray-800'}`}>
                      {product.quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateStock(product.id, product.quantity + 1)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <ArrowUp size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Prices */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Custo:</span>
                  <span className="font-medium text-gray-600">
                    R$ {Number(product.cost_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-400">Venda:</span>
                  <span className="font-bold text-success-600">
                    R$ {Number(product.sale_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Filter size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-display font-semibold text-gray-800">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Racao Premium 15kg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descricao opcional"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Minimo</label>
                    <input
                      type="number"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preco Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preco Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  >
                    <option value="un">Unidade</option>
                    <option value="kg">Quilograma</option>
                    <option value="lt">Litro</option>
                    <option value="pct">Pacote</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showStockModal && stockProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowStockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-display font-semibold text-gray-800">Ajustar Estoque</h2>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">{stockProduct.name}</p>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setStockQuantity(Math.max(0, stockQuantity - 1))}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <ArrowDown size={24} className="text-gray-600" />
                  </motion.button>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-3xl font-bold text-gray-800 border-0 focus:ring-0 outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setStockQuantity(stockQuantity + 1)}
                    className="p-3 bg-primary-100 hover:bg-primary-200 rounded-xl transition-colors"
                  >
                    <ArrowUp size={24} className="text-primary-600" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateStock(stockProduct.id, stockQuantity)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
                >
                  Atualizar Estoque
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
