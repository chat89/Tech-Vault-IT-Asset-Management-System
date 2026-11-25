import { motion } from 'framer-motion';

interface PageHeaderProps {
  title:    string;
  subtitle?: string;
  actions?:  React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
  >
    <div>
      <h1 className="text-xl font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </motion.div>
);

