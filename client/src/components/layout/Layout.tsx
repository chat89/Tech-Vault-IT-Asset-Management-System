import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitles: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/assets':      'Asset Management',
  '/requests':    'Asset Requisitions & Requests',
  '/assignments': 'Assignments',
  '/maintenance': 'Maintenance',
  '/users':       'User Management',
  '/audit-logs':  'Audit Logs',
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in:      { opacity: 1, y: 0 },
  out:     { opacity: 0, y: -8 },
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const title    = pageTitles[location.pathname] ?? 'TechVault';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ type: 'tween', duration: 0.2 }}
            className="flex-1 p-6 overflow-auto"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

