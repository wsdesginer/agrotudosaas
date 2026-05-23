import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  X,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types/database';

const paymentMethods = [
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
  { id: 'credit', label: 'Credito', icon: CreditCard },
  { id: 'debit', label: 'Debito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'boleto', label: 'Boleto', icon: CreditCard },
];

const categories = {
  income: ['Vendas', 'Servicos', 'Outros'],
  expense: ['Fornecedores', 'Operacional', 'Salarios', 'Impostos', 'Outros'],
};

export function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Form state
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('cash');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('transactions').insert({
        type: formType,
        category: formCategory,
        description: formDescription,
        amount: parseFloat(formAmount),
        payment_method: formPaymentMethod,
        transaction_date: new Date(formDate).toISOString(),
      });

      if (!error) {
        setShowModal(false);
        resetForm();
        loadTransactions();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transacao?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  function resetForm() {
    setFormType('income');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormPaymentMethod('cash');
    setFormDate(new Date().toISOString().split('T')[0]);
  }

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (dateFilter.start && new Date(t.transaction_date) < new Date(dateFilter.start)) return false;
    if (dateFilter.end && new Date(t.transaction_date) > new Date(dateFilter.end)) return false;
    return true;
  });

  // Calculate summaries
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

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
          <h1 className="text-2xl font-display font-bold text-gray-800">Controle Financeiro</h1>
          <p className="text-gray-500">Gerencie suas entradas e saidas</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus size={18} />
          Nova Transacao
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} />
            <span className="text-sm font-medium text-white/80">Total Entradas</span>
          </div>
          <p className="text-3xl font-bold">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown size={24} />
            <span className="text-sm font-medium text-white/80">Total Saidas</span>
          </div>
          <p className="text-3xl font-bold">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-5 text-white shadow-lg ${
            balance >= 0
              ? 'bg-gradient-to-br from-primary-500 to-amber-500'
              : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} />
            <span className="text-sm font-medium text-white/80">Saldo</span>
          </div>
          <p className="text-3xl font-bold">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar transacao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'income', label: 'Entradas' },
              { id: 'expense', label: 'Saidas' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id as typeof filterType)}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  filterType === type.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">ate</span>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Descricao</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Pagamento</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-success-100' : 'bg-danger-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={18} className="text-success-600" />
                        ) : (
                          <TrendingDown size={18} className="text-danger-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                      {transaction.category || 'Geral'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-6 text-gray-600 capitalize">
                    {transaction.payment_method}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Filter size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhuma transacao encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
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
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-display font-semibold text-gray-800">Nova Transacao</h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setFormType('income'); setFormCategory(''); }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formType === 'income'
                        ? 'bg-success-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <TrendingUp size={18} />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('expense'); setFormCategory(''); }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formType === 'expense'
                        ? 'bg-danger-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <TrendingDown size={18} />
                    Saida
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descricao
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Venda de racao"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  >
                    <option value="">Selecione...</option>
                    {(formType === 'income' ? categories.income : categories.expense).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormPaymentMethod(method.id)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                            formPaymentMethod === method.id
                              ? 'border-primary-500 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-500'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-xs">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    formType === 'income'
                      ? 'bg-gradient-to-r from-success-500 to-success-600'
                      : 'bg-gradient-to-r from-danger-500 to-danger-600'
                  }`}
                >
                  <Check size={18} />
                  Salvar Transacao
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
