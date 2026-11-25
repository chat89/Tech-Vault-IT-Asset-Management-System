# TechVault --- Additional Enhancement Blueprint

**Project:** TechVault --- Enterprise IT Asset & Lifecycle Management
Platform\
**Document type:** Proposed enhancements and implementation roadmap\
**Baseline:** Based on the supplied `PROGRESS.md` (updated 2026-10-31)

------------------------------------------------------------------------

## 1. Purpose and scope

TechVault already documents a substantial IT Asset Management
foundation: authentication and RBAC, asset inventory, assignments,
maintenance, requisitions, audit logs, financial depreciation, simulated
MDM telemetry, and procurement forecasting.

This document identifies enhancements that can make the existing system
more complete, reliable, secure, and demonstrable. These are
**recommendations**, not claims that the features already exist.

### Design principles

1.  Improve the correctness and completeness of existing workflows
    before adding many new modules.
2.  Enforce authorization and business rules on the backend; frontend
    restrictions are usability aids only.
3.  Preserve an auditable history of important asset, financial, and
    approval events.
4.  Make calculations explainable, configurable, and testable.
5.  Prefer incremental additions that fit the current React/Vite,
    TypeScript/Express, PostgreSQL, and Docker stack.

------------------------------------------------------------------------

## 2. Priority overview

  -----------------------------------------------------------------------
  Priority                Enhancement             Why it matters
  ----------------------- ----------------------- -----------------------
  P0 --- Critical         Webhook authentication  Prevent unauthorized
                          and validation          telemetry submissions

  P0 --- Critical         Authorization / IDOR    Prevent users accessing
                          verification            or changing records
                                                  outside their scope

  P0 --- Critical         Automated tests for     Prove core behavior and
                          workflows and           prevent regressions
                          calculations            

  P0 --- Critical         Forecasting model       Avoid misleading
                          validation              stockout and reorder
                                                  recommendations

  P0 --- Critical         Financial calculation   Keep book values and
                          edge cases              depreciation consistent

  P1 --- High             Complete asset          Cover receiving,
                          lifecycle               deployment, recovery,
                                                  retirement, and
                                                  disposal

  P1 --- High             Vendor and warranty     Connect assets to
                          management              suppliers, purchase
                                                  evidence, and coverage

  P1 --- High             QR/barcode              Make physical inventory
                          identification          checks faster

  P1 --- High             Incident/helpdesk       Connect
                          workflow                employee-reported
                                                  problems to maintenance

  P1 --- High             Reports and exports     Support operational and
                                                  financial review

  P1 --- High             Employee offboarding    Reduce unreturned or
                                                  unaccounted-for assets

  P2 --- Optional         Software license        Extend beyond physical
                          management              hardware

  P2 --- Optional         Advanced device         Enrich simulated or
                          compliance              real endpoint
                                                  monitoring

  P2 --- Optional         Worker queue, CI/CD,    Improve operations as
                          observability           the deployment grows
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 3. P0 --- Critical improvements

### 3.1 Secure the telemetry webhook

The current progress log describes `POST /api/telemetry/webhook` as open
and rate-limited. Rate limiting is useful but does not establish who
sent the event.

Recommended controls:

-   Authenticate devices or trusted gateway services with per-device
    credentials or signed requests.
-   Use HMAC request signatures over the raw request body.
-   Include a timestamp and reject stale requests within a configurable
    tolerance.
-   Add a unique event identifier or nonce to prevent replay.
-   Validate payload schema, ranges, asset identity, and event size.
-   Rotate and revoke credentials.
-   Record rejected submissions without logging secrets.
-   Keep webhook permissions separate from interactive user permissions.

**Acceptance criteria**

-   Requests without valid authentication are rejected.
-   Invalid signatures and stale/replayed events are rejected.
-   A device can only submit telemetry for assets it is authorized to
    report.
-   Invalid payloads cannot change asset status or create maintenance
    records.
-   Security-relevant rejections are auditable.

### 3.2 Verify authorization and prevent IDOR

Test every endpoint that accepts a user ID, asset ID, request ID,
maintenance ID, or other record identifier.

Examples:

-   An employee cannot retrieve another employee's private requisition
    by changing the URL ID.
-   An employee cannot assign, return, delete, or edit assets unless
    explicitly permitted.
