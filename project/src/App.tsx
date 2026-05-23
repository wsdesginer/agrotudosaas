import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LoadingScreen } from './components/Common/LoadingScreen';
import { LoginPage } from './components/Auth/LoginPage';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { FinancialPage } from './components/Financial/FinancialPage';
import { InventoryPage } from './components/Inventory/InventoryPage';
import { SuppliersPage } from './components/Suppliers/SuppliersPage';
import { AlertsPage } from './components/Alerts/AlertsPage';
import { SettingsPage } from './components/Settings/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsInitializing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || isInitializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'financial':
        return <FinancialPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
