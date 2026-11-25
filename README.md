# TechVault — Enterprise IT Asset Management System

A production-grade, secure, web-based IT Asset Management System with strict Role-Based Access Control (RBAC), end-to-end audit logging, maintenance tracking, and an interactive modern dashboard with fluid Framer Motion animations.

Built with **React 19 + TypeScript + Tailwind CSS v4** on the frontend, **Node.js + Express + TypeScript** on the backend, and **PostgreSQL (Neon compatible)** for ACID-compliant persistence.

---

## 🌟 Key Features

### 1. Robust Role-Based Access Control (RBAC)
- **Roles:** Super Admin, IT Administrator, Employee
- **Permissions-First Security:** In addition to role middleware, fine-grained permission checks guard all sensitive resources with in-memory caching.
- **Protected UI Routes:** Dynamic sidebar navigation and client route guards adapt to the active user's role and privileges.

### 2. Comprehensive Asset Lifecycle Management
- **Full Tracking:** Tag, serial number, model, manufacturer, purchase cost & date, warranty expiration, physical location, and custom notes.
- **Lifecycle States:** `available`, `assigned`, `under_maintenance`, `retired`, `disposed`.
- **Assignment Engine:** Assign assets to employees and process returns with condition inspection tracking (`condition_out`, `condition_in`) wrapped in atomic database transactions.

### 3. Preventative & Corrective Maintenance Tracking
- Schedule maintenance records across types: `preventive`, `corrective`, `inspection`, `upgrade`, `other`.
- Auto-status synchronization: Scheduling maintenance automatically shifts assets into `under_maintenance`; completing records restores them to `available`.
- Cost tracking, external vendor/technician recording, and history audit.

### 4. Interactive Enterprise Dashboard
- Live metric counters: Total Assets, Available, Assigned, In Maintenance, 30-day Assignments, 7-day Audit activity.
- Visual analytics powered by **Recharts**: Categorical asset distribution bar chart and status distribution donut chart.
- Responsive, glassmorphic dark-theme UI with fluid Framer Motion transitions.

### 5. OWASP-Aligned Security & Immutable Audit Logging
- **Password Security:** Salted hashes generated via bcrypt (cost factor 12).
- **Authentication:** JWT tokens with 7-day expiration and strict payload verification.
- **Brute-Force Protection:** Dedicated auth rate limiting on `/api/auth/login` (max 20 attempts / 15m) + global API rate limiting (200 req / 15m).
- **Validation:** Strict runtime input validation via Zod on all write endpoints.
- **Security Headers:** Hardened HTTP response headers via Helmet.
- **Audit Logging:** Every user login/logout, asset alteration, status change, and role update is recorded to the immutable `audit_logs` table with IP, user agent, and JSONB change diffs.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    Client["React + TypeScript Frontend\n(Tailwind CSS v4 + Framer Motion + TanStack Query)"] -->|"REST API / Bearer JWT"| Server["Node.js + Express Backend\n(TypeScript + Zod + Helmet)"]
    Server -->|"pg Pool"| DB[("PostgreSQL / Neon\n(Normalized Schema + Migrations)")]
    Server --> Audit["Centralized Audit Service\n(JSONB Metadata + Event Stream)"]
    Audit --> DB
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, TanStack Query v5, React Router v7, Recharts, Lucide Icons, React Hot Toast.
- **Backend:** Node.js, Express.js, TypeScript, PostgreSQL (`pg`), Zod, jsonwebtoken, bcryptjs, Helmet, CORS, express-rate-limit.
- **Database:** PostgreSQL (Neon Serverless compatible, with UUID extension, custom ENUMs, and automated `updated_at` triggers).
- **DevOps:** Multi-stage Dockerfiles + Docker Compose.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm (v9+)
- PostgreSQL (Local instance or free cloud database from [Neon](https://neon.tech))
- *(Optional)* Docker and Docker Compose

---

### Option A: Local Development

#### 1. Setup Backend
```bash
cd server
cp .env.example .env
npm install
```
Edit `server/.env` to configure your database connection string and secret:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

Run database migrations to initialize tables and seed default roles, permissions, and admin user:
```bash
npm run migrate
```

Start the backend API server:
```bash
npm run dev
# Server running at http://localhost:5000
```

#### 2. Setup Frontend
In a new terminal window:
```bash
cd client
cp .env.example .env
npm install
npm run dev
# Client running at http://localhost:5173
```

---

### Option B: Docker Compose

Spin up the entire stack (PostgreSQL + Backend API + Frontend Nginx) in one command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 🔐 Default Seed Credentials

The initial database migration (`003_seed_admin_user.sql`) seeds a Super Administrator account:

- **Email:** `admin@techvault.local`
- **Password:** `Admin@1234`
- **Role:** `Super Admin` (has all 8 platform permissions)

---

## 📚 API Reference Overview

Base URL: `http://localhost:5000/api`

| Module | Method | Endpoint | Required Role / Permission | Description |
|---|---|---|---|---|
| **Auth** | POST | `/auth/register` | Public (Rate limited) | Register employee user |
| | POST | `/auth/login` | Public (Rate limited) | Authenticate & retrieve JWT |
| | POST | `/auth/logout` | Authenticated | Terminate session & log event |
| | GET | `/auth/me` | Authenticated | Current profile |
| **Assets** | GET | `/assets` | `view_assets` | Paginated asset list with filters |
| | GET | `/assets/:id` | `view_assets` | Get asset detail |
| | POST | `/assets` | `create_asset` | Create new asset |
| | PATCH | `/assets/:id` | `update_asset` | Update asset information |
| | PATCH | `/assets/:id/status`| `update_asset` | Transition asset status |
| | DELETE | `/assets/:id` | `delete_asset` | Delete asset (fails if assigned) |
| **Assignments** | GET | `/assignments` | `view_assets` | View active or all assignments |
| | GET | `/assignments/asset/:id` | `view_assets` | Asset ownership history |
| | POST | `/assignments` | `assign_asset` | Assign asset to employee |
| | PATCH | `/assignments/:id/return`| `assign_asset` | Process asset return |
| **Maintenance** | GET | `/maintenance` | `view_assets` | List maintenance records |
| | POST | `/maintenance` | `manage_maintenance` | Schedule maintenance record |
| | PATCH | `/maintenance/:id` | `manage_maintenance` | Update status / mark completed |
| | DELETE | `/maintenance/:id` | `manage_maintenance` | Delete record |
| **Users** | GET | `/users` | `manage_users` | List all users |
| | POST | `/users` | `manage_users` (Super Admin) | Create user account |
| | PATCH | `/users/:id` | `manage_users` (Super Admin) | Update user profile/role |
| | DELETE | `/users/:id` | `manage_users` (Super Admin) | Deactivate user account |
| **Dashboard** | GET | `/dashboard/stats` | `view_reports` | Aggregate KPI metrics & charts |
| **Audit Logs** | GET | `/audit-logs` | `view_reports` | Paginated system audit trails |

---

## 🧪 Verification & Build Status

- **Backend TypeScript Check:** `tsc --noEmit` passed with 0 errors.
- **Frontend TypeScript Check:** `tsc -b` passed with 0 errors.
- **Frontend Production Build:** `vite build` completed successfully, producing optimized, gzipped distribution bundles.
