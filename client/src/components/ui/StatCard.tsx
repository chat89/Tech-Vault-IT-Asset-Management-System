import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatCardProps {
  label:     string;
  value:     number | string;
  icon:      React.ReactNode;
  gradient:  string;   // tailwind gradient string
  sub?:      string;
  delay?:    number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay, type: 'spring', stiffness: 260, damping: 24 }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className={clsx('relative overflow-hidden rounded-2xl p-6 text-white shadow-xl', gradient)}
  >
    {/* Background decoration */}
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />

    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{label}</p>
          <motion.p
            className="mt-1 text-3xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
      </div>
      {sub && <p className="mt-3 text-xs text-white/60">{sub}</p>}
    </div>
  </motion.div>
);