-   An IT admin cannot grant themselves super-admin permissions.
-   Financial and audit endpoints have role-appropriate access.
-   List endpoints apply server-side scoping, not only frontend
    filtering.

**Acceptance criteria:** automated negative tests demonstrate that
unauthorized access returns the appropriate 401/403/404 response without
leaking protected record details.

### 3.3 Strengthen session and credential handling

Review and document:

-   Access-token lifetime and signing-key management.
-   Refresh-token rotation and revocation, if refresh tokens are used.
-   Logout behavior and server-side invalidation strategy.
-   Password reset and account recovery.
-   Password change and forced change for demo/default accounts.
-   Login throttling and suspicious-login logging.
-   Secure cookie settings if cookies are used.
-   Secret management through environment variables or a secrets
    manager.

Do not ship shared seed credentials or development secrets in a
production environment. Seed accounts should be clearly marked as
demo-only, and production bootstrap should require secure credential
setup.

### 3.4 Build an automated test foundation

Recommended layers:

  -----------------------------------------------------------------------
  Layer                               What to test
  ----------------------------------- -----------------------------------
  Unit                                Depreciation, reorder quantity,
                                      runway, health rules, permission
                                      helpers

  Integration                         API routes, database constraints,
                                      transactions, audit events

  Authorization                       Role matrix, ownership checks,
                                      IDOR, SoD

  Workflow                            Request → review → allocation →
                                      return

  Reliability                         Worker restart, duplicate event,
                                      database restart

  UI                                  Important employee and
                                      administrator journeys

  Performance                         List endpoints, dashboard queries,
                                      concurrent allocation
  -----------------------------------------------------------------------

Prioritize tests for money calculations, authorization, and state
transitions before visual snapshot tests.

### 3.5 Make procurement forecasting explainable

The existing log describes category-level burn rate, runway, risk bands,
and a 90-day buffer. Validate the model against actual business
definitions before relying on the output.

Define separate quantities:

-   Total physical stock.
-   Assigned stock.
-   Available stock.
-   Reserved stock.
-   Unserviceable stock.
-   Incoming purchase-order quantity.
-   Backordered or pending demand.
-   Forecast demand over a selected period.

A possible starting point is:

`Available = Total - Assigned - Reserved - Unserviceable`

Use the actual schema and business definitions when implementing this;
do not double-subtract quantities already excluded from the total.

A standard reorder-point model is:

`Reorder Point = Average Daily Demand × Procurement Lead Time + Safety Stock`

A possible reorder quantity is:

`Suggested Quantity = max(0, Target Stock - Available Stock - Confirmed Incoming Stock)`

Where `Target Stock` is based on forecast demand over the chosen
protection period plus safety stock.

**Model requirements**

-   Make procurement lead time configurable by category or vendor.
-   Define whether demand means requests, fulfilled assignments,
    replacement demand, or another measurable event.
-   Handle zero demand, sparse history, seasonality, and new categories.
-   Avoid treating every assignment as permanent consumption.
-   Show the inputs, assumptions, calculation date, and
    confidence/quality indicator.
-   Compare historical predictions with actual stockouts and purchasing
    outcomes.
-   Let an authorized user review a suggested reorder before creating a
    procurement request.

### 3.6 Validate financial depreciation

The existing system documents straight-line and double-declining
depreciation. Confirm the exact accounting conventions used and expose
them to users.

Recommended fields or concepts to verify:

-   Acquisition cost and currency.
-   Purchase date and in-service date.
-   Useful life and salvage value.
-   Depreciation method and convention.
-   Accumulated depreciation.
-   Current book value.
-   Impairment or write-down, if supported.
-   Disposal date and disposal proceeds.
-   Historical depreciation schedule.

**Calculation safeguards**

-   Book value must not fall below salvage value under the chosen
    policy.
-   Depreciation must stop when the asset is disposed of or reaches the
    end of its depreciable life.
-   Partial-year treatment must be defined.
-   Rounding rules must be consistent.
-   Invalid values (negative cost, salvage above cost, zero useful life)
    must be rejected or explicitly handled.
-   Historical reports should be reproducible for a selected as-of date.

Have a domain expert review the accounting policy before describing the
module as accounting-compliant.

------------------------------------------------------------------------

