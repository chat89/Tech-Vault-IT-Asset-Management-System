import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    className={clsx('rounded-full border-2 border-slate-700 border-t-indigo-500', sizes[size], className)}
  />
);

