import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Truck,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Supplier } from '../../types/database';

function getDueStatus(dueDate: string | null) {
  if (!dueDate) return { status: 'ok', label: 'Sem vencimento', color: 'gray' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'overdue', label: `${Math.abs(diffDays)} dias atrasado`, color: 'danger' };
  if (diffDays === 0) return { status: 'due-today', label: 'Vence hoje', color: 'warning' };
  if (diffDays <= 3) return { status: 'due-soon', label: `${diffDays} dias`, color: 'warning' };
  if (diffDays <= 7) return { status: 'due-week', label: `${diffDays} dias`, color: 'primary' };
  return { status: 'ok', label: `${diffDays} dias`, color: 'success' };
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    products: '',
    billing_amount: '',
    next_due_date: '',
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const { data } = await supabase.from('suppliers').select('*').order('name');
      if (data) setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const supplierData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        products: formData.products,
        billing_amount: parseFloat(formData.billing_amount) || 0,
        next_due_date: formData.next_due_date || null,
        notes: formData.notes,
      };

      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier.id);
        if (!error) {
          setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...supplierData } : s));
        }
      } else {
        const { data, error } = await supabase
          .from('suppliers')
          .insert(supplierData)
          .select()
          .single();
        if (data) {
          setSuppliers([...suppliers, data]);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  }

  async function updateBillingStatus(id: string, status: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ billing_status: status, last_payment_date: status === 'paid' ? new Date().toISOString() : null })
      .eq('id', id);

    if (!error) {
      setSuppliers(suppliers.map(s =>
        s.id === id ? { ...s, billing_status: status, last_payment_date: status === 'paid' ? new Date().toISOString() : null } : s
      ));
    }
  }

  async function deleteSupplier(id: string) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      products: '',
      billing_amount: '',
      next_due_date: '',
      notes: '',
    });
    setEditingSupplier(null);
  }

  function openEditModal(supplier: Supplier) {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      products: supplier.products,
      billing_amount: supplier.billing_amount.toString(),
      next_due_date: supplier.next_due_date ? supplier.next_due_date.split('T')[0] : '',
      notes: supplier.notes,
    });
    setShowModal(true);
  }

  const filteredSuppliers = suppliers.filter(s => {
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus !== 'all' && s.billing_status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: suppliers.length,
    pending: suppliers.filter(s => s.billing_status === 'pending').length,
    paid: suppliers.filter(s => s.billing_status === 'paid').length,
    overdue: suppliers.filter(s => s.billing_status === 'overdue').length,
    totalAmount: suppliers.reduce((sum, s) => sum + Number(s.billing_amount), 0),
  };

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
          <h1 className="text-2xl font-display font-bold text-gray-800">Fornecedores</h1>
          <p className="text-gray-500">Gerencie seus fornecedores e boletos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowModal(true); resetForm(); }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus size={18} />
          Novo Fornecedor
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-warning-500" />
            <span className="text-sm text-gray-500">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success-500" />
            <span className="text-sm text-gray-500">Pagos</span>
          </div>
          <p className="text-2xl font-bold text-success-600">{stats.paid}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Total Boletos</span>
          </div>
          <p className="text-xl font-bold">
            R$ {stats.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {suppliers.filter(s => s.billing_status === 'overdue').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-danger-500 to-danger-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertCircle className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="font-display font-semibold text-lg">Atencao!</h3>
              <p className="text-white/90">
                Voce tem {suppliers.filter(s => s.billing_status === 'overdue').length} boleto(s) atrasado(s)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'paid', label: 'Pagos' },
              { id: 'overdue', label: 'Atrasados' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterStatus(type.id as typeof filterStatus)}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  filterStatus === type.id
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier, index) => {
          const dueInfo = getDueStatus(supplier.next_due_date);

          return (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-lg transition-all group"
            >
              {/* Status indicator */}
              <div className={`px-4 py-2 flex items-center justify-between ${
                supplier.billing_status === 'paid' ? 'bg-success-50' :
                supplier.billing_status === 'overdue' ? 'bg-danger-50' :
                'bg-warning-50'
              }`}>
                <div className="flex items-center gap-2">
                  {supplier.billing_status === 'paid' ? (
                    <CheckCircle size={16} className="text-success-600" />
                  ) : supplier.billing_status === 'overdue' ? (
                    <AlertCircle size={16} className="text-danger-600" />
                  ) : (
                    <Clock size={16} className="text-warning-600" />
                  )}
                  <span className={`text-sm font-medium capitalize ${
                    supplier.billing_status === 'paid' ? 'text-success-700' :
                    supplier.billing_status === 'overdue' ? 'text-danger-700' :
                    'text-warning-700'
                  }`}>
                    {supplier.billing_status === 'paid' ? 'Pago' : supplier.billing_status === 'overdue' ? 'Atrasado' : 'Pendente'}
                  </span>
                </div>
                {supplier.next_due_date && (
                  <span className={`text-sm font-medium ${
                    dueInfo.color === 'danger' ? 'text-danger-600' :
                    dueInfo.color === 'warning' ? 'text-warning-600' :
                    dueInfo.color === 'success' ? 'text-success-600' : 'text-gray-500'
                  }`}>
                    {dueInfo.label}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      supplier.billing_status === 'paid' ? 'bg-success-100' :
                      supplier.billing_status === 'overdue' ? 'bg-danger-100' :
                      'bg-warning-100'
                    }`}>
                      <Truck className={`w-6 h-6 ${
                        supplier.billing_status === 'paid' ? 'text-success-600' :
                        supplier.billing_status === 'overdue' ? 'text-danger-600' :
                        'text-warning-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{supplier.name}</h3>
                      {supplier.products && (
                        <p className="text-sm text-gray-500">{supplier.products}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(supplier)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteSupplier(supplier.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={14} />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={14} />
                      {supplier.email}
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      {supplier.address}
                    </div>
                  )}
                </div>

                {/* Billing info */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Valor Boleto</span>
                  </div>
                  <span className="font-bold text-lg text-gray-800">
                    R$ {Number(supplier.billing_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Due date */}
                {supplier.next_due_date && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Vencimento</span>
                    </div>
                    <span className="font-bold text-lg text-gray-800">
                      {new Date(supplier.next_due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateBillingStatus(supplier.id, 'paid')}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      supplier.billing_status === 'paid'
                        ? 'bg-success-100 text-success-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-success-50 hover:text-success-600'
                    }`}
                  >
                    <CheckCircle size={16} />
                    {supplier.billing_status === 'paid' ? 'Pago' : 'Marcar Pago'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateBillingStatus(supplier.id, 'pending')}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      supplier.billing_status === 'pending'
                        ? 'bg-warning-100 text-warning-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-warning-50 hover:text-warning-600'
                    }`}
                  >
                    <Clock size={16} />
                    Pendente
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Truck size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Nenhum fornecedor encontrado</p>
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
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do fornecedor"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Endereco completo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produtos Fornecidos</label>
                  <input
                    type="text"
                    value={formData.products}
                    onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                    placeholder="Ex: Racoes, Medicamentos"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Boleto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.billing_amount}
                      onChange={(e) => setFormData({ ...formData, billing_amount: e.target.value })}
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Vencimento</label>
                    <input
                      type="date"
                      value={formData.next_due_date}
                      onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observacoes adicionais"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingSupplier ? 'Atualizar Fornecedor' : 'Cadastrar Fornecedor'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
