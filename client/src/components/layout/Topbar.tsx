import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../ui/Badge';

interface TopbarProps { title?: string; }

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60"
    >
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        {user && <RoleBadge role={user.role_name} />}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Bell className="w-4 h-4" />
        </motion.button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </motion.header>
  );
};

