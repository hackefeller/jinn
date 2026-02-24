---
title: 'Example: Implement User Authentication API'
type: example
date: '2026-02-24'
status: example
framework: Task-Driven Workflow Architecture
---

# Example: Implement User Authentication API


---

## Summary

This plan demonstrates task-driven workflow for backend API implementation. Shows how to break down a complex backend feature into testable, delegatable tasks with dependencies and skill requirements.

## Feature Description

Add complete user authentication to an Express.js API with:

- User registration endpoint
- Login with JWT tokens
- Password hashing and validation
- Token refresh mechanism
- Protected route middleware
- Email verification (optional)

## Task List (Structured JSON Format)

```json
{
  "tasks": [
    {
      "id": "task-101",
      "subject": "Design authentication schema",
      "description": "Design database schema for users table including: id, email, password_hash, created_at, updated_at, is_verified. Also design tokens table for JWT refresh tokens with expiry. Create ERD diagram showing relationships.",
      "category": "ultrabrain",
      "skills": ["database-design"],
      "estimatedEffort": "1h",
      "status": "pending",
      "blockedBy": [],
      "blocks": ["task-102", "task-103"],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-102",
      "subject": "Create database migrations",
      "description": "Write database migrations to create users and tokens tables. Use TypeORM or Prisma migrations. Include proper indexes on email field for performance. Add constraints to ensure data integrity.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blockedBy": ["task-101"],
      "blocks": ["task-104", "task-105"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-103",
      "subject": "Implement password hashing and validation",
      "description": "Implement bcrypt-based password hashing. Create utility functions for hashing passwords on signup and validating them during login. Ensure secure password requirements (min length, complexity). Add rate limiting for password validation attempts.",
      "category": "ultrabrain",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "pending",
      "blockedBy": ["task-101"],
      "blocks": ["task-105"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-104",
      "subject": "Build JWT token management",
      "description": "Implement JWT token generation and validation. Create functions to generate access tokens (short-lived) and refresh tokens (long-lived). Implement token signing with secret keys. Include token payload structure with user_id, email, iat, exp.",
      "category": "ultrabrain",
      "skills": [],
      "estimatedEffort": "1.5h",
      "status": "pending",
      "blockedBy": ["task-102"],
      "blocks": ["task-106", "task-107"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-105",
      "subject": "Create authentication endpoints",
      "description": "Implement POST /auth/register and POST /auth/login endpoints. Register should validate email uniqueness, hash password, store user. Login should validate credentials, generate access/refresh tokens, return to client. Include proper error messages.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1.5h",
      "status": "pending",
      "blockedBy": ["task-102", "task-103"],
      "blocks": ["task-109"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-106",
      "subject": "Implement token refresh endpoint",
      "description": "Create POST /auth/refresh endpoint that validates refresh token and returns new access token. Verify refresh token is valid, not expired, and belongs to user. Return 401 if invalid. Store revoked tokens for logout.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blockedBy": ["task-104"],
      "blocks": ["task-109"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-107",
      "subject": "Create auth middleware",
      "description": "Implement Express middleware to verify JWT tokens on protected routes. Extract token from Authorization header, validate signature, check expiry. Attach user info to request. Return 401 if invalid. Should be reusable across all protected routes.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blockedBy": ["task-104"],
      "blocks": ["task-109"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-108",
      "subject": "Add email verification (optional)",
      "description": "Implement optional email verification flow. Send verification email on signup with verification link. Create endpoint to verify email token. Mark user as verified after clicking link. Update login to warn if email not verified.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "2h",
      "status": "pending",
      "blockedBy": ["task-105"],
      "blocks": ["task-109"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-109",
      "subject": "Write comprehensive authentication tests",
      "description": "Write unit and integration tests for all auth functionality: registration validation, login success/failure, token generation/validation, refresh tokens, middleware protection, email verification. Test error cases: invalid email, weak password, expired tokens, etc.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "3h",
      "status": "pending",
      "blockedBy": ["task-105", "task-106", "task-107", "task-108"],
      "blocks": ["task-110"],
      "wave": 4,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-110",
      "subject": "Create API documentation",
      "description": "Document all authentication endpoints in OpenAPI/Swagger format. Include request/response examples, error codes, authentication flow diagram. Document how to use auth middleware. Create migration guide for integrating auth into existing routes.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "2h",
      "status": "pending",
      "blockedBy": ["task-109"],
      "blocks": [],
      "wave": 5,
      "createdAt": "2026-02-24T00:00:00Z"
    }
  ]
}
```

