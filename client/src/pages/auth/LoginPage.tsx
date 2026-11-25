import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [email,    setEmail]    = useState('admin@techvault.local');
  const [password, setPassword] = useState('Admin@1234');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border-r border-slate-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TechVault</span>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white leading-tight"
          >
            Enterprise IT Asset<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Management System
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-slate-400 text-base leading-relaxed"
          >
            Track, manage and secure every hardware and software asset across
            your organisation with full audit trails and role-based access.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {['RBAC Security', 'Real-time Dashboard', 'Audit Logs', 'Lifecycle Tracking'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700">
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        <p className="text-slate-600 text-xs">© 2026 TechVault. Enterprise IT Platform.</p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TechVault</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@techvault.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="mt-1.5 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPw ? 'Hide' : 'Show'} password
              </button>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-600">
            Secured by JWT authentication & RBAC
          </p>
        </motion.div>
      </div>
    </div>
  );
};

