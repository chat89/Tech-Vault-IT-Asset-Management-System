# TechVault — Enterprise IT Asset & Lifecycle Management System
## Comprehensive Master Technical Documentation & Project Summary

> **Document Version:** 2.0.0  
> **Classification:** Technical Architecture & System Specification  
> **Status:** Production-Ready / Capstone Complete  
> **Maintainer:** TechVault Engineering Team  

---

## 1. Executive Summary & System Overview

**TechVault** is an enterprise-grade, full-stack IT Asset Management (ITAM) and Hardware Lifecycle platform designed to replace fragmented spreadsheets and legacy inventory tools. Built according to modern Enterprise Resource Planning (ERP) and Information Technology Infrastructure Library (ITIL) standards, TechVault delivers centralized tracking of physical IT hardware from procurement and configuration through active custody, telemetry health monitoring, preventative maintenance, financial depreciation, and secure end-of-life disposal.

### Core Value Propositions
* **End-to-End Asset Custody & Accountability:** Comprehensive serial number tracking, hardware tagging, deterministic QR code labels, and atomic assignment/return protocols with physical condition grading (`good`, `fair`, `damaged`).
* **ERP-Grade Segregation of Duties (SoD):** Enforces strict "Four-Eyes" principles across employee requisitions, prohibiting administrators from approving their own hardware requests and logging violation attempts as high-severity security events.
* **Financial Lifecycle & Real-Time Depreciation:** Dynamic real-time calculation of Current Book Value, Cumulative Depreciation, and Capital Expenditure (CapEx) across Straight-Line and Double-Declining balance models with salvage value floors.
* **Simulated MDM Telemetry & Automated Self-Healing:** Autonomous background daemon simulating Mobile Device Management (MDM) telemetry (battery cycles, disk health, CPU temperature) with automated triage pipelines that schedule maintenance tickets when device health drops below 40%.
* **Predictive Procurement Forecasting:** Consumption velocity analytics tracking daily and monthly burn rates against unassigned inventory, projecting stockout runway in days, and generating 1-click batch restock proposals.
* **Zero-Trust Security & Immutable Audit Trail:** OWASP-hardened architecture with salted bcrypt password hashing, JWT authentication, brute-force rate limiters, Helmet headers, timing-safe HMAC-SHA256 webhook validation with anti-replay guards, and a tamper-resistant audit ledger.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph ClientLayer["Frontend Application (React 19 + Vite)"]
        UI["Modern Glassmorphic Dark UI\n(Tailwind CSS v4 + Framer Motion)"]
        Landing["11-Section Enterprise Showcase (/)"]
        AuthContext["Auth Context & Token Manager"]
        QueryClient["TanStack Query v5 Data Layer"]
        Router["React Router v7 Protected Routes"]
    end

    subgraph Gateway["Reverse Proxy / Ingress"]
        Nginx["Nginx Alpine Container (Port 80)"]
    end

    subgraph ServerLayer["Backend API Server (Node.js + Express + TypeScript)"]
        AuthMid["Auth & RBAC Middleware\n(JWT + In-Memory Permission Cache)"]
        RateLimit["Rate Limiter (Brute-Force & Global)"]
        SecMid["Security Headers (Helmet) + CORS"]
        WebhookGuard["Webhook Auth\n(HMAC-SHA256 + Replay Nonces)"]
        
        subgraph Controllers["API Controllers"]
            AssetsCtrl["Asset Controller"]
            ReqCtrl["Requisition & SoD Controller"]
            FinCtrl["Financial Controller"]
            MaintCtrl["Maintenance Controller"]
            TeleCtrl["Telemetry Controller"]
            ForeCtrl["Analytics & Forecast Controller"]
            AuditCtrl["Audit Controller"]
        end
        
        AuditSvc["Centralized Audit Logging Service"]
        TeleSim["MDM Telemetry Simulation Worker (3-min interval)"]
    end

    subgraph DataLayer["Database Storage (PostgreSQL 16)"]
        PG["PostgreSQL Database / Neon Compatible"]
        Tables["Tables: users, roles, assets, assignments,\nmaintenance_records, asset_requests, asset_telemetry, audit_logs"]
        Views["Computed Views: asset_financials"]
        Triggers["PL/pgSQL Triggers (auto-updating updated_at)"]
    end

    UI --> Router
    Router --> QueryClient
    QueryClient -->|"HTTP / REST API"| Nginx
    Nginx -->|"Proxy /api -> Port 5000"| ServerLayer
    
    ServerLayer --> SecMid
    SecMid --> RateLimit
    RateLimit --> AuthMid
    AuthMid --> Controllers
    WebhookGuard --> TeleCtrl
    
    Controllers --> AuditSvc
    Controllers --> PG
    AuditSvc --> PG
    TeleSim --> PG
    PG --> Tables
    PG --> Views
    PG --> Triggers