---

## Execution Waves

**Wave 1** (Foundation): Database design

- task-101: Design authentication schema

**Wave 2** (Parallel Implementation): Database and utilities

- task-102: Create database migrations
- task-103: Implement password hashing
- task-104: Build JWT token management

**Wave 3** (Parallel Endpoints): Auth endpoints

- task-105: Create authentication endpoints
- task-106: Implement token refresh endpoint
- task-107: Create auth middleware
- task-108: Add email verification (optional)

**Wave 4** (Testing): Comprehensive tests

- task-109: Write comprehensive tests

**Wave 5** (Documentation): User documentation

- task-110: Create API documentation

---

## Delegation Strategy

### Architecture & Complex Logic

- **task-101** → `ultrabrain` (database design complexity)
- **task-103** → `ultrabrain` (security-critical password handling)
- **task-104** → `ultrabrain` (JWT security and token lifecycle)

### Implementation Tasks

- **task-102** → `quick` (straightforward migrations)
- **task-105** → `quick` (standard endpoint implementation)
- **task-106** → `quick` (token refresh pattern)
- **task-107** → `quick` (middleware pattern)
- **task-108** → `quick` (email verification flow)

### Testing & Documentation

- **task-109** → `quick` (comprehensive test writing)
- **task-110** → `writing` (API documentation)

---

## Key Features Demonstrated

### 1. Complex Dependency Graph

Shows how tasks can have multiple blockers and multiple dependents:

- task-109 (testing) blocks on ALL implementation tasks
- task-110 (docs) depends only on testing completion

### 2. Mixed Complexity Levels

Demonstrates intelligent delegation:

- `ultrabrain` agent handles: schema design, password security, JWT implementation
- `quick` agent handles: migrations, endpoints, middleware
- `writing` agent handles: documentation

### 3. Parallelization Benefits

- Wave 2: 3 tasks run in parallel (saves ~2 hours)
- Wave 3: 4 tasks run in parallel (saves ~4 hours)
- Sequential bottleneck only at Wave 4 (testing)

### 4. Optional Tasks

Shows how to handle optional features:

- task-108 (email verification) is optional
- Can be skipped by removing from blocks/blockedBy
- Or marked as `status: skipped`

---

## Execution Instructions

```bash
# 1. Create workflow from feature description
/ghostwire:workflows:create "Implement user authentication API with JWT"

# 2. Check auto-generated task breakdown
/ghostwire:workflows:status

# 3. Execute plan (will parallelize Wave 2-3 tasks automatically)
/ghostwire:workflows:execute

# 4. System will delegate to appropriate agents:
#    - ultrabrain for security-critical parts
#    - quick agents for implementation
#    - Continue until all tasks complete

# 5. When done
/ghostwire:workflows:complete
```

---

## Expected Outcome

- ✅ Complete user authentication system
- ✅ Secure password handling with bcrypt
- ✅ JWT token generation and refresh
- ✅ Protected route middleware
- ✅ Email verification (optional)
- ✅ Comprehensive test coverage
- ✅ API documentation

**Total Estimated Time**: ~13.5 hours (with parallelization)  
**Sequential Only**: ~16.5 hours  
**Parallelization Benefit**: ~3 hours saved

---

## Reference

See `.ghostwire/TASK_DRIVEN_ARCHITECTURE_GUIDE.md` for complete workflow architecture documentation.
