import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?:    React.ReactNode;
}

const variants = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 shadow-lg',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  danger:    'bg-red-600/90 hover:bg-red-500 text-white shadow-red-900/30 shadow-lg',
  ghost:     'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white',
  outline:   'border border-slate-700 hover:border-slate-500 bg-transparent text-slate-300 hover:text-white',
};
const sizes = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2   text-sm gap-2',
  lg:  'px-6 py-2.5 text-base gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...rest
}) => (
  <motion.button
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={  { scale: disabled || loading ? 1 : 0.97 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    className={clsx(
      'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none',
      variants[variant], sizes[size], className
    )}
    disabled={disabled || loading}
    {...(rest as React.ComponentProps<typeof motion.button>)}
  >
    {loading ? <Spinner size="sm" /> : icon}
    {children}
  </motion.button>
);

