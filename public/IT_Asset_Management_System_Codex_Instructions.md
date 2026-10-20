# Codex Development Instructions

## Role
Act as a Senior Software Engineer responsible for designing and implementing a production-quality full-stack application.

## Project
Secure Web-Based IT Asset Management System with Role-Based Access Control.

## Objective
Build a scalable enterprise-grade IT asset management platform that securely manages hardware and software assets throughout their lifecycle.

## Preferred Stack

Frontend:
- React + TypeScript
- Tailwind CSS
- React Router
- React Query
- Clean component architecture

Backend:
- Node.js
- Express.js or NestJS
- REST API architecture

Database:
- PostgreSQL
- Neon compatible

## Engineering Standards

Follow:
- Clean Architecture principles
- SOLID principles
- REST API best practices
- Type-safe development
- Meaningful naming conventions
- Modular folder structure
- Error handling standards
- Environment variable management

## Required Modules

1. Authentication
- Secure registration/login
- JWT authentication
- Password hashing
- Session security

2. Authorization
Implement RBAC:

Roles:
- Super Admin
- IT Administrator
- Employee

Permissions:
- Create asset
- Update asset
- Delete asset
- Assign asset
- View reports
- Manage users

3. Asset Management

Features:
- Add assets
- Categorize assets
- Assign assets to employees
- Track asset status
- Track maintenance history
- Maintain asset ownership history

4. Dashboard

Include:
- Total assets
- Available assets
- Assigned assets
- Maintenance required
- Asset distribution charts

5. Audit Logging

Record:
- Login activity
- Asset creation
- Asset modification
- Assignment changes
- Permission changes

## Security Requirements

Implement:
- Input validation
- Secure password storage
- JWT protection
- Role middleware
- API authorization
- Protection against common OWASP vulnerabilities
- Secure file upload handling

## Database Design

Create normalized schema for:

Users
Roles
Permissions
Assets
Categories
Assignments
Maintenance Records
Audit Logs

## UI Requirements

Design:
- Modern enterprise dashboard
- Responsive layout
- Clear navigation
- Accessible components

## Development Approach

Before coding:
1. Design architecture
2. Define database schema
3. Create API documentation
4. Implement backend
5. Implement frontend
6. Add security testing
7. Prepare deployment documentation

Avoid:
- Overengineering
- Unnecessary microservices
- Complex dependencies
- Poor coding shortcuts

The final application should look like a professional enterprise product suitable for internship evaluation.
