import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  ShoppingCart,
  PawPrint,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Transaction, Product, Alert, AIInsight } from '../../types/database';

export function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [transRes, prodRes, alertRes, insightRes] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }).limit(20),
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('ai_insights').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5),
      ]);

      if (transRes.data) setTransactions(transRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (alertRes.data) setAlerts(alertRes.data);
      if (insightRes.data) setInsights(insightRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate financial data
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Low stock products
  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);

  // Top selling (simulated based on transactions)
  const topProducts = products.slice(0, 5);

  // Chart data for last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  });

  const chartData = last7Days.map((day, i) => {
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      const today = new Date();
      today.setDate(today.getDate() - (6 - i));
      return tDate.toDateString() === today.toDateString();
    });

    return {
      day: day.slice(0, 3),
      entrada: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
      saida: Math.abs(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)),
    };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-amber-500 rounded-3xl p-6 lg:p-8 text-white"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -top-2 -right-2 lg:top-0 lg:right-8"
          >
            <Sparkles className="w-12 h-12 text-white/30" />
          </motion.div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold mb-2">
            Bem-vindo ao Agrotudo!
          </h2>
          <p className="text-white/80 text-sm lg:text-base max-w-md">
            Voce tem {alerts.length} alertas e {lowStockProducts.length} produtos com estoque baixo.
          </p>
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-8 bottom-0 opacity-20"
        >
          <PawPrint size={100} />
        </motion.div>
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Saldo Atual',
            value: balance,
            icon: DollarSign,
            color: balance >= 0 ? 'success' : 'danger',
            change: '+12%',
            changeUp: true,
          },
          {
            title: 'Entradas Mes',
            value: totalIncome,
            icon: TrendingUp,
            color: 'primary',
            change: '+8%',
            changeUp: true,
          },
          {
            title: 'Saidas Mes',
            value: totalExpense,
            icon: TrendingDown,
            color: 'warning',
            change: '+3%',
            changeUp: false,
          },
          {
            title: 'Produtos',
            value: products.length,
            icon: Package,
            color: 'info',
            change: 'Ativos',
            changeUp: true,
            isCount: true,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.isCount ? 'text-gray-800' : 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'}`}>
                  {stat.isCount ? stat.value : `R$ ${Number(stat.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color === 'primary' ? 'primary' : stat.color === 'success' ? 'success' : stat.color === 'danger' ? 'danger' : stat.color === 'warning' ? 'warning' : 'gray'}-100`}>
                <stat.icon size={20} className={
                  stat.color === 'primary' ? 'text-primary-600' :
                  stat.color === 'success' ? 'text-success-600' :
                  stat.color === 'danger' ? 'text-danger-600' :
                  stat.color === 'warning' ? 'text-warning-600' : 'text-gray-600'
                } />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.changeUp ? (
                <ArrowUpRight size={14} className="text-success-500" />
              ) : (
                <ArrowDownRight size={14} className="text-danger-500" />
              )}
              <span className={`text-sm font-medium ${stat.changeUp ? 'text-success-600' : 'text-danger-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-400 ml-1">vs mes anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-100"
        >
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Fluxo de Caixa - Ultimos 7 dias
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1 h-48 justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((data.entrada / 3000) * 100, 5)}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="w-full max-w-[30px] bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((data.saida / 3000) * 100, 5)}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="w-full max-w-[30px] bg-gradient-to-t from-warning-400 to-warning-300 rounded-t-lg"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{data.day}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-sm text-gray-500">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning-400" />
              <span className="text-sm text-gray-500">Saidas</span>
            </div>
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-800">Estoque Baixo</h3>
            <AlertTriangle className="w-5 h-5 text-warning-500" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 5).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-warning-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-warning-600" />
                    <span className="text-sm font-medium text-gray-700">{product.name}</span>
                  </div>
                  <span className="text-xs font-bold text-warning-600 bg-warning-100 px-2 py-1 rounded-lg">
                    {product.quantity} un
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todos os produtos com estoque ok</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-primary-50 to-amber-50 rounded-2xl p-6 border border-primary-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-primary-600" />
            </motion.div>
            <h3 className="font-display font-semibold text-gray-800">Insights Inteligentes</h3>
          </div>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{insight.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{insight.message}</p>
                      {insight.suggestion && (
                        <p className="text-xs text-primary-600 mt-2 font-medium">
                          💡 {insight.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum insight no momento</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-card border border-gray-100"
        >
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Ultimas Transacoes
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((trans, index) => (
              <motion.div
                key={trans.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${trans.type === 'income' ? 'bg-success-100' : 'bg-danger-100'}`}>
                    {trans.type === 'income' ? (
                      <TrendingUp size={16} className="text-success-600" />
                    ) : (
                      <TrendingDown size={16} className="text-danger-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{trans.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(trans.transaction_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${trans.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                  {trans.type === 'income' ? '+' : '-'} R$ {Number(trans.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-6 shadow-card border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-800">Produtos em Destaque</h3>
          <ShoppingCart className="w-5 h-5 text-primary-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-amber-400 flex items-center justify-center mb-3 shadow-soft group-hover:shadow-glow transition-shadow">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-400 mt-1">Estoque: {product.quantity} {product.unit}</p>
              <p className="text-sm font-bold text-primary-600 mt-2">
                R$ {Number(product.sale_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
