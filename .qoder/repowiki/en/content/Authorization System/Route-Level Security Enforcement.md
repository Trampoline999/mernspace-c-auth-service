# Route-Level Security Enforcement

<cite>
**Referenced Files in This Document**
- [src/app.js](file://src/app.js)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/routes/tenant.routes.js](file://src/routes/tenant.routes.js)
- [src/routes/user.routes.js](file://src/routes/user.routes.js)
- [src/middleware/authenticate.js](file://src/middleware/authenticate.js)
- [src/middleware/canAccess.js](file://src/middleware/canAccess.js)
- [src/middleware/parseToken.js](file://src/middleware/parseToken.js)
- [src/middleware/validateRefresh.js](file://src/middleware/validateRefresh.js)
- [src/controllers/AuthController.js](file://src/controllers/AuthController.js)
- [src/controllers/TenantController.js](file://src/controllers/TenantController.js)
- [src/controllers/UserController.js](file://src/controllers/UserController.js)
- [src/services/TenantService.js](file://src/services/TenantService.js)
- [src/services/UserService.js](file://src/services/UserService.js)
- [src/constants/index.js](file://src/constants/index.js)
- [src/entity/User.js](file://src/entity/User.js)
- [src/entity/Tenants.js](file://src/entity/Tenants.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains how route-level security is enforced across the application. It focuses on:
- How authorization is applied at the routing level via middleware
- Protected route configurations and access control patterns
- Tenant and user route security implementations and role-based access
- Strategies for protecting endpoints before controller execution
- Security middleware integration and practical examples
- Patterns for CRUD operations, bulk operations, and administrative functions
- Common vulnerabilities and mitigation strategies

## Project Structure
The application is organized around Express routers, middleware, controllers, services, and data entities. Routes define endpoint patterns and attach middleware for authentication and authorization. Controllers orchestrate request handling and delegate to services. Services encapsulate business logic and persistence.

```mermaid
graph TB
subgraph "HTTP Layer"
APP["Express App<br/>src/app.js"]
AUTH_R["Auth Routes<br/>src/routes/auth.routes.js"]
TENANT_R["Tenant Routes<br/>src/routes/tenant.routes.js"]
USER_R["User Routes<br/>src/routes/user.routes.js"]
end
subgraph "Security Middleware"
AUTH_M["authenticate<br/>src/middleware/authenticate.js"]
CANACCESS_M["canAccess<br/>src/middleware/canAccess.js"]
PARSETOKEN_M["parseToken<br/>src/middleware/parseToken.js"]
VALIDATEREFRESH_M["validateRefresh<br/>src/middleware/validateRefresh.js"]
end
subgraph "Controllers"
AUTH_C["AuthController<br/>src/controllers/AuthController.js"]
TENANT_C["TenantController<br/>src/controllers/TenantController.js"]
USER_C["UserController<br/>src/controllers/UserController.js"]
end
subgraph "Services"
TENANT_S["TenantService<br/>src/services/TenantService.js"]
USER_S["UserService<br/>src/services/UserService.js"]
end
subgraph "Domain Entities"
USER_E["User Entity<br/>src/entity/User.js"]
TENANT_E["Tenant Entity<br/>src/entity/Tenants.js"]
end
APP --> AUTH_R
APP --> TENANT_R
APP --> USER_R
AUTH_R --> AUTH_M
AUTH_R --> PARSETOKEN_M
AUTH_R --> VALIDATEREFRESH_M
AUTH_R --> AUTH_C
TENANT_R --> AUTH_M
TENANT_R --> CANACCESS_M
TENANT_R --> TENANT_C
TENANT_C --> TENANT_S
TENANT_S --> TENANT_E
USER_R --> AUTH_M
USER_R --> CANACCESS_M
USER_R --> USER_C
USER_C --> USER_S
USER_S --> USER_E
```

**Diagram sources**
- [src/app.js:19-21](file://src/app.js#L19-L21)
- [src/routes/auth.routes.js:12-14](file://src/routes/auth.routes.js#L12-L14)
- [src/routes/tenant.routes.js:7-8](file://src/routes/tenant.routes.js#L7-L8)
- [src/routes/user.routes.js:5-6](file://src/routes/user.routes.js#L5-L6)
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- [src/middleware/parseToken.js:4-11](file://src/middleware/parseToken.js#L4-L11)
- [src/middleware/validateRefresh.js:7-13](file://src/middleware/validateRefresh.js#L7-L13)
- [src/controllers/AuthController.js:22-27](file://src/controllers/AuthController.js#L22-L27)
- [src/controllers/TenantController.js:6-9](file://src/controllers/TenantController.js#L6-L9)
- [src/controllers/UserController.js:8-11](file://src/controllers/UserController.js#L8-L11)
- [src/services/TenantService.js:4-6](file://src/services/TenantService.js#L4-L6)
- [src/services/UserService.js:4-6](file://src/services/UserService.js#L4-L6)
- [src/entity/User.js:3-49](file://src/entity/User.js#L3-L49)
- [src/entity/Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)

**Section sources**
- [src/app.js:1-40](file://src/app.js#L1-L40)
- [src/routes/auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [src/routes/tenant.routes.js:1-45](file://src/routes/tenant.routes.js#L1-L45)
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)

## Core Components
- Authentication middleware validates JWTs using JWKS and extracts tokens from Authorization header or cookies.
- Role-based authorization middleware checks the authenticated user’s role against allowed roles.
- Route handlers attach middleware in order: authentication first, then authorization if required.
- Controllers handle request/response and delegate to services.
- Services encapsulate persistence and business logic.
- Constants define roles used across the system.

Key implementation references:
- Authentication middleware: [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- Role-based authorization: [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- Route-level middleware attachment: [src/routes/tenant.routes.js:16-21](file://src/routes/tenant.routes.js#L16-L21), [src/routes/user.routes.js:15-17](file://src/routes/user.routes.js#L15-L17)
- Roles definition: [src/constants/index.js:1-6](file://src/constants/index.js#L1-L6)

**Section sources**
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/routes/tenant.routes.js:1-45](file://src/routes/tenant.routes.js#L1-L45)
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/constants/index.js:1-6](file://src/constants/index.js#L1-L6)

## Architecture Overview
The security architecture enforces authentication and authorization at the route level. Requests flow through middleware before reaching controllers. Authentication ensures a valid identity; authorization ensures permitted roles.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Express Router"
participant AuthMW as "authenticate"
participant AccessMW as "canAccess"
participant Ctrl as "Controller"
participant Svc as "Service"
Client->>Router : "HTTP Request"
Router->>AuthMW : "Invoke middleware chain"
AuthMW-->>Router : "Attach req.auth (sub, role)"
Router->>AccessMW : "If protected route"
AccessMW-->>Router : "Allow or deny (403)"
Router->>Ctrl : "Call handler"
Ctrl->>Svc : "Delegate business logic"
Svc-->>Ctrl : "Result"
Ctrl-->>Client : "HTTP Response"
```

**Diagram sources**
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- [src/routes/tenant.routes.js:16-21](file://src/routes/tenant.routes.js#L16-L21)
- [src/routes/user.routes.js:15-17](file://src/routes/user.routes.js#L15-L17)
- [src/controllers/TenantController.js:11-22](file://src/controllers/TenantController.js#L11-L22)
- [src/controllers/UserController.js:12-28](file://src/controllers/UserController.js#L12-L28)

## Detailed Component Analysis

### Authentication Middleware
Purpose:
- Validates JWT using JWKS and RS256.
- Extracts token from Authorization header or cookies.

Behavior:
- Uses a JWKS URI for public keys.
- Supports caching and rate limiting for JWKS.
- Accepts tokens from Authorization: Bearer or cookies.

```mermaid
flowchart TD
Start(["Incoming Request"]) --> GetToken["Extract Token<br/>Authorization header or cookies"]
GetToken --> Verify["Verify JWT signature<br/>RS256 via JWKS"]
Verify --> Valid{"Valid?"}
Valid --> |Yes| AttachAuth["Attach req.auth (sub, role)"]
Valid --> |No| Reject["Reject with 401"]
AttachAuth --> Next(["Proceed to next middleware"])
Reject --> End(["End"])
Next --> End
```

**Diagram sources**
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)

**Section sources**
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)

### Authorization Middleware (Role-Based Access)
Purpose:
- Enforce role-based access control at the route level.

Behavior:
- Reads user role from req.auth.role.
- Compares against allowed roles array.
- Denies access with 403 if mismatch; otherwise proceeds.

```mermaid
flowchart TD
Start(["Middleware Entry"]) --> GetUserRole["Read req.auth.role"]
GetUserRole --> Allowed{"Is role in allowedRoles?"}
Allowed --> |Yes| Next(["Call next()"])
Allowed --> |No| Deny["Throw 403 Forbidden"]
Next --> End(["End"])
Deny --> End
```

**Diagram sources**
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)

**Section sources**
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)

### Auth Routes and Token Management
Protected endpoints:
- POST /auth/register: Public registration validator pipeline.
- POST /auth/login: Public login validator pipeline.
- GET /auth/self: Requires authentication; returns current user profile.
- POST /auth/refresh: Validates refresh token via dedicated middleware.
- POST /auth/logout: Parses refresh token from cookies and revokes.

```mermaid
sequenceDiagram
participant Client as "Client"
participant AuthRouter as "Auth Routes"
participant ParseMW as "parseToken"
participant RefreshMW as "validateRefresh"
participant AuthCtrl as "AuthController"
Client->>AuthRouter : "POST /auth/logout"
AuthRouter->>ParseMW : "Extract refresh token"
ParseMW-->>AuthRouter : "Attach req.auth"
AuthRouter->>AuthCtrl : "logout(req,res,next)"
AuthCtrl-->>Client : "200 OK"
```

**Diagram sources**
- [src/routes/auth.routes.js:44-46](file://src/routes/auth.routes.js#L44-L46)
- [src/middleware/parseToken.js:4-11](file://src/middleware/parseToken.js#L4-L11)
- [src/controllers/AuthController.js:194-210](file://src/controllers/AuthController.js#L194-L210)

**Section sources**
- [src/routes/auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [src/middleware/parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)
- [src/controllers/AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)

### Tenant Management Routes
Endpoints and protections:
- POST /tenants/: Require authentication and ADMIN role to create.
- GET /tenants/: Public listing (no auth).
- GET /tenants/tenants/:id: Public retrieval (no auth).
- POST /tenants/tenants/:id: Require authentication and ADMIN role to update.
- DELETE /tenants/tenants/:id: Require authentication and ADMIN role to delete.

```mermaid
sequenceDiagram
participant Client as "Client"
participant TenantRouter as "Tenant Routes"
participant AuthMW as "authenticate"
participant AccessMW as "canAccess(ADMIN)"
participant TenantCtrl as "TenantController"
Client->>TenantRouter : "POST /tenants/"
TenantRouter->>AuthMW : "Authenticate"
AuthMW-->>TenantRouter : "req.auth attached"
TenantRouter->>AccessMW : "Authorize ADMIN"
AccessMW-->>TenantRouter : "Allow or 403"
TenantRouter->>TenantCtrl : "create(req,res,next)"
TenantCtrl-->>Client : "201 Created"
```

**Diagram sources**
- [src/routes/tenant.routes.js:16-21](file://src/routes/tenant.routes.js#L16-L21)
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- [src/controllers/TenantController.js:11-22](file://src/controllers/TenantController.js#L11-L22)

**Section sources**
- [src/routes/tenant.routes.js:1-45](file://src/routes/tenant.routes.js#L1-L45)
- [src/controllers/TenantController.js:1-76](file://src/controllers/TenantController.js#L1-L76)
- [src/services/TenantService.js:1-66](file://src/services/TenantService.js#L1-L66)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)

### User Management Routes
Endpoints and protections:
- POST /users: Require authentication and ADMIN role to create.
- GET /users: Require authentication and ADMIN role to list.
- GET /users/:id: Require authentication; controller fetches by ID.
- PATCH /users/:id: Require authentication and ADMIN role to update.
- DELETE /users/:id: Require authentication and ADMIN role to delete.

```mermaid
sequenceDiagram
participant Client as "Client"
participant UserRouter as "User Routes"
participant AuthMW as "authenticate"
participant AccessMW as "canAccess(ADMIN)"
participant UserCtrl as "UserController"
Client->>UserRouter : "PATCH /users/ : id"
UserRouter->>AuthMW : "Authenticate"
AuthMW-->>UserRouter : "req.auth attached"
UserRouter->>AccessMW : "Authorize ADMIN"
AccessMW-->>UserRouter : "Allow or 403"
UserRouter->>UserCtrl : "update(req,res,next)"
UserCtrl-->>Client : "201 Updated"
```

**Diagram sources**
- [src/routes/user.routes.js:24-29](file://src/routes/user.routes.js#L24-L29)
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- [src/controllers/UserController.js:54-77](file://src/controllers/UserController.js#L54-L77)

**Section sources**
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/controllers/UserController.js:1-94](file://src/controllers/UserController.js#L1-L94)
- [src/services/UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)

### Data Models and Relationships
Entities define columns and relations used by services and controllers.

```mermaid
erDiagram
USER {
int id PK
varchar firstName
varchar lastName
varchar email UK
varchar password
varchar role
int tenantId FK
}
TENANT {
int id PK
varchar name
varchar address
}
USER ||--o{ REFRESH_TOKEN : "has many"
TENANT ||--o{ USER : "has many"
```

**Diagram sources**
- [src/entity/User.js:3-49](file://src/entity/User.js#L3-L49)
- [src/entity/Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)

**Section sources**
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)

## Dependency Analysis
- Routers depend on middleware for authentication and authorization.
- Controllers depend on services for business logic.
- Services depend on repositories backed by entities.
- Roles are centralized in constants and consumed by middleware and routes.

```mermaid
graph LR
AUTH_R["auth.routes.js"] --> AUTH_M["authenticate.js"]
AUTH_R --> PARSE_M["parseToken.js"]
AUTH_R --> VALIDATE_M["validateRefresh.js"]
TENANT_R["tenant.routes.js"] --> AUTH_M
TENANT_R --> ACCESS_M["canAccess.js"]
USER_R["user.routes.js"] --> AUTH_M
USER_R --> ACCESS_M
TENANT_R --> TENANT_C["TenantController.js"]
USER_R --> USER_C["UserController.js"]
TENANT_C --> TENANT_S["TenantService.js"]
USER_C --> USER_S["UserService.js"]
TENANT_S --> TENANT_E["Tenants.js"]
USER_S --> USER_E["User.js"]
ACCESS_M --> CONST["constants/index.js"]
```

**Diagram sources**
- [src/routes/auth.routes.js:12-14](file://src/routes/auth.routes.js#L12-L14)
- [src/routes/tenant.routes.js:7-8](file://src/routes/tenant.routes.js#L7-L8)
- [src/routes/user.routes.js:5-6](file://src/routes/user.routes.js#L5-L6)
- [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7)
- [src/middleware/parseToken.js:4-11](file://src/middleware/parseToken.js#L4-L11)
- [src/middleware/validateRefresh.js:7-13](file://src/middleware/validateRefresh.js#L7-L13)
- [src/controllers/TenantController.js:6-9](file://src/controllers/TenantController.js#L6-L9)
- [src/controllers/UserController.js:8-11](file://src/controllers/UserController.js#L8-L11)
- [src/services/TenantService.js:4-6](file://src/services/TenantService.js#L4-L6)
- [src/services/UserService.js:4-6](file://src/services/UserService.js#L4-L6)
- [src/entity/User.js:3-49](file://src/entity/User.js#L3-L49)
- [src/entity/Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)
- [src/constants/index.js:1-6](file://src/constants/index.js#L1-L6)

**Section sources**
- [src/app.js:1-40](file://src/app.js#L1-L40)
- [src/routes/auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [src/routes/tenant.routes.js:1-45](file://src/routes/tenant.routes.js#L1-L45)
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)

## Performance Considerations
- Prefer early middleware exit for unauthenticated requests to avoid unnecessary controller/service work.
- Cache JWKS and enable rate limiting to reduce external lookups and abuse.
- Keep authorization checks minimal and deterministic; avoid heavy computations inside middleware.
- Use appropriate HTTP status codes to short-circuit error paths efficiently.

## Troubleshooting Guide
Common issues and mitigations:
- 401 Unauthorized on protected routes:
  - Ensure Authorization header is present or refresh/access cookies are set.
  - Confirm token signing algorithm and JWKS URI are correct.
  - References: [src/middleware/authenticate.js:6-12](file://src/middleware/authenticate.js#L6-L12)
- 403 Forbidden on admin-only routes:
  - Verify the token carries the required role.
  - Confirm route uses canAccess with ADMIN.
  - References: [src/middleware/canAccess.js:4-7](file://src/middleware/canAccess.js#L4-L7), [src/routes/tenant.routes.js:19](file://src/routes/tenant.routes.js#L19), [src/routes/user.routes.js:16](file://src/routes/user.routes.js#L16)
- Refresh token validation failures:
  - Ensure refresh token is present in cookies and not revoked.
  - References: [src/middleware/validateRefresh.js:14-30](file://src/middleware/validateRefresh.js#L14-L30)
- Logout not clearing tokens:
  - Confirm refresh token deletion and cookie clearing logic.
  - References: [src/controllers/AuthController.js:194-210](file://src/controllers/AuthController.js#L194-L210)

**Section sources**
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/middleware/validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [src/controllers/AuthController.js:194-210](file://src/controllers/AuthController.js#L194-L210)

## Conclusion
Route-level security is consistently enforced by attaching authentication middleware before controllers and, when necessary, role-based authorization middleware. Administrative endpoints require explicit ADMIN role checks, while general user endpoints enforce authentication. The design cleanly separates concerns across middleware, controllers, services, and entities, enabling predictable and maintainable security enforcement.