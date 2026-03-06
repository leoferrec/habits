import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

const iconMap = {
  xp: Zap,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

const bgMap = {
  xp: 'var(--color-primary)',
  success: 'var(--color-success)',
  info: 'var(--color-text-secondary)',
  warning: 'var(--color-warning)',
};

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="fixed top-16 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-lg pointer-events-auto"
              style={{
                backgroundColor: bgMap[toast.type],
                boxShadow: `0 4px 20px ${bgMap[toast.type]}40`,
              }}
            >
              <Icon size={16} />
              <span>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
