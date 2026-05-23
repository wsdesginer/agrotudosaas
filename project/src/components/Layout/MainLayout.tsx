import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dog,
  LayoutDashboard,
  DollarSign,
  Package,
  Truck,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  PawPrint,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'settings', label: 'Configuracoes', icon: Settings },
];

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 shadow-soft z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <motion.div
            className="p-6 border-b border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-glow">
                <Dog className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display font-bold text-gray-800">Agrotudo</h1>
                <p className="text-xs text-gray-400">Sistema de Gestao</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'}
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <ChevronRight size={16} className="ml-auto" />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            {/* Decorative paw prints */}
            <div className="mt-8 px-4">
              <div className="relative h-24 bg-gradient-to-br from-primary-50 to-amber-50 rounded-2xl overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -right-4 -bottom-4"
                >
                  <PawPrint size={60} className="text-primary-100" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-gray-500 text-center px-4">
                    Sistema inteligente<br />para seu negocio
                  </p>
                </div>
              </div>
            </div>
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 flex items-center justify-center text-white font-medium">
                {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {profile?.name || 'Administrador'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl lg:hidden"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="font-display font-semibold text-gray-800">
                  {menuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-400">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile close button */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-xl lg:hidden"
          >
            <X size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
