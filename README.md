# TechVault — IT Asset Management System

A production-quality full-stack IT Asset Management System built with:
- **Frontend**: React + TypeScript + Tailwind CSS + React Router + React Query
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL (Neon compatible)

## Project Structure

```
TechVault-IT-Asset-Management-System/
├── client/          # React + TypeScript frontend
├── server/          # Node.js + Express backend
└── public/          # Project spec / documentation
```

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Neon account)

### 1. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 3. Database
Run the migration script after setting up your DB connection:
```bash
cd server
npm run migrate
```

## Roles & Permissions

| Role | Permissions |
|------|------------|
| Super Admin | All permissions |
| IT Administrator | Create/Update/Delete/Assign assets, View reports |
| Employee | View assigned assets |

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /assets | List all assets |
| POST | /assets | Create asset |
| GET | /dashboard/stats | Dashboard statistics |
| GET | /audit-logs | Audit log entries |

