import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Package,
  DollarSign,
  Clock,
  X,
  Check,
  Trash2,
  Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Alert } from '../../types/database';

const alertConfig = {
  stock: { icon: Package, label: 'Estoque', color: 'warning' },
  billing: { icon: DollarSign, label: 'Financeiro', color: 'danger' },
  financial: { icon: DollarSign, label: 'Financeiro', color: 'success' },
  system: { icon: Info, label: 'Sistema', color: 'primary' },
};

const severityConfig = {
  info: { icon: Info, label: 'Informacao', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' },
  warning: { icon: AlertTriangle, label: 'Atencao', bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', iconColor: 'text-warning-500' },
  error: { icon: AlertCircle, label: 'Urgente', bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', iconColor: 'text-danger-500' },
  success: { icon: CheckCircle, label: 'Sucesso', bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700', iconColor: 'text-success-500' },
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'billing' | 'financial' | 'system'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setAlerts(alerts.map(a =>
        a.id === id ? { ...a, is_read: true } : a
      ));
    }
  }

  async function resolveAlert(id: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setAlerts(alerts.map(a =>
        a.id === id ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a
      ));
    }
  }

  async function deleteAlert(id: string) {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (!error) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  }

  const filteredAlerts = alerts.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterResolved === 'active' && a.is_resolved) return false;
    if (filterResolved === 'resolved' && !a.is_resolved) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.is_read).length,
    active: alerts.filter(a => !a.is_resolved).length,
    resolved: alerts.filter(a => a.is_resolved).length,
    urgent: alerts.filter(a => a.severity === 'error' && !a.is_resolved).length,
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
          <h1 className="text-2xl font-display font-bold text-gray-800">Central de Alertas</h1>
          <p className="text-gray-500">Gerencie todas as notificacoes do sistema</p>
        </div>
        {stats.unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl"
          >
            <Bell size={18} />
            <span className="font-medium">{stats.unread} nao lidos</span>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Todos', value: stats.total, icon: Bell, color: 'gray' },
          { label: 'Nao Lidos', value: stats.unread, icon: Bell, color: 'primary' },
          { label: 'Ativos', value: stats.active, icon: AlertCircle, color: 'warning' },
          { label: 'Resolvidos', value: stats.resolved, icon: CheckCircle, color: 'success' },
          { label: 'Urgentes', value: stats.urgent, icon: AlertTriangle, color: 'danger' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-card border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${
                stat.color === 'primary' ? 'text-primary-500' :
                stat.color === 'warning' ? 'text-warning-500' :
                stat.color === 'success' ? 'text-success-500' :
                stat.color === 'danger' ? 'text-danger-500' : 'text-gray-400'
              }`} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${
              stat.color === 'primary' ? 'text-primary-600' :
              stat.color === 'warning' ? 'text-warning-600' :
              stat.color === 'success' ? 'text-success-600' :
              stat.color === 'danger' ? 'text-danger-600' : 'text-gray-800'
            }`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filtrar:</span>
          </div>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'stock', label: 'Estoque' },
              { id: 'billing', label: 'Boletos' },
              { id: 'financial', label: 'Financeiro' },
              { id: 'system', label: 'Sistema' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id as typeof filterType)}
                className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  filterType === type.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'resolved', label: 'Resolvidos' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setFilterResolved(status.id as typeof filterResolved)}
                className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  filterResolved === status.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert, index) => {
          const typeConfig = alertConfig[alert.type as keyof typeof alertConfig] || alertConfig.system;
          const sevConfig = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
          const TypeIcon = typeConfig.icon;
          const SevIcon = sevConfig.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border transition-all ${
                alert.is_resolved
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : `${sevConfig.bg} ${sevConfig.border}`
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <motion.div
                    animate={alert.severity === 'error' && !alert.is_resolved ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`p-3 rounded-xl ${
                      alert.is_resolved
                        ? 'bg-gray-100'
                        : alert.severity === 'error'
                        ? 'bg-danger-100'
                        : alert.severity === 'warning'
                        ? 'bg-warning-100'
                        : alert.severity === 'success'
                        ? 'bg-success-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <TypeIcon className={`w-6 h-6 ${
                      alert.is_resolved
                        ? 'text-gray-400'
                        : alert.severity === 'error'
                        ? 'text-danger-600'
                        : alert.severity === 'warning'
                        ? 'text-warning-600'
                        : alert.severity === 'success'
                        ? 'text-success-600'
                        : 'text-blue-600'
                    }`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                        alert.is_resolved
                          ? 'bg-gray-200 text-gray-600'
                          : typeConfig.color === 'warning'
                          ? 'bg-warning-100 text-warning-700'
                          : typeConfig.color === 'danger'
                          ? 'bg-danger-100 text-danger-700'
                          : typeConfig.color === 'success'
                          ? 'bg-success-100 text-success-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {typeConfig.label}
                      </span>
                      {!alert.is_read && !alert.is_resolved && (
                        <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded-lg">
                          Novo
                        </span>
                      )}
                    </div>

                    <h3 className={`font-semibold mb-1 ${
                      alert.is_resolved ? 'text-gray-600' : sevConfig.text
                    }`}>
                      {alert.title}
                    </h3>

                    <p className={`text-sm ${alert.is_resolved ? 'text-gray-500' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </div>
                      {alert.is_resolved && alert.resolved_at && (
                        <div className="flex items-center gap-1 text-success-500">
                          <Check size={12} />
                          Resolvido em {new Date(alert.resolved_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!alert.is_read && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markAsRead(alert.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Marcar como lido"
                      >
                        <Bell size={16} />
                      </motion.button>
                    )}

                    {!alert.is_resolved && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => resolveAlert(alert.id)}
                        className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                        title="Resolver"
                      >
                        <Check size={16} />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
          </motion.div>
          <p className="text-gray-400">Nenhum alerta encontrado</p>
        </div>
      )}
    </div>
  );
}