## 4. P1 --- Enterprise workflow enhancements

### 4.1 Complete the asset lifecycle

Recommended lifecycle stages:

1.  Procurement request and approval.
2.  Purchase order and vendor selection.
3.  Receiving and inspection.
4.  Asset registration and tagging.
5.  Configuration and deployment.
6.  Assignment and active use.
7.  Incident, maintenance, and repair.
8.  Return, inspection, and reassignment.
9.  Retirement approval.
10. Data sanitization and disposal.

Use explicit, validated state transitions rather than allowing arbitrary
status changes. Store who performed each transition, when, and why.

### 4.2 Vendor and warranty management

Potential entities:

-   `vendors`
-   `purchase_orders`
-   `purchase_order_items`
-   `asset_purchases` or a purchase reference on each asset
-   `warranties` (or warranty fields where the model is simple)

Capture vendor contact information, purchase reference, invoice
reference, purchase cost, currency, warranty start/end dates, coverage
details, and support contract information.

Useful functions:

-   Warranty-expiry dashboard.
-   Upcoming renewal reminders.
-   Vendor repair history.
-   Asset-to-invoice traceability.
-   Vendor performance summary, if enough data exists.

### 4.3 QR code and barcode asset identification

Generate a unique, non-sensitive asset identifier and encode a URL or
opaque identifier in a QR code.

Scanning should open an authenticated asset detail view. Do not encode
personal data, credentials, or sensitive asset details directly into the
QR code.

Useful workflows:

-   Receive and tag a new asset.
-   Perform periodic physical inventory.
-   Check an asset in or out.
-   Record a condition inspection.
-   Confirm a return.

### 4.4 IT helpdesk and incident management

Introduce a workflow that allows an employee to report a device issue.

Suggested fields:

-   Reporter and department.
-   Related asset.
-   Issue category and description.
-   Priority and impact.
-   Attachments, if supported safely.
-   Assigned technician.
-   Status and resolution.
-   Time opened, acknowledged, and resolved.

Possible statuses: `open`, `triaged`, `in_progress`, `waiting_for_user`,
`resolved`, `closed`.

Link incidents to maintenance records so that support history and asset
repair history remain connected.

### 4.5 Reports and exports

Recommended reports:

-   Asset register by category, department, status, and location.
-   Employee assignment register.
-   Overdue and unreturned assets.
-   Maintenance history and repair cost.
-   Warranty expiry.
-   Depreciation schedule and book value as of a date.
-   Procurement forecast and reorder recommendations.
-   Audit activity and approval history.

Exports should respect the requesting user's permissions. Record export
events where reports contain sensitive or financially significant data.

### 4.6 Employee offboarding and asset recovery

When an employee is marked as leaving or inactive:

1.  Generate a list of currently assigned assets.
2.  Notify the responsible IT team.
3.  Create return tasks.
4.  Record returned condition and accessories.
5.  Route damaged assets to maintenance.
6.  Clear the assignment only after the return workflow is completed.
7.  Record exceptions and approved write-offs.

Do not automatically mark an asset available merely because an employee
account is deactivated.

------------------------------------------------------------------------

## 5. P2 --- Optional advanced modules

### 5.1 Software license management

Track software products, subscriptions, license entitlements, assigned
users/devices, renewal dates, and utilization. Keep license compliance
rules explicit and avoid claiming legal compliance without validated
entitlement data.

### 5.2 Device compliance monitoring

Potential telemetry additions:

-   RAM and disk utilization.
-   CPU utilization and temperature.
-   Operating system and version.
-   Patch/update status.
-   Encryption status.
-   Antivirus/endpoint protection status.
-   Last user activity and last device check-in.

Distinguish simulated telemetry from real endpoint data. A simulated
event must be clearly labeled in the interface and reports.

### 5.3 Notifications

Add in-app and optionally email notifications for:

-   Request status changes.
-   Assignment and return reminders.
-   Warranty expiry.
-   Maintenance updates.
-   Critical device health alerts.
-   Offboarding tasks.
-   Procurement risk thresholds.

Use user preferences, deduplication, and delivery logs to avoid
notification spam.

### 5.4 Background job separation

The current progress log describes a telemetry simulator running within
the server process. As workload grows, consider separating scheduled and
asynchronous work into a worker process.

Potential jobs:

