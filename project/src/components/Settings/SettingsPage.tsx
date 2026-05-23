import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Database,
  HelpCircle,
  Save,
  Dog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'company', label: 'Empresa', icon: Building },
  { id: 'notifications', label: 'Notificacoes', icon: Bell },
  { id: 'security', label: 'Seguranca', icon: Shield },
  { id: 'appearance', label: 'Aparencia', icon: Palette },
  { id: 'data', label: 'Dados', icon: Database },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">Configuracoes</h1>
        <p className="text-gray-500">Gerencie as configuracoes do sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <nav className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className={activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'} />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-amber-400 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{profile?.name || 'Administrador'}</h2>
                  <p className="text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    defaultValue={profile?.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={profile?.email}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Save size={18} />
                Salvar Alteracoes
              </motion.button>
            </motion.div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-amber-400 flex items-center justify-center shadow-glow">
                  <Dog className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Agropecuaria Agrotudo</h2>
                  <p className="text-gray-500">Sistema de Gestao</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    defaultValue="Agropecuaria Agrotudo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
                  <input
                    type="text"
                    placeholder="Endereco completo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="contato@agrotudo.com.br"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Save size={18} />
                Salvar Alteracoes
              </motion.button>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferencias de Notificacao</h2>

              {[
                { id: 'stock', label: 'Alertas de Estoque Baixo', desc: 'Notificar quando produtos estiverem com estoque minimo' },
                { id: 'billing', label: 'Vencimento de Boletos', desc: 'Alertar sobre boletos proximos do vencimento' },
                { id: 'sales', label: 'Resumo de Vendas', desc: 'Resumo diario das vendas realizadas' },
                { id: 'system', label: 'Atualizacoes do Sistema', desc: 'Noticias e atualizacoes do Agrotudo' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              ))}
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Seguranca</h2>

              <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Save size={18} />
                Alterar Senha
              </motion.button>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Aparencia</h2>

              <div className="gap-4">
                <p className="text-sm text-gray-500 mb-3">Tema do Sistema</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Claro', color: 'bg-white' },
                    { id: 'auto', label: 'Automatico', color: 'bg-gradient-to-r from-white to-gray-300' },
                    { id: 'dark', label: 'Escuro', color: 'bg-gray-800' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme.id === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-12 ${theme.color} rounded-lg mb-2 border border-gray-200`} />
                      <p className="text-sm font-medium text-gray-700">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Cor de Destaque</p>
                <div className="flex gap-3">
                  {['#FF7A00', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      style={{ backgroundColor: color }}
                      className={`w-12 h-12 rounded-xl shadow-lg border-2 transition-all ${
                        color === '#FF7A00' ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Gerenciamento de Dados</h2>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">Exportar Dados</h3>
                <p className="text-sm text-gray-500 mb-4">Exporte todos os dados do sistema em formato CSV ou Excel.</p>
                <button className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors">
                  Exportar Dados
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">Backup Automatico</h3>
                <p className="text-sm text-gray-500 mb-4">Configure backups automaticos dos seus dados.</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="p-4 bg-danger-50 rounded-xl border border-danger-200">
                <h3 className="font-medium text-danger-700 mb-2">Zona de Perigo</h3>
                <p className="text-sm text-danger-600 mb-4">A exclusao de dados e permanente e nao pode ser desfeita.</p>
                <button className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors">
                  Limpar Todos os Dados
                </button>
              </div>
            </motion.div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Central de Ajuda</h2>

              <div className="space-y-2">
                {[
                  { title: 'Como cadastrar produtos?', desc: 'Aprenda a adicionar novos produtos ao estoque' },
                  { title: 'Gerenciando fornecedores', desc: 'Como cadastrar e controlar boletos' },
                  { title: 'Relatorios financeiros', desc: 'Como gerar e exportar relatorios' },
                  { title: 'Configurando alertas', desc: 'Personalize notificacoes do sistema' },
                  { title: 'Sistema de IA', desc: 'Recursos inteligentes do Agrotudo' },
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </motion.button>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Ainda precisa de ajuda?</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Entre em contato conosco
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
