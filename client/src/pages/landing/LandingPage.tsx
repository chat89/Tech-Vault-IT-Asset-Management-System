import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Shield, Cpu, RefreshCw, BarChart3, Users,
  CheckCircle, ArrowRight, Lock, Laptop,
  ChevronDown, Sparkles, Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const featureCards = [
    {
      icon: <Laptop className="w-6 h-6 text-indigo-400" />,
      title: 'Lifecycle Asset Tracking',
      desc: 'Complete tracking from procurement to decommission with barcode/tag identification, hardware specifications, and warranty counters.'
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: 'Role-Based Access Control',
      desc: 'Multi-tiered privileges separating Super Admins, IT Technicians, and Employees with atomic database level permission validation.'
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: 'Employee Requisition Workflow',
      desc: 'Intuitive self-service portal for employees to request laptops, peripherals, and software with multi-stage approval hierarchies.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
      title: 'Maintenance Automation',
      desc: 'Preventive and corrective maintenance logs. Automatic state changes dynamically locking assets into maintenance mode.'
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      title: 'SOC2 & OWASP Audit Trail',
      desc: 'Immutable audit logs detailing actor IDs, timestamps, origin IPs, user agents, and JSONB modification change sets.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      title: 'Executive Real-Time Analytics',
      desc: 'Instant visibility over total capital valuation, utilization ratios, departmental allocations, and upcoming refresh cycles.'
    }
  ];

  const workflowSteps = [
    {
      num: '01',
      title: 'Self-Service Employee Requisition',
      desc: 'Personnel choose required equipment, specify business need, and assign urgency through a clean, guided portal.'
    },
    {
      num: '02',
      title: 'IT Admin Evaluation & Quotas',
      desc: 'IT Administrators receive notification, verify department eligibility, and approve or request alterations in one click.'
    },
    {
      num: '03',
      title: 'Atomic Inventory Allocation',
      desc: 'Hardware is assigned via transaction-safe database procedures, updating asset status and generating custody agreements.'
    },
    {
      num: '04',
      title: 'Lifecycle Care & Automated Return',
      desc: 'Periodic preventative maintenance scheduling, condition check-ins, and return inspections recorded to the asset history.'
    }
  ];

  const testimonials = [
    {
      quote: "TechVault cut our employee IT onboarding provisioning time from 4 days to 45 minutes. The audit logging gave our compliance auditors zero hesitation.",
      name: "David Kelling",
      role: "VP of Enterprise Architecture",
      company: "Nexus Financial Cloud"
    },
    {
      quote: "The asset requisition approval workflow completely eliminated lost peripherals and unrecorded developer workstations across our 1,200 remote staff.",
      name: "Sarah Jenkins",
      role: "Director of Global IT Operations",
      company: "Vanguard BioTech"
    },
    {
      quote: "Switching from fragmented spreadsheets to TechVault gave us instant visibility over our \$8.4M IT hardware inventory across 6 global data centers.",
      name: "Michael Ramirez",
      role: "Chief Information Security Officer",
      company: "Starlight Media"
    }
  ];

  const pricingTiers = [
    {
      name: 'Starter Org',
      price: '\$0',
      period: 'Community Edition',
      desc: 'Ideal for tech startups and small internal labs managing up to 100 devices.',
      features: ['Up to 100 Managed Assets', '3 Administrator Seats', 'Basic Requisition Flow', 'Community Discord Support'],
      highlight: false
    },
    {
      name: 'Enterprise Cloud',
      price: '\$24',
      period: 'per seat / month',
      desc: 'Complete asset lifecycle, multi-tiered RBAC, and automated maintenance workflows.',
      features: ['Unlimited Hardware & Software Assets', 'Unlimited Employee Self-Service', 'Automated Preventive Maintenance', 'Full Immutable Audit Logs', 'SSO / SAML 2.0 Integration'],
      highlight: true
    },
    {
      name: 'Defense & Dedicated',
      price: 'Custom',
      period: 'Annual billing',
      desc: 'Air-gapped on-premise Kubernetes clusters with dedicated PostgreSQL failover.',
      features: ['Dedicated Neon/PostgreSQL Cluster', 'SOC2 Type II & FedRAMP Compliance', 'Custom Approval Matrixes', '24/7/365 Dedicated SLA Support'],
      highlight: false
    }
  ];

  const faqs = [
    {
      q: 'How does the employee asset request workflow work?',
      a: 'Any logged-in employee can navigate to "Asset Requests" and submit a ticket for hardware or software. IT Admins and Super Admins get notified, can review the justification, and immediately approve or fulfill the ticket by allocating available inventory in an atomic transaction.'
    },
    {
      q: 'Can TechVault integrate with existing PostgreSQL databases?',
      a: 'Yes. TechVault is engineered natively for standard PostgreSQL and Serverless Neon. It includes automatic, idempotent migrations that seed standard IT categories and permission matrixes.'
    },
    {
      q: 'What role-based access control (RBAC) levels are supported?',
      a: 'TechVault provides 3 primary roles out of the box: Super Admin (complete system control & user provisioning), IT Administrator (inventory, assignments, maintenance, and request approvals), and Employee (viewing personal custody and submitting equipment requests).'
    },
    {
      q: 'Are audit logs tamper-proof?',
      a: 'Yes. Audit logs are write-only append logs that capture the initiating user ID, target entity, JSON change diffs, client IP address, and browser agent.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ──────────────── 1. NAVIGATION BAR ──────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">TechVault</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Enterprise v2.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#workflow" className="hover:text-white transition-colors">Employee Requisitions</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/dashboard')} size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Launch Console
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Button onClick={() => navigate('/login')} size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Access Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────── 2. HERO SECTION ──────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-User Role-Based IT Asset Governance for Modern Enterprises</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Manage Every IT Asset.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Empower Every Employee.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            A high-assurance system engineered to eliminate shadow IT, automate hardware requisitions, 
            track preventive maintenance, and maintain unbroken custody records from onboarding to retirement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/login')} icon={<ArrowRight className="w-5 h-5" />}>
              Open Management Console
            </Button>
            <a
              href="#workflow"
              className="inline-flex items-center justify-center font-medium rounded-xl px-6 py-2.5 text-base text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Explore Requisition Workflow
            </a>
          </motion.div>

          {/* Quick Demo Credentials Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 inline-block p-3 px-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400"
          >
            <span className="font-semibold text-slate-200">Default Demo Credentials:</span>{' '}
            Admin: <code className="text-indigo-400 font-mono">admin@techvault.local</code> /{' '}
            Employee: <code className="text-purple-400 font-mono">alex.rivera@techvault.local</code> (PW:{' '}
            <code className="text-emerald-400 font-mono">Admin@1234</code>)
          </motion.div>
        </div>
      </section>

      {/* ──────────────── 3. CLIENT LOGO / SOCIAL PROOF ──────────────── */}
      <section className="py-12 bg-slate-950/60 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-8">
            Trusted by security-conscious IT engineering teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            {['ACME CORP', 'NEXUS CLOUD', 'CYBERDYNE', 'VANGUARD IT', 'AERODYNAMICS', 'HYPERION'].map((brand) => (
              <span key={brand} className="text-base font-black tracking-widest text-slate-400 hover:text-white transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. ENTERPRISE FEATURES (100% SPEC COMPLIANT) ──────────────── */}
      <section id="features" className="py-24 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">Enterprise Core</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built to Solve Real-World Asset Chaos
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Every feature aligns with standard ITIL asset management frameworks and SOC2 operational compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="p-3.5 rounded-xl bg-slate-800/80 w-fit mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 5. EMPLOYEE REQUISITION WORKFLOW ──────────────── */}
      <section id="workflow" className="py-24 border-b border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-3">Employee Empowerment</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Transparent, Multi-Stage Requisition Workflow
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              How employees request hardware and how IT leadership reviews, allocates, and tracks fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => (
              <div key={step.num} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
                <span className="text-3xl font-black text-indigo-500/30 mb-4 block font-mono">{step.num}</span>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 6. MULTI-USER RBAC COMPARISON ──────────────── */}
      <section className="py-24 bg-slate-900/20 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">Security & Segregation</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Granular Role-Based Permissions
            </p>
            <p className="mt-4 text-slate-400 text-sm">
              Different views and capabilities automatically tailored to the authenticated employee role.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-900">
                  <th className="py-4 px-6 font-semibold">Capability / Permission</th>
                  <th className="py-4 px-6 font-semibold text-purple-400">Super Administrator</th>
                  <th className="py-4 px-6 font-semibold text-indigo-400">IT Administrator</th>
                  <th className="py-4 px-6 font-semibold text-slate-400">Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {[
                  { name: 'Browse Global Inventory & Specs', super: true, admin: true, emp: true },
                  { name: 'Submit Equipment Requisitions', super: true, admin: true, emp: true },
                  { name: 'Review & Approve Employee Requests', super: true, admin: true, emp: false },
                  { name: 'Create, Edit & Retire Hardware Assets', super: true, admin: true, emp: false },
                  { name: 'Assign Hardware to Staff (Atomic Tx)', super: true, admin: true, emp: false },
                  { name: 'Schedule Maintenance & Repairs', super: true, admin: true, emp: false },
                  { name: 'Executive Dashboard Analytics', super: true, admin: true, emp: false },
                  { name: 'User Management & Role Assignment', super: true, admin: false, emp: false },
                  { name: 'Inspect System-Wide Audit Logs', super: true, admin: true, emp: false },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-6 font-medium text-white">{row.name}</td>
                    <td className="py-3.5 px-6">{row.super ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}</td>
                    <td className="py-3.5 px-6">{row.admin ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}</td>
                    <td className="py-3.5 px-6">{row.emp ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ──────────────── 7. ARCHITECTURE & TECH STACK ──────────────── */}
      <section id="architecture" className="py-24 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2 block">
                Production-Ready Stack
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Engineered for High Concurrency & Zero Data Loss
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                TechVault couples an ultra-fast React 19 single-page application with a stateless Express REST API 
                and a normalized PostgreSQL relational database. Every assignment, return, and status change is wrapped 
                in database transactions.
              </p>
              <div className="space-y-3">
                {[
                  'Stateless JWT Authentication with Role & Permission Dual-Layer Verification',
                  'PostgreSQL with UUID Keys, Custom ENUMs & Auto-updating Trigger Functions',
                  'Dedicated Brute-Force Rate Limiting & OWASP Helmet Protection',
                  'Full Docker & Docker Compose container orchestration ready for deployment'
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-500">
                <Terminal className="w-4 h-4" />
                <span>techvault-architecture-matrix.json</span>
              </div>
              <p className="text-purple-400">// Frontend Layer</p>
              <p className="pl-4">React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion</p>
              <p className="text-indigo-400">// API Layer</p>
              <p className="pl-4">Node.js + Express.js + Zod Validation + Rate Limiters</p>
              <p className="text-emerald-400">// Persistence</p>
              <p className="pl-4">PostgreSQL 16 / Neon Serverless (ACID Compliant)</p>
              <p className="text-amber-400">// Security Standard</p>
              <p className="pl-4">Bcrypt (cost 12), Signed JWT (7d), Helmet, Strict CORS</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 8. PRICING & DEPLOYMENT OPTIONS ──────────────── */}
      <section id="pricing" className="py-24 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">Predictable Licensing</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Flexible Deployment Models
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Run locally via Docker, deploy into your cloud VPC, or adopt managed enterprise licensing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-2xl border flex flex-col justify-between ${
                  tier.highlight
                    ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 relative'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-widest uppercase">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mb-6">{tier.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-500 ml-2">{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-xs text-slate-300">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant={tier.highlight ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 9. TESTIMONIALS / CASE STUDIES ──────────────── */}
      <section className="py-24 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">Proven in Production</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Customer Success Stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
                <p className="text-slate-300 text-sm leading-relaxed italic mb-6">"{t.quote}"</p>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                  <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 10. FREQUENTLY ASKED QUESTIONS ──────────────── */}
      <section id="faq" className="py-24 bg-slate-900/20 border-b border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">Got Questions?</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-white hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 11. FOOTER ──────────────── */}
      <footer className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">TechVault</span>
            <span>— Enterprise IT Asset Management Platform</span>
          </div>

          <div className="flex gap-6">
            <a href="#features" className="hover:text-slate-300">Features</a>
            <a href="#workflow" className="hover:text-slate-300">Requisitions</a>
            <a href="#architecture" className="hover:text-slate-300">Architecture</a>
            <Link to="/login" className="hover:text-slate-300">Admin Sign In</Link>
          </div>

          <p>© {new Date().getFullYear()} TechVault Systems Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