-   Telemetry simulation or ingestion.
-   Warranty reminders.
-   Forecast recalculation.
-   Scheduled reports.
-   Notification delivery.

A queue such as Redis-backed jobs is optional, not mandatory for the
current scale. Ensure jobs are idempotent and safe to retry.

------------------------------------------------------------------------

## 6. Data model and integrity review checklist

Review the actual schema and migrations before adding tables. Avoid
duplicating concepts that already exist.

-   [ ] Foreign keys protect all important relationships.
-   [ ] Unique constraints protect serial numbers, asset tags, and
    external event IDs where appropriate.
-   [ ] Check constraints protect valid monetary values and date ranges.
-   [ ] State transitions are enforced in backend business logic.
-   [ ] Critical multi-step operations use database transactions.
-   [ ] Concurrent allocation cannot assign one asset twice.
-   [ ] Audit records capture actor, action, entity, timestamp, and
    relevant change context.
-   [ ] Indexes support actual filter, join, and sort patterns.
-   [ ] Deletion behavior is deliberate (restrict, cascade, or soft
    delete).
-   [ ] Time zones and currency conventions are documented.
-   [ ] Migration rollback or recovery strategy is documented and
    tested.

------------------------------------------------------------------------

## 7. Operational readiness checklist

-   [ ] Separate development, test, and production configuration.
-   [ ] No default/demo passwords in production.
-   [ ] Secrets are not committed to source control.
-   [ ] HTTPS and secure reverse-proxy configuration are documented.
-   [ ] CORS and allowed origins are restricted.
-   [ ] Database backups run automatically.
-   [ ] Backup restoration is tested, not merely backup creation.
-   [ ] Logs are structured and do not expose passwords, tokens, or
    sensitive payloads.
-   [ ] Health checks distinguish process health from
    database/dependency health.
-   [ ] Error tracking and basic metrics are available.
-   [ ] Dependency and container image scans are part of the release
    process.
-   [ ] Deployment and rollback steps are documented.

------------------------------------------------------------------------

## 8. Suggested implementation roadmap

### Sprint 1 --- Trust and correctness

-   Secure webhook authentication.
-   Review JWT/session behavior.
-   Complete RBAC and IDOR test matrix.
-   Add unit and integration test foundations.
-   Verify transaction safety for asset allocation and approvals.

### Sprint 2 --- Financial and forecasting accuracy

-   Document calculation assumptions.
-   Add edge-case tests for depreciation.
-   Refine inventory availability definitions.
-   Add configurable lead time and safety stock.
-   Show forecast assumptions and calculation inputs.

### Sprint 3 --- Lifecycle completion

-   Add receiving and inspection.
-   Add warranty/vendor references.
-   Add return inspection and reassignment.
-   Add retirement, sanitization, and disposal workflow.
-   Add employee offboarding recovery tasks.

### Sprint 4 --- Operational usability

-   QR/barcode labels and scan workflow.
-   Helpdesk incidents linked to assets.
-   Reports and exports.
-   Notifications and reminders.

### Sprint 5 --- Production readiness (if required)

-   Separate background workers where justified.
-   CI/CD and security scanning.
-   Monitoring and structured logs.
-   Backup/restore validation.
-   Load and recovery testing.

------------------------------------------------------------------------

## 9. Definition of done

A feature should not be marked complete solely because its UI and
endpoint exist. For each feature, verify:

1.  The business rules are documented.
2.  The database constraints and migration are correct.
3.  Backend authorization is enforced.
4.  Input validation and error handling are present.
5.  Important changes are audited.
6.  Unit and integration tests pass.
7.  The UI handles loading, empty, error, and success states.
8.  The workflow has been tested using realistic role-based scenarios.
9.  Documentation and demo data are updated.

------------------------------------------------------------------------

## 10. Recommended project positioning

Suggested name:

**TechVault --- Intelligent Enterprise IT Asset & Lifecycle Management
Platform**

Suggested differentiators:

-   Financial lifecycle intelligence.
-   Role-based governance and segregation of duties.
-   Device health monitoring and maintenance automation.
-   Explainable procurement forecasting.
-   End-to-end asset custody and lifecycle traceability.

Be precise in presentations: distinguish implemented and tested
functionality from simulated data, planned enhancements, and future
integrations.