```

---

## 3. Technology Stack & Directory Structure

### 3.1 Technology Matrix

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `^19.0.0` | Declarative, component-based user interface |
| **Frontend Language** | TypeScript | `~5.7.2` | End-to-end static typing and interface contracts |
| **Styling & Design** | Tailwind CSS | `^4.0.0` | Modern, utility-first dark enterprise styling |
| **Animations** | Framer Motion | `^12.0.0` | Smooth UI page transitions and interactive micro-interactions |
| **Data Fetching** | TanStack Query | `^5.66.0` | Server-state caching, optimistic updates, and background refetching |
| **Routing** | React Router DOM | `^7.1.5` | Client-side routing, code-splitting, and RBAC route guards |
| **Data Visualization** | Recharts | `^2.15.1` | Responsive bar charts, donut charts, and trend metrics |
| **Icons & Feedback** | Lucide React / React Hot Toast | Latest | Accessible modern SVG iconography and toast notifications |
| **Backend Runtime** | Node.js | `>=20.x` | High-performance asynchronous JavaScript runtime |
| **API Framework** | Express.js | `^4.21.2` | Minimalist and resilient RESTful routing framework |
| **Backend Language** | TypeScript | `^5.7.3` | Strongly-typed backend architecture and clean separation of concerns |
| **Validation** | Zod | `^3.24.2` | Strict runtime schema parsing and payload validation |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.2` | Stateless cryptographic bearer authorization |
| **Cryptography** | `bcryptjs` | `^3.0.2` | Adaptive salted password hashing (cost factor 12) |
| **Security Headers** | Helmet | `^8.0.0` | Secure HTTP headers (CSP, HSTS, XSS filter, clickjacking protection) |
| **Rate Limiting** | `express-rate-limit` | `^7.5.0` | Defense-in-depth against credential stuffing and DoS attacks |
| **Database Engine** | PostgreSQL | `16-alpine` | Relational ACID-compliant transactional persistence |
| **Database Client** | `pg` (node-postgres) | `^8.13.1` | Native connection pooling and parameterized SQL queries |
| **DevOps / Containers** | Docker & Docker Compose | Compose V2 | Multi-stage production containerization and isolated orchestration |

---

### 3.2 Monorepo File & Directory Map

```text
TechVault-IT-Asset-Management-System/
├── docker-compose.yml              # Multi-container orchestration (Postgres, Server, Client)
├── README.md                       # High-level overview & quickstart instructions
├── PROGRESS.md                     # Development milestone and verification matrix
├── PROJECT_DOCUMENTATION.md        # This exhaustive master technical document
├── capstone_expansion_architecture_prompt.md  # Core 4-pillar capstone expansion blueprint
├── TechVault_Additional_Enhancements.md       # Hardening blueprint (P0 security, P1 workflows)
│
├── client/                         # Vite + React 19 Frontend Application
│   ├── Dockerfile                  # Multi-stage build -> Nginx Alpine production image
│   ├── nginx.conf                  # Nginx proxy pass (/api -> server:5000) & SPA fallback
│   ├── package.json                # Frontend scripts and client dependencies
│   ├── vite.config.ts              # Vite bundle configuration and proxy rules
│   └── src/
│       ├── api/                    # Typed API client services
│       │   ├── client.ts           # Axios/Fetch base instance with auth interceptors
│       │   ├── analytics.api.ts    # Procurement forecasting endpoints
│       │   ├── assets.api.ts       # Asset CRUD and query endpoints
│       │   ├── assignments.api.ts  # Hardware assignment and return endpoints
│       │   ├── audit.api.ts        # Immutable audit log queries
│       │   ├── auth.api.ts         # Login, logout, session restoration
│       │   ├── categories.api.ts   # Hardware category management
│       │   ├── dashboard.api.ts    # KPI metric counters & charts
│       │   ├── financial.api.ts    # Financial lifecycle & book value metrics
│       │   ├── maintenance.api.ts  # Repair and maintenance scheduling
│       │   ├── requests.api.ts     # Employee requisitions & approval workflow
│       │   ├── telemetry.api.ts    # Device diagnostic telemetry queries
│       │   └── users.api.ts        # User directory and role assignments
│       ├── components/
│       │   ├── dashboard/          # Procurement forecast tab & analytics widgets
│       │   ├── layout/             # Topbar, dynamic role-based Sidebar, App Shell
│       │   └── ui/                 # Reusable atomic UI (Modals, Badges, Tables, QR, Financials)
│       ├── context/                # Global React AuthContext and authentication state
│       ├── pages/                  # Top-level view routes
│       │   ├── landing/            # 11-section enterprise public landing page
│       │   ├── dashboard/          # Executive KPI overview & forecast analytics
│       │   ├── assets/             # Master hardware register & QR tag generation
│       │   ├── assignments/        # Active & historical asset custody tracking
│       │   ├── requests/           # Employee requisition & SoD approval queue
│       │   ├── maintenance/        # Preventative & corrective maintenance hub
│       │   ├── users/              # RBAC user directory & role management
│       │   ├── audit/              # Immutable audit log stream & security alerts
│       │   └── auth/               # Enterprise login portal with quick-login pills
│       ├── router/                 # React Router definitions & ProtectedRoute guards
│       ├── types/                  # TypeScript interface contracts for client domain
│       └── utils/                  # CSV export engine, date formatters, math utilities
│
└── server/                         # Node.js + Express + TypeScript Backend API
    ├── Dockerfile                  # Multi-stage production container build
    ├── package.json                # Server scripts, dependencies, and test runner
    ├── tsconfig.json               # Strict TypeScript compilation parameters
    └── src/
        ├── index.ts                # Server bootstrap, middleware pipeline, background workers
        ├── controllers/            # HTTP request parsing and response handling
        ├── services/               # Core business logic, SQL execution, transactions
        ├── middleware/             # Auth, RBAC, Zod validation, HMAC webhook auth, error handler
        ├── routes/                 # Express router path mappings
        ├── validators/             # Zod validation schemas for all write actions
        ├── types/                  # Database entity interfaces and JWT payload types
        ├── tests/                  # Automated test suite (Native node:test runner)
        │   ├── depreciation.test.ts # Financial engine & depreciation formula tests
        │   ├── forecasting.test.ts  # Consumption burn rate & runway tests
        │   └── security.test.ts     # HMAC validation, SoD enforcement & IDOR guards
        └── db/
            ├── pool.ts             # PostgreSQL connection pool with connection monitoring
            ├── migrate.ts          # Automated idempotent SQL migration runner
            └── migrations/         # Version-controlled sequential SQL migrations
                ├── 001_initial_schema.sql
                ├── 002_seed_roles_permissions.sql
                ├── 003_seed_admin_user.sql
                ├── 004_asset_requests_workflow.sql
                ├── 005_rich_enterprise_seed_data.sql
                ├── 006_financial_lifecycle.sql
                └── 007_asset_telemetry.sql
```

