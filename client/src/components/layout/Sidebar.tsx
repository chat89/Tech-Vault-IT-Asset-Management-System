import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Monitor, Users, ClipboardList,
  Wrench, ScrollText, LogOut, Server, ChevronRight, Inbox, Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface NavItem {
  to:    string;
  icon:  React.ReactNode;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard',                   icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/dashboard?tab=forecasting',   icon: <Sparkles className="w-5 h-5 text-amber-400" />, label: 'Procurement Forecast', roles: ['super_admin','it_admin'] },
  { to: '/assets',                      icon: <Monitor         className="w-5 h-5" />, label: 'Assets' },
  { to: '/requests',                    icon: <Inbox           className="w-5 h-5" />, label: 'Asset Requests' },
  { to: '/assignments',                 icon: <ClipboardList   className="w-5 h-5" />, label: 'Assignments', roles: ['super_admin','it_admin'] },
  { to: '/maintenance',                 icon: <Wrench          className="w-5 h-5" />, label: 'Maintenance',  roles: ['super_admin','it_admin'] },
  { to: '/users',                       icon: <Users           className="w-5 h-5" />, label: 'Users',        roles: ['super_admin','it_admin'] },
  { to: '/audit-logs',                  icon: <ScrollText      className="w-5 h-5" />, label: 'Audit Logs',   roles: ['super_admin','it_admin'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout, isRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const isItemActive = (to: string) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }
    return location.pathname === to && (!location.search || !location.search.includes('tab=forecasting'));
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || isRole(...item.roles)
  );

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="flex flex-col w-64 min-h-screen bg-slate-950 border-r border-slate-800/60"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-wide">TechVault</span>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">IT Asset Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Menu</p>
        {visibleItems.map((item) => {
          const active = isItemActive(item.to);
          return (
            <NavLink key={item.to} to={item.to}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-3">
                  <span className={clsx('transition-colors', active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-3 h-3 text-indigo-500 opacity-70" />}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4 border-t border-slate-800/60 pt-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.role_label}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};
