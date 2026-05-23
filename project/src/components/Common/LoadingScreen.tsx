import { motion } from 'framer-motion';
import { Dog, PawPrint } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center z-50">
      {/* Background paw prints */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary-200/20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <PawPrint size={30 + Math.random() * 30} />
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        {/* Mascote */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary-400 via-primary-500 to-amber-500 shadow-glow-lg">
              <Dog className="w-16 h-16 text-white" strokeWidth={2.5} />

              {/* Sparkles around mascot */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.25,
                    repeat: Infinity,
                  }}
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Shadow */}
          <motion.div
            className="mx-auto w-20 h-3 bg-gray-300/40 rounded-full blur-sm"
            animate={{
              scaleX: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Logo Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Agropecuária Agrotudo
          </h1>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden mx-auto mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        <motion.p
          className="text-gray-400 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Carregando...
        </motion.p>
      </div>
    </div>
  );
}