---

## 4. Relational Database Architecture

The database layer runs on PostgreSQL 16. It is strictly normalized, enforces foreign-key referential integrity, uses native `UUID` primary keys, defines custom `ENUM` types for domain states, and employs automated `BEFORE UPDATE` triggers for audit timestamping.

### 4.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    roles ||--o{ role_permissions : has
    permissions ||--o{ role_permissions : assigned_to
    roles ||--o{ users : assigns
    
    users ||--o{ assets : creates
    categories ||--o{ assets : categorizes
    
    assets ||--o{ assignments : assigned_in
    users ||--o{ assignments : assigned_to
    users ||--o{ assignments : assigned_by
    
    assets ||--o{ maintenance_records : serviced_in
    users ||--o{ maintenance_records : created_by
    
    users ||--o{ asset_requests : requested_by
    users ||--o{ asset_requests : reviewed_by
    categories ||--o{ asset_requests : requests_category
    assets ||--o{ asset_requests : allocated_asset
    
    assets ||--o{ asset_telemetry : reports_health
    users ||--o{ audit_logs : triggered_by

    roles {
        uuid id PK
        varchar name UK
        varchar label
        timestamptz created_at
    }

    permissions {
        uuid id PK
        varchar name UK
        text description
        timestamptz created_at
    }

    users {
        uuid id PK
        varchar full_name
        varchar email UK
        text password_hash
        uuid role_id FK
        boolean is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    categories {
        uuid id PK
        varchar name UK
        text description
        timestamptz created_at
    }

    assets {
        uuid id PK
        varchar asset_tag UK
        varchar name
        uuid category_id FK
        varchar serial_number
        varchar model
        varchar manufacturer
        date purchase_date
        numeric purchase_cost
        date warranty_expiry
        asset_status status
        varchar location
        numeric salvage_value
        integer useful_life_years
        depreciation_model depreciation_mdl
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    assignments {
        uuid id PK
        uuid asset_id FK
        uuid assigned_to FK
        uuid assigned_by FK
        timestamptz assigned_at
        timestamptz returned_at
        varchar condition_out
        varchar condition_in
        text notes
        text return_notes
    }

    maintenance_records {
        uuid id PK
        uuid asset_id FK
        maintenance_type maintenance_type
        maintenance_status status
        text description
        date scheduled_date
        date completed_date
        numeric cost
        varchar performed_by
        uuid created_by FK
        timestamptz created_at
    }

    asset_requests {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        uuid asset_id FK
        varchar asset_type
        request_priority priority
        request_status status
        text reason
        text admin_notes
        uuid reviewed_by FK
        timestamptz reviewed_at
        timestamptz created_at
    }

    asset_telemetry {
        uuid id PK
        uuid asset_id FK
        integer health_score
        integer battery_level
        varchar disk_status
        integer cpu_temp_c
        timestamptz last_ping
        timestamptz created_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        audit_action action
        varchar entity_type
        uuid entity_id
        jsonb metadata
        inet ip_address
        text user_agent
        timestamptz created_at
    }
```

---

### 4.2 Database Migrations Registry

Migrations are versioned SQL scripts located in `server/src/db/migrations/` and executed sequentially by `server/src/db/migrate.ts`. The migration runner uses an internal `migrations` tracking table to ensure strict idempotency.

| # | Migration File | Key Responsibilities |
|---|---|---|
| **001** | `001_initial_schema.sql` | Enables `uuid-ossp`; creates tables `roles`, `permissions`, `role_permissions`, `users`, `categories`, `assets`, `assignments`, `maintenance_records`, and `audit_logs`; creates custom enums (`asset_status`, `maintenance_type`, `maintenance_status`, `audit_action`); creates indexes and automated `updated_at` PL/pgSQL triggers. |
| **002** | `002_seed_roles_permissions.sql` | Seeds the 3 primary corporate roles (`super_admin`, `it_admin`, `employee`); registers 8 granular security permissions; populates the `role_permissions` RBAC junction table. |
| **003** | `003_seed_admin_user.sql` | Seeds the default Super Administrator account (`admin@techvault.local` / `Admin@1234`) with an Alpine-compatible salted bcrypt hash; creates default hardware categories (Laptops, Desktops, Servers, Mobile Devices, Networking, Peripherals). |
| **004** | `004_asset_requests_workflow.sql` | Introduces the Employee Requisition engine; creates `asset_requests` table, `request_status` and `request_priority` enums; registers permissions `create_request` and `manage_requests`. |
| **005** | `005_rich_enterprise_seed_data.sql` | Populates a realistic corporate fleet: 11 active users across Engineering, Product, IT, and HR; 25 enterprise hardware assets across all lifecycle states; 9 historical/active assignments; 4 maintenance tickets; initial requisition queue. |
| **006** | `006_financial_lifecycle.sql` | Establishes the Financial Lifecycle Engine; adds `salvage_value`, `useful_life_years`, and `depreciation_mdl` (`STRAIGHT_LINE`, `DOUBLE_DECLINING`) to `assets`; creates dynamic SQL computed view `asset_financials` for live book value calculation. |
| **007** | `007_asset_telemetry.sql` | Creates `asset_telemetry` table for device health metrics (`health_score`, `battery_level`, `disk_status`, `cpu_temp_c`, `last_ping`); creates indexing on `asset_id` and `last_ping`; seeds initial diagnostic telemetry across all hardware. |

---

## 5. Security Architecture, Authentication & RBAC

TechVault is architected in accordance with the OWASP Top 10 recommendations and zero-trust principles.

### 5.1 Authentication Pipeline
1. **Password Hashing:** Passwords are never stored in plaintext. They are hashed using `bcryptjs` with a work factor of 12 and unique cryptographic salts.
2. **Stateless JWT Tokens:** Successful authentication generates a signed JSON Web Token containing the user's UUID, email, and role name. Tokens expire automatically after 7 days (`JWT_EXPIRES_IN=7d`).
3. **Bearer Token Transmission:** The client stores the token in memory/local storage and transmits it via the standard `Authorization: Bearer <token>` HTTP header.
4. **Session Verification:** `server/src/middleware/auth.middleware.ts` decodes and cryptographically verifies the token on every protected API call, attaching the user payload to Express's `req.user`.

---

### 5.2 Role-Based Access Control (RBAC) Matrix

Permissions are evaluated dynamically through an in-memory cached lookup mechanism in `server/src/middleware/permissions.middleware.ts`.

| Permission Name | Description | Super Admin | IT Admin | Employee |
|---|---|:---:|:---:|:---:|
| `manage_users` | Create, modify, de-activate user accounts |  Yes |  No |  No |
| `change_role` | Promote/demote user security roles |  Yes |  No |  No |
| `create_asset` | Register new hardware assets |  Yes |  Yes |  No |
| `update_asset` | Edit specifications, status, serial numbers |  Yes |  Yes |  No |
| `delete_asset` | Permanently remove or decommission assets |  Yes |  Yes |  No |
| `assign_asset` | Allocate assets & process employee returns |  Yes |  Yes |  No |
| `manage_maintenance` | Schedule and complete repair tickets |  Yes |  Yes |  No |
| `manage_requests` | Review, approve, reject employee requisitions |  Yes |  Yes |  No |
| `view_assets` | Browse inventory, search specifications |  Yes |  Yes |  Yes |
| `create_request` | Submit asset requests for equipment |  Yes |  Yes |  Yes |
| `view_reports` | Access executive KPI dashboard & analytics |  Yes |  Yes |  No |

---

### 5.3 Defense-in-Depth & Hardening Measures

* **Brute-Force Protection:** Dedicated auth rate limiting (`server/src/routes/auth.routes.ts`) restricts login attempts to a maximum of 20 per 15 minutes per IP address. A global rate limiter caps general API traffic to 200 requests per 15 minutes.
* **IDOR (Insecure Direct Object Reference) Protection:**
  * Employees can only view assignment records belonging to their own user ID (`/api/assignments/user/:userId`). Accessing other users' assignments is blocked with `403 Forbidden`.
  * Comprehensive asset ownership history (`/api/assignments/asset/:assetId`) is restricted exclusively to `super_admin` and `it_admin`.
  * Financial book values and procurement analytics are blocked for non-admin roles.
* **Webhook HMAC-SHA256 Authentication:**
  * External MDM telemetry ingestion (`POST /api/telemetry/webhook`) requires a cryptographic signature passed in the `x-telemetry-signature` header.
  * Signatures are computed as `HMAC-SHA256(payload, TELEMETRY_WEBHOOK_SECRET)` and verified using `crypto.timingSafeEqual()` to eliminate timing attack vectors.
  * **Replay Protection:** Telemetry submissions must include `x-telemetry-timestamp`. Requests older than 5 minutes (&gt; 300,000 ms drift) are rejected.
  * **Nonce Tracking:** An in-memory cache records `x-telemetry-event-id` to discard replayed transmissions.
  * **Security Alert Logging:** Tampered or unauthorized webhook calls automatically log a `SECURITY_ALERT` entry into `audit_logs`.
* **Runtime Zod Validation:** All incoming mutation payloads are parsed through strict Zod schemas. Extraneous fields are stripped, string bounds are enforced, and invalid types return structured HTTP 400 validation errors before reaching controllers.
* **HTTP Security Headers:** Helmet enforces `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and removes `X-Powered-By`.

---

## 6. Core Functional Modules

### 6.1 Hardware Asset Lifecycle Management
TechVault models physical assets through a finite state machine:
```text
[ Available ] ──(Assign to Employee)──> [ Assigned ]
      │                                       │
(Schedule Maint / Auto-Flag)           (Return Asset)
      │                                       │
      ▼                                       ▼
[ Under Maintenance ] ──(Complete Repair)─> [ Available ]
      │
(Decommission)
      ▼
[ Retired ] ──(Final Write-Off)──> [ Disposed ]
```

* **Attributes Tracked:** Unique Asset Tag (e.g., `MBP-1001`), Serial Number, Make/Model, Category, Location, Purchase Date, Purchase Cost, Warranty Expiration Date, Physical Condition, and Lifecycle Status.
* **Vector QR Code Tagging:** The asset registry generates scannable, deterministic SVG QR codes (`AssetQrModal.tsx`). Scanning the label resolves to the authenticated verification URL. Users can print standard Avery-style physical asset labels directly from the UI.
* **Asset Custody & Condition Tracking:** When hardware is assigned, an assignment record is opened. When returned, the system captures `condition_in`, return notes, and updates the asset back to `available` within an atomic database transaction.

---

### 6.2 Employee Asset Requisitions & Workflow
1. **Request Submission:** Employees select a category or specific hardware item, define business priority (`low`, `medium`, `high`, `urgent`), and supply justification.
2. **Review Queue:** Pending requests appear in the administrator's Requisition Review Queue.
3. **Approval / Rejection:** Authorized administrators review the request and either approve it (queuing it for equipment provisioning) or reject it with administrative rationale notes.
4. **Fulfillment:** Once hardware is prepared, the administrator fulfills the request, which automatically creates an active assignment and marks the asset as `assigned`.

---

### 6.3 Preventative & Corrective Maintenance Hub
* **Service Scheduling:** Records maintenance type (`preventive`, `corrective`, `inspection`, `upgrade`), scheduled servicing dates, estimated costs, and internal technician or external vendor names.
* **Status Synchronization:** Creating a scheduled maintenance record automatically flips the asset's state to `under_maintenance`, preventing accidental assignment to employees. Completing the record restores the asset's state to `available`.
* **Cost Accounting:** Tracks cumulative historical repair costs per asset, assisting in repair-vs-replace financial decisions.

---

### 6.4 Immutable Audit Logging Engine
All state-modifying actions across TechVault pass through `server/src/services/audit.service.ts`:
* Captures Actor ID, Action Type, Target Entity Type, Target Entity ID, Client IP Address, User Agent, and a structured JSONB snapshot of changes (`metadata`).
* Standard audit actions include: `login`, `logout`, `create_asset`, `update_asset`, `delete_asset`, `assign_asset`, `return_asset`, `create_user`, `update_user`, `delete_user`, `create_maintenance`, `update_maintenance`, `change_role`.
* High-severity security events (`SECURITY_ALERT`) are automatically recorded when Segregation of Duties violations or webhook HMAC authentication failures occur.

---

## 7. The 4 Advanced Enterprise Capstone Pillars

### 7.1 Pillar 1: Financial Lifecycle & Dynamic Depreciation Engine

TechVault incorporates enterprise asset accounting principles to track Capital Expenditures (CapEx), cumulative depreciation, and net book values over time.

#### Mathematical Models Supported

1. **Straight-Line Depreciation:**
   $$\text{Annual Depreciation} = \frac{\text{Purchase Cost} - \text{Salvage Value}}{\text{Useful Life (Years)}}$$
   $$\text{Current Book Value} = \max\left(\text{Salvage Value}, \; \text{Purchase Cost} - (\text{Annual Depreciation} \times \text{Age in Years})\right)$$

2. **Double-Declining Balance (DDB):**
   $$\text{Depreciation Rate} = \frac{2}{\text{Useful Life (Years)}}$$
   $$\text{Current Book Value} = \max\left(\text{Salvage Value}, \; \text{Purchase Cost} \times (1 - \text{Rate})^{\text{Age in Years}}\right)$$

#### Database View & Service Implementation
* Calculated in real-time via the `asset_financials` computed SQL view, ensuring database-level consistency without stale cache anomalies.
* If an asset reaches `retired` or `disposed` status, depreciation stops, locking the book value at its final salvage floor.
* Exposed via `GET /api/financial/overview` and visualized on the dashboard with a financial overview card showing Total Fleet CapEx, Current Book Value, Cumulative Depreciation, and Value Retention Ratio.

---

### 7.2 Pillar 2: ERP-Grade Segregation of Duties (SoD)

To satisfy Sarbanes-Oxley (SOX) and SOC 2 internal control standards, TechVault strictly enforces Segregation of Duties within the requisition approval lifecycle.

#### Backend Enforcement
* In `server/src/services/request.service.ts`:
  ```typescript
  if (request.user_id === reviewerId) {
    await logEvent({
      userId: reviewerId,
      action: 'update_asset' as any,
      entityType: 'SECURITY_ALERT',
      entityId: requestId,
      metadata: {
        violation: 'SOD_VIOLATION',
        reason: 'Administrator attempted to self-approve/reject their own requisition',
        target_request_id: requestId,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    const err: any = new Error('Segregation of Duties Violation: You cannot approve or reject your own requisition.');
    err.status = 403;
    throw err;
  }
  ```

#### Frontend Governance Experience
* On `RequestsPage.tsx`, the interface detects if the active administrator authored the request.
* Review buttons (`Approve`, `Reject`) are disabled.
* An amber warning badge (`SoD Policy Restricted`) is rendered alongside an interactive explanatory tooltip stating that another administrator must review the requisition.

---

### 7.3 Pillar 3: Simulated MDM Telemetry & Autonomous Maintenance

TechVault features a simulated Mobile Device Management (MDM) telemetry pipeline representing hardware telemetry streams (such as Apple Jamf, Microsoft Intune, or Dell Command Monitor).

#### System Specifications
* **Database Table:** `asset_telemetry` stores `health_score` (0–100), `battery_level` (0–100%), `disk_status` (`healthy`, `warning`, `critical`), `cpu_temp_c`, and `last_ping`.
* **Background Simulation Worker:** `startTelemetrySimulator()` executes every 3 minutes in the background, updating device diagnostics across active laptops, servers, and workstations.
* **Auto-Triage Self-Healing Pipeline:**
  * When incoming telemetry reports a device `health_score < 40`, the engine initiates automatic triage:
  * Transitions asset status to `under_maintenance`.
  * Generates an automated ticket in `maintenance_records` with description `[System Auto-Flagged] Critical hardware degradation detected via telemetry`.
  * Generates an audit log entry documenting the automated intervention.
* **Pulsing Health Indicators:** The asset inventory table renders real-time color-coded health badges (Green: &ge; 70%, Yellow: 40–69%, Red / Pulsing: &lt; 40%) complete with battery percentages and disk health indicators.

---

### 7.4 Pillar 4: Smart Procurement Forecasting & Stockout Runway

TechVault's predictive analytics engine prevents operational supply chain bottlenecks by analyzing historical equipment burn rates and requisition demand.

#### Algorithmic Logic
* **Consumption Velocity (Burn Rate):** Calculates the average monthly rate of equipment assignments over the preceding 90-day window:
  $$\text{Monthly Burn Rate} = \frac{\text{Total Assignments in Window}}{\text{Window Days}} \times 30$$
* **Net Available Inventory:**
  $$\text{Effective Stock} = \text{Unassigned Available Assets} - \text{Pending Approved Requisitions}$$
* **Stockout Runway (Days):**
  $$\text{Runway Days} = \begin{cases} 0 & \text{if Effective Stock } \le 0 \\ \frac{\text{Effective Stock}}{\text{Daily Burn Rate}} & \text{if Daily Burn Rate } > 0 \\ 999 & \text{if Daily Burn Rate } = 0 \end{cases}$$
* **Risk Tiering:**
  * **CRITICAL:** Runway &le; 14 days (Imminent stockout risk).
  * **WARNING:** Runway between 15 and 45 days (Procurement recommended).
  * **HEALTHY:** Runway &gt; 45 days (Sufficient operational buffer).
* **Suggested Reorder Quantity:** Automatically computes units required to restore a healthy 90-day supply buffer:
  $$\text{Suggested Reorder} = \max\left(0, \; (\text{Daily Burn Rate} \times 90) - \text{Effective Stock}\right)$$
* **1-Click Batch Restock Workflow:** Administrators can open the Procurement Forecast dashboard, review projected stockout dates, and trigger a 1-click batch restock modal that pre-populates purchase requisitions.

---

## 8. Frontend Interface & View Hierarchy

The frontend is a dark-theme, responsive SPA organized into modular pages with smooth Framer Motion transitions:

1. **Enterprise Landing Page (`/`):**
   * 11 comprehensive sections: Navigation Bar, Hero Section with Live Metrics, Feature Showcase, Architecture Highlights, Security & Compliance, Interactive ROI Calculator, Workflow Walkthrough, Customer Testimonials, FAQ Accordion, Enterprise CTA, and Corporate Footer.
   * Direct "Quick Login" shortcut pills for immediate role testing.
2. **Executive Operations Dashboard (`/dashboard`):**
   * Real-time metric counters (Total Assets, Available, Assigned, Under Maintenance, 30-Day Deployments, 7-Day Audit Actions).
   * Visual analytics powered by Recharts (Category breakdown and Status distribution).
   * CapEx vs. Net Book Value Financial Overview Widget.
   * Procurement Forecast Analytics Tab (`/dashboard?tab=forecasting`).
3. **Master Hardware Registry (`/assets`):**
   * Filterable, searchable data table with category, status, and health score filters.
   * Interactive modal for asset creation and editing.
   * Printable Vector QR Code tag generation modal.
   * Browser-safe CSV asset register export button.
4. **Hardware Assignments & Custody Hub (`/assignments`):**
   * Active custody tracking displaying employee names, department, assignment date, and physical condition.
   * One-click "Assign Asset" modal with dynamic employee selection.
   * "Process Return" modal capturing return conditions and notes.
5. **Requisitions Queue (`/requests`):**
   * Employee equipment submission portal.
   * Administrator review queue with SoD self-approval prevention and warning badges.
   * Direct asset allocation and fulfillment actions.
6. **Maintenance Operations Hub (`/maintenance`):**
   * Active and completed repair ticket tracking.
   * Auto-flagged telemetry ticket highlighting.
   * One-click service completion modal with cost recording.
7. **User Administration & Directory (`/users`):**
   * Complete directory of corporate employees and administrators.
   * Departmental tags, role labels, and account activation controls.
8. **Immutable Audit Ledger (`/audit`):**
   * Chronological event feed with search and action filtering.
   * Formatted JSONB metadata inspection and security alert flags.

---

## 9. Exhaustive REST API Specification

All protected endpoints require the HTTP header `Authorization: Bearer <jwt_token>`.

### 9.1 Authentication & Profile
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticates credentials; returns user object & JWT |
| `POST` | `/api/auth/logout` | Authenticated | Logs logout event to audit log and clears session |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user and permissions |

### 9.2 User Directory & Access Management
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/users` | `super_admin`, `it_admin` | Lists all registered corporate users |
| `GET` | `/api/users/roles` | `super_admin`, `it_admin` | Lists available roles |
| `GET` | `/api/users/:id` | `super_admin`, `it_admin` | Returns details for a single user |
| `POST` | `/api/users` | `super_admin` (`manage_users`) | Creates a new user account |
| `PATCH` | `/api/users/:id` | `super_admin` (`manage_users`) | Updates user details, email, or role |
| `DELETE` | `/api/users/:id` | `super_admin` (`manage_users`) | De-activates a user account |

### 9.3 Asset Register & Inventory
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/assets` | Authenticated | Lists all assets with search, category, and status filters |
| `GET` | `/api/assets/:id` | Authenticated | Returns single asset record by UUID |
| `POST` | `/api/assets` | Admin (`create_asset`) | Registers a new asset with financial parameters |
| `PATCH` | `/api/assets/:id` | Admin (`update_asset`) | Updates asset attributes or specifications |
| `DELETE` | `/api/assets/:id` | Admin (`delete_asset`) | Deletes an asset (only if not assigned) |

### 9.4 Hardware Assignments & Custody
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/assignments` | Admin / Authorized | Lists active and historical hardware assignments |
| `GET` | `/api/assignments/user/:userId` | Self or Admin (IDOR Guard) | Returns assignments for a specific employee |
| `GET` | `/api/assignments/asset/:assetId` | Admin (`super_admin`, `it_admin`) | Returns complete ownership history for an asset |
| `POST` | `/api/assignments` | Admin (`assign_asset`) | Assigns an available asset to an employee |
| `POST` | `/api/assignments/:id/return` | Admin (`assign_asset`) | Processes asset return with condition inspection |

### 9.5 Equipment Requisitions & SoD
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/requests` | Authenticated | Lists requisitions (scoped to user for employees) |
| `POST` | `/api/requests` | Authenticated (`create_request`)| Submits a new hardware requisition |
| `PATCH` | `/api/requests/:id/review` | Admin (`manage_requests` + SoD)| Approves or rejects request (Enforces SoD rules) |
| `POST` | `/api/requests/:id/fulfill`| Admin (`manage_requests`) | Fulfills request by assigning physical hardware |

### 9.6 Maintenance & Repairs
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Admin (`view_reports` / Admin) | Lists maintenance tickets across the fleet |
| `POST` | `/api/maintenance` | Admin (`manage_maintenance`) | Schedules a new maintenance ticket |
| `PATCH` | `/api/maintenance/:id`| Admin (`manage_maintenance`) | Updates maintenance ticket status or details |
| `POST` | `/api/maintenance/:id/complete`| Admin (`manage_maintenance`)| Completes repair and restores asset to `available` |

### 9.7 Financial Lifecycle & Depreciation
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/financial/overview`| Admin (`super_admin`, `it_admin`)| Returns fleet CapEx, book value, and retention ratio |
| `GET` | `/api/financial/assets`  | Admin (`super_admin`, `it_admin`)| Returns per-asset financial depreciation metrics |

### 9.8 MDM Telemetry & Ingestion
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/telemetry` | Authenticated | Returns latest telemetry records for hardware |
| `GET` | `/api/telemetry/asset/:assetId` | Authenticated | Returns diagnostic history for a specific device |
| `POST` | `/api/telemetry/webhook` | Webhook HMAC Signature | Ingests external device telemetry; triggers auto-triage |

### 9.9 Procurement Forecasting & Analytics
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/analytics/forecasting`| Admin (`super_admin`, `it_admin`)| Returns category burn rates, runways, and reorders |

### 9.10 Audit Ledger
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/audit` | Admin (`super_admin`, `it_admin`)| Returns chronological audit events with filtering |

---

## 10. Seeded Enterprise Fleet & Test Credentials

The database migration `005_rich_enterprise_seed_data.sql` pre-populates an enterprise fleet for immediate testing.

### 10.1 Default Accounts

| Full Name | Role | Email | Password | Department |
|---|---|---|---|---|
| **Sarah Jenkins** | Super Administrator | `admin@techvault.local` | `Admin@1234` | Executive / IT |
| **Marcus Vance** | IT Administrator | `marcus.vance@techvault.local` | `Admin@1234` | IT Operations |
| **Elena Rostova** | IT Administrator | `elena.rostova@techvault.local` | `Admin@1234` | Infrastructure & Security |
| **Sophia Chen** | Employee | `sophia.chen@techvault.local` | `Employee@1234` | Software Engineering |
| **Alex Rivera** | Employee | `alex.rivera@techvault.local` | `Employee@1234` | Software Engineering |
| **Fatima Zahra** | Employee | `fatima.zahra@techvault.local` | `Employee@1234` | Product Design |
| **Liam O'Connor** | Employee | `liam.oconnor@techvault.local` | `Employee@1234` | Product Management |
| **Maya Patel** | Employee | `maya.patel@techvault.local` | `Employee@1234` | DevOps / Cloud Infrastructure |
| **David Kim** | Employee | `david.kim@techvault.local` | `Employee@1234` | Data Science & AI |
| **Chloe Dupont** | Employee | `chloe.dupont@techvault.local` | `Employee@1234` | People & Talent (HR) |
| **James Wilson** | Employee | `james.wilson@techvault.local` | `Employee@1234` | Sales & Customer Success |

---

### 10.2 Hardware Fleet Summary (25 Seed Assets)

| Category | Example Asset Tag | Model / Hardware | Status | Initial Telemetry |
|---|---|---|---|---|
| **Laptops** | `MBP-1001` | Apple MacBook Pro 16" M3 Max | `assigned` | 92% Health, 88% Battery |
| **Laptops** | `MBP-1004` | Apple MacBook Pro 14" M3 Pro | `available` | 89% Health, 95% Battery |
| **Laptops** | `TPD-1001` | Lenovo ThinkPad X1 Carbon Gen 11 | `assigned` | 74% Health, 68% Battery |
| **Laptops** | `TPD-1003` | Lenovo ThinkPad X1 Carbon Gen 11 | `under_maintenance` | 32% Health (Auto-Flagged) |
| **Desktops** | `DSK-2001` | Dell OptiPlex 7010 Micro | `assigned` | 95% Health |
| **Desktops** | `DSK-2003` | Mac Studio M2 Ultra | `available` | 98% Health |
| **Servers** | `SRV-3001` | Dell PowerEdge R760 Rack Server | `assigned` | 94% Health |
| **Servers** | `SRV-3002` | Dell PowerEdge R660xs Server | `available` | 96% Health |
| **Networking** | `NET-4001` | Cisco Catalyst 9300-48P Switch | `assigned` | 91% Health |
| **Networking** | `NET-4003` | Fortinet FortiGate 100F Firewall | `assigned` | 88% Health |
| **Peripherals** | `MON-5001` | Dell UltraSharp 32" 4K (U3223QE) | `assigned` | 99% Health |
| **Mobile** | `IPH-6001` | Apple iPhone 15 Pro Enterprise | `assigned` | 81% Health, 82% Battery |

---

## 11. Automated Testing & Verification Suite

TechVault includes a dedicated automated test suite utilizing Node.js's native test runner (`node:test`) and strict assertions (`node:assert/strict`).

Run the automated test suite at any time:
```bash
npm test --prefix server
```

### Test Suite Execution Output
```text
▶ Financial Lifecycle & Depreciation Engine Tests
  ✔ Straight-Line depreciation computes correctly over half of useful life
  ✔ Book value never drops below salvage value even past useful life
  ✔ Double-Declining balance accelerates early depreciation
  ✔ Disposed asset stops depreciation and freezes at salvage
  ✔ Edge case: handles zero or negative purchase cost gracefully
✔ Financial Lifecycle & Depreciation Engine Tests (5 tests passing)

▶ Smart Procurement Forecasting Engine Logic
  ✔ Runway days reaches 0 when available stock is exhausted or equals pending requests
  ✔ Lead time and safety stock establish sensible reorder point
  ✔ High-runway categories with no pending demand require zero reorders
✔ Smart Procurement Forecasting Engine Logic (3 tests passing)

▶ Security & Governance Guardrails
  ✔ Valid HMAC signature is correctly produced and verified
  ✔ Tampered webhook payload fails HMAC verification
  ✔ Timestamp anti-replay rejects requests older than 5 minutes
  ✔ Segregation of Duties (SoD) blocks self-approval
  ✔ IDOR guard: employee attempting to access another user assignments is rejected
✔ Security & Governance Guardrails (5 tests passing)

ℹ tests 13
ℹ suites 3
ℹ pass 13
ℹ fail 0
```

---

## 12. Deployment, DevOps & Operations Runbook

### 12.1 Environment Configuration Parameters

#### Backend (`server/.env`)
```env
# Server Port & Runtime Environment
PORT=5000
NODE_ENV=production

# Database Connection (Local Docker or Remote Neon PostgreSQL)
DATABASE_URL=postgresql://techvault:techvault_password@postgres:5432/techvault_db?sslmode=disable

# Authentication Secrets
JWT_SECRET=super_secure_jwt_secret_techvault_enterprise_2026
JWT_EXPIRES_IN=7d

# CORS Allowed Origin
CLIENT_URL=http://localhost

# Webhook Security
TELEMETRY_WEBHOOK_SECRET=super_secure_telemetry_webhook_secret_key_2026
```

#### Frontend (`client/.env`)
```env
# Client API Base URL
VITE_API_URL=/api
```

---

### 12.2 Running TechVault with Docker Compose (Recommended)

1. **Start all services in detached mode:**
   ```bash
   docker compose up -d --build
   ```

2. **Run database migrations to initialize tables & seed fleet:**
   ```bash
   docker exec techvault_server node dist/db/migrate.js
   ```

3. **Verify running containers:**
   * `techvault_postgres` (PostgreSQL 16 on port `5432`)
   * `techvault_server` (Express API on port `5000`)
   * `techvault_client` (Nginx + React SPA on port `80`)

4. **Access the application:**
   * Open your browser at **`http://localhost`**
   * Log in with `admin@techvault.local` / `Admin@1234` or use the quick-login pills.

---

### 12.3 Running TechVault for Local Development

#### Terminal 1 — Backend API Server
```bash
cd server
npm install
npm run migrate   # Applies all 7 migrations
npm run dev       # Starts server on http://localhost:5000
```

#### Terminal 2 — Frontend Client
```bash
cd client
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 13. Troubleshooting & Operational FAQs

### Q1: Why were users not displaying on the `/users` page or assignment dropdowns?
* **Cause:** The `it_admin` role lacked the `manage_users` permission, which was previously attached to `GET /api/users`.
* **Resolution:** In [`server/src/routes/user.routes.ts`](file:///d:/Projects/TechVault-IT-Asset-Management-System/server/src/routes/user.routes.ts), `GET /api/users` was updated to `authorize('super_admin', 'it_admin')` without requiring `manage_users`. Creation, updating, and de-activation remain strictly locked to `super_admin` with `manage_users`.

### Q2: Why does `docker exec` fail with `MODULE_NOT_FOUND`?
* Ensure you do not add a trailing dot to the command. Correct syntax: `docker exec techvault_server node dist/db/migrate.js`.

### Q3: How do I test the Segregation of Duties (SoD) protection?
1. Log in as an administrator (e.g. `marcus.vance@techvault.local`).
2. Go to **Asset Requests** (`/requests`) and click **"Request Equipment"** to submit a requisition for yourself.
3. Observe that on your own requisition, the **"Approve"** and **"Reject"** action buttons are disabled with an amber **"SoD Policy Restricted"** badge.
4. Log out and log in as `admin@techvault.local` or another administrator; the review buttons will be enabled and ready for approval.

### Q4: How does device self-healing work?
* The background simulator runs every 3 minutes.
* If you want to trigger it manually via the webhook, issue a signed `POST /api/telemetry/webhook` request with `health_score: 25`.
* The system immediately switches the asset's status to `under_maintenance` and generates a `[System Auto-Flagged]` repair ticket.

---

*TechVault IT Asset Management System — Designed and Engineered for Enterprise Operational Excellence.*

