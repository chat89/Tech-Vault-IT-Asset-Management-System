# TechVault: Enterprise Capstone Expansion Plan

This document serves as the master blueprint for elevating the TechVault Asset Management System into an enterprise-grade ERP capstone project. 

## I. Architectural Blueprint: The 4 Pillars

### 1. Financial Lifecycle & Depreciation Engine
*   **Database Updates:** Add `purchase_price` (decimal), `purchase_date` (timestamp), `salvage_value` (decimal), and `depreciation_model` (enum: 'STRAIGHT_LINE', 'DOUBLE_DECLINING') to the `assets` table.
*   **Backend:** Create utility functions to dynamically calculate current book value.
*   **Frontend:** Add a "Financials" widget to the Dashboard showing Total Capital Expenditure vs. Current Book Value.

### 2. Segregation of Duties (SoD) & Advanced RBAC
*   **Backend:** Implement middleware to enforce SoD rules (e.g., `requisition.requested_by !== user.id` for approvals). 
*   **Audit Logging:** Log SoD violation attempts as high-severity security events.

### 3. Simulated MDM Telemetry & Auto-Maintenance
*   **Database Updates:** Create an `asset_telemetry` table (health score, battery_cycle, last_ping).
*   **Backend:** Create a simulated cron job (using `node-cron`) that periodically injects telemetry data for the 25 seed assets. If health drops below a threshold, automatically insert a `maintenance_records` entry.
*   **Frontend:** Display dynamic "Health Scores" (Green/Yellow/Red) on the asset listing page.

### 4. Smart Procurement Forecasting
*   **Backend:** Create an analytics endpoint that calculates category burn-rate (assignments over time) and current stock. 
*   **Frontend:** Build a "Forecasting & Alerts" tab visualizing projected stockouts.

---

## II. Antigravity Agent Master Prompt

**Copy and paste everything below this line into your Antigravity agent prompt window:**

```text
# Role & Objective
You are a Senior Enterprise Software Engineer working on "TechVault," a React/Node.js/PostgreSQL IT Asset Management System. The foundational CRUD, RBAC, and UI are already built. Your objective is to implement four advanced enterprise features chunk by chunk to elevate this to a Capstone-level ERP project.

# Engineering Rules
- Maintain Clean Architecture and SOLID principles.
- Update PostgreSQL schema migrations properly.
- All new UI components must use the existing Tailwind CSS and Framer Motion styling.
- Do NOT rewrite existing working systems; extend them.
- Work strictly sequentially. Do not proceed to the next chunk until I confirm the current chunk is complete and working.

# Execution Plan (Chunk by Chunk)

## Chunk 1: Financial Lifecycle & Depreciation
1. Update the `assets` database schema to include `purchase_price`, `purchase_date`, `salvage_value`, and `depreciation_model` ('STRAIGHT_LINE', 'DOUBLE_DECLINING').
2. Generate migration scripts and update the seed data to include realistic financial values for the existing 25 assets.
3. Build a backend service/endpoint to calculate the real-time "Current Book Value" of the inventory.
4. Update the Frontend Dashboard to include a "Financial Overview" card showing Total Asset Cost vs. Current Book Value.
*Wait for my approval before proceeding to Chunk 2.*

## Chunk 2: ERP-Grade Segregation of Duties (SoD)
1. Modify the Requisition Approval backend logic.
2. Implement a strict SoD rule: An IT Admin or Super Admin CANNOT approve a requisition they created themselves.
3. Throw a specific 403 error for SoD violations and log the attempted violation to the `audit_logs` table with a 'SECURITY_ALERT' flag.
4. Update the Frontend UI to disable the "Approve" button and show an SoD warning tooltip if the logged-in user is the requester.
*Wait for my approval before proceeding to Chunk 3.*

## Chunk 3: Simulated MDM Telemetry & Auto-Maintenance
1. Create a new database table `asset_telemetry` linking to `asset_id` (fields: `health_score`, `battery_level`, `disk_status`, `last_ping`).
2. Create a backend webhook endpoint `POST /api/telemetry/webhook` to receive status updates.
3. Write a simulated background worker (or simple interval function in the backend) that randomly posts mock telemetry data for the seed assets every few minutes.
4. Add backend logic: If an asset's `health_score` drops below 40%, automatically generate a "System Auto-Flagged" record in `maintenance_records` and update the asset status to 'Maintenance Required'.
5. Display a live health indicator icon on the Frontend asset list.
*Wait for my approval before proceeding to Chunk 4.*

## Chunk 4: Smart Procurement Forecasting
1. Create a `GET /api/analytics/forecasting` endpoint.
2. Write logic to calculate "Burn Rate" for each category (e.g., how many laptops are assigned per month) and compare it against current unassigned inventory.
3. Calculate the "Runway" (estimated days until stockout).
4. Build a new "Procurement Forecast" tab in the Dashboard UI displaying a bar chart or list of categories nearing stockout.

**To begin, reply ONLY with:** "Acknowledged. I have reviewed the Capstone Expansion Plan. Analyzing codebase now... Shall I begin generating the DB migrations for Chunk 1 (Financial Lifecycle)?"
```