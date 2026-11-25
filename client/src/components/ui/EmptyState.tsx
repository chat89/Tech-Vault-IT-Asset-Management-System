import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?:    React.ReactNode;
  title:    string;
  message?: string;
  action?:  React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center gap-3"
  >
    {icon && <div className="text-slate-600 mb-2">{icon}</div>}
    <p className="text-slate-300 font-medium">{title}</p>
    {message && <p className="text-slate-500 text-sm max-w-xs">{message}</p>}
    {action && <div className="mt-3">{action}</div>}
  </motion.div>
);

