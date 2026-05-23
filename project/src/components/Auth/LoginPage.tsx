import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Mail, Lock, ArrowRight, PawPrint, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const DEMO_CREDENTIALS = {
  email: 'valter@agrotudo.com.br',
  password: 'agrotudo',
  name: 'Valter - Administrador'
};

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('agrotudo_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (showReset) {
        const { error } = await resetPassword(email);
        setLoading(false);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Email de recuperacao enviado com sucesso! Verifique sua caixa de entrada.');
          setTimeout(() => setShowReset(false), 3000);
        }
        return;
      }

      // Check for demo credentials first
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Create demo user in Supabase if doesn't exist
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', DEMO_CREDENTIALS.email)
          .maybeSingle();

        if (!existingUser) {
          // Try to sign up the demo user
          const { error: signUpError } = await signUp(
            DEMO_CREDENTIALS.email,
            DEMO_CREDENTIALS.password,
            DEMO_CREDENTIALS.name
          );

          if (signUpError && !signUpError.message.includes('already registered')) {
            setError('Erro ao criar usuario demo. Tente novamente.');
            setLoading(false);
            return;
          }
        }

        // Now sign in
        const { error: signInError } = await signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);

        if (signInError) {
          setError('Email ou senha incorretos');
        } else {
          if (rememberMe) {
            localStorage.setItem('agrotudo_remember_email', email);
          } else {
            localStorage.removeItem('agrotudo_remember_email');
          }
        }
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos. Verifique suas credenciais.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Email nao confirmado. Verifique sua caixa de entrada.');
          } else {
            setError(error.message);
          }
        } else {
          if (rememberMe) {
            localStorage.setItem('agrotudo_remember_email', email);
          } else {
            localStorage.removeItem('agrotudo_remember_email');
          }
        }
      } else {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        setLoading(false);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email ja esta cadastrado. Faca logininstead.');
            setTimeout(() => setIsLogin(true), 2000);
          } else {
            setError(error.message);
          }
        } else {
          setMessage('Conta criada com sucesso! Voce ja pode fazer login.');
          setTimeout(() => {
            setIsLogin(true);
            setMessage(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setRememberMe(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        {/* Floating paw prints */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary-200/30"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 5,
              delay: i * 0.4,
              repeat: Infinity
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <PawPrint size={24 + Math.random() * 30} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-amber-500 shadow-glow-lg mb-5 relative overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Dog className="w-12 h-12 text-white relative z-10" strokeWidth={2.5} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="absolute w-8 h-8 text-white/20" style={{ top: '10%', right: '10%' }} />
              <Sparkles className="absolute w-6 h-6 text-white/20" style={{ bottom: '15%', left: '10%' }} />
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Agropecuaria Agrotudo
          </h1>
          <p className="text-gray-500">Seu parceiro completo em agro e pet</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-card p-8 border border-gray-100 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-amber-50/50 pointer-events-none" />

          <div className="relative">
            {showReset ? (
              <>
                <h2 className="text-xl font-display font-semibold text-gray-800 mb-2">
                  Recuperar Senha
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Digite seu email para receber as instrucoes de recuperacao
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-display font-semibold text-gray-800 mb-2">
                  {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {isLogin
                    ? 'Entre com suas credenciais para continuar'
                    : 'Preencha os dados para criar sua conta'}
                </p>
              </>
            )}

            {/* Demo Credentials Banner */}
            {isLogin && !showReset && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-amber-50 border border-primary-200 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">Credenciais de Demonstracao</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <p><span className="font-medium">Email:</span> {DEMO_CREDENTIALS.email}</p>
                  <p><span className="font-medium">Senha:</span> {DEMO_CREDENTIALS.password}</p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fillDemoCredentials}
                  className="w-full py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Usar credenciais demo
                </motion.button>
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4"
                >
                  <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <div className="mt-0.5 flex-shrink-0">
                      <Shield size={16} className="text-danger-500" />
                    </div>
                    <div>
                      <p className="font-medium">Erro de autenticacao</p>
                      <p className="text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4"
                >
                  <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <div className="mt-0.5 flex-shrink-0">
                      <Sparkles size={16} className="text-success-500" />
                    </div>
                    <div>
                      <p className="font-medium">Sucesso!</p>
                      <p className="text-xs mt-1">{message}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showReset && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none bg-white/70"
                      placeholder="Seu nome completo"
                      required={!isLogin}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Dog size={18} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none bg-white/70"
                    placeholder="seu@email.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              {!showReset && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none bg-white/70"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me checkbox */}
              {isLogin && !showReset && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 transition-all ${
                        rememberMe
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-gray-300 group-hover:border-primary-400'
                      }`}>
                        {rememberMe && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center h-full"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>{showReset ? 'Enviar Email' : isLogin ? 'Entrar' : 'Criar Conta'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 space-y-3">
              {showReset && (
                <button
                  onClick={() => {
                    setShowReset(false);
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Voltar ao login
                </button>
              )}

              {!showReset && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setMessage(null);
                    }}
                    className="w-full text-center text-sm text-gray-600"
                  >
                    {isLogin ? (
                      <>
                        Nao tem uma conta?{' '}
                        <span className="text-primary-600 font-medium hover:text-primary-700 transition-colors">Criar conta</span>
                      </>
                    ) : (
                      <>
                        Ja tem uma conta?{' '}
                        <span className="text-primary-600 font-medium hover:text-primary-700 transition-colors">Fazer login</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-gray-400 text-xs">
            2024 Agropecuaria Agrotudo. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Sistema de gestao para agro e petshop
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
