# User Management

<cite>
**Referenced Files in This Document**
- [src/entity/User.js](file://src/entity/User.js)
- [src/entity/RefreshToken.js](file://src/entity/RefreshToken.js)
- [src/entity/Tenants.js](file://src/entity/Tenants.js)
- [src/controllers/UserController.js](file://src/controllers/UserController.js)
- [src/controllers/AuthController.js](file://src/controllers/AuthController.js)
- [src/services/UserService.js](file://src/services/UserService.js)
- [src/services/CredentialService.js](file://src/services/CredentialService.js)
- [src/services/TokenServices.js](file://src/services/TokenServices.js)
- [src/middleware/authenticate.js](file://src/middleware/authenticate.js)
- [src/middleware/canAccess.js](file://src/middleware/canAccess.js)
- [src/validators/register-validators.js](file://src/validators/register-validators.js)
- [src/validators/login-validators.js](file://src/validators/login-validators.js)
- [src/routes/user.routes.js](file://src/routes/user.routes.js)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/constants/index.js](file://src/constants/index.js)
- [src/app.js](file://src/app.js)
- [src/test/users/register.spec.js](file://src/test/users/register.spec.js)
- [src/test/users/login.spec.js](file://src/test/users/login.spec.js)
- [src/test/users/create.spec.js](file://src/test/users/create.spec.js)
- [src/test/users/user.spec.js](file://src/test/users/user.spec.js)
</cite>

## Update Summary
**Changes Made**
- Enhanced UserController.js with comprehensive tenant-aware CRUD operations
- Improved UserService.js with better tenant association handling and validation
- Updated login-validators.js with enhanced input validation and error handling
- Added tenant relationship support in User entity and Tenant entity
- Enhanced authorization middleware with role-based access control
- Updated test suites to cover tenant functionality and validation improvements

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
10. [Appendices](#appendices)

## Introduction
This document describes the user management functionality of the authentication service. It covers user registration (input validation, password hashing, role assignment), authentication (credential validation, JWT access and refresh tokens), the User entity schema with tenant associations, and comprehensive CRUD operations via dedicated controllers and services. It also documents validation rules, error handling, security measures, privacy considerations, access control patterns, and integration points with other system components.

## Project Structure
The user management feature spans several layers with enhanced tenant awareness:
- Routes define HTTP endpoints and apply middleware for authentication and authorization.
- Controllers handle request parsing, validation outcomes, and orchestrate service calls with tenant context.
- Services encapsulate business logic, including password hashing, credential comparison, and persistence with tenant associations.
- Validators enforce input constraints using express-validator schemas with improved error handling.
- Middleware enforces JWT-based authentication and role-based access control.
- Entities define the User, RefreshToken, and Tenant relational models.
- Constants define roles used across the system including tenant-aware operations.

```mermaid
graph TB
subgraph "HTTP Layer"
RUser["Routes: user.routes.js"]
RAuth["Routes: auth.routes.js"]
end
subgraph "Controllers"
CUser["UserController.js"]
CAuth["AuthController.js"]
end
subgraph "Services"
SUser["UserService.js"]
SCred["CredentialService.js"]
STok["TokenServices.js"]
end
subgraph "Validation"
VReg["register-validators.js"]
VLog["login-validators.js"]
end
subgraph "Middleware"
MAuth["authenticate.js"]
MCan["canAccess.js"]
end
subgraph "Entities"
EUser["User.js"]
ERT["RefreshToken.js"]
ETenant["Tenants.js"]
end
subgraph "Config"
Const["constants/index.js"]
App["app.js"]
end
RUser --> CUser
RAuth --> CAuth
CUser --> SUser
CAuth --> SUser
CAuth --> STok
CAuth --> SCred
SUser --> EUser
STok --> ERT
MAuth --> App
MCan --> App
VReg --> CAuth
VLog --> CAuth
Const --> MCan
EUser --> ETenant
```

**Diagram sources**
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/controllers/UserController.js:1-94](file://src/controllers/UserController.js#L1-L94)
- [src/controllers/AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [src/services/UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/services/TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)
- [src/constants/index.js:1-6](file://src/constants/index.js#L1-L6)
- [src/app.js:1-40](file://src/app.js#L1-L40)

**Section sources**
- [src/app.js:1-40](file://src/app.js#L1-L40)
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)

## Core Components
- User entity: Defines fields, uniqueness constraints, and relationships to RefreshToken and Tenant with tenantId foreign key.
- RefreshToken entity: Stores refresh tokens linked to users with timestamps.
- Tenant entity: Manages tenant organizations with one-to-many relationship to users.
- AuthController: Implements registration, login, token refresh, logout, and self-profile retrieval.
- UserController: Provides administrative endpoints for listing, retrieving, updating, and deleting users with tenant awareness.
- UserService: Encapsulates user creation, lookup by email/password visibility, ID lookup, listing, and updates with tenant association handling.
- CredentialService: Compares plaintext passwords against stored hashes.
- TokenService: Generates access and refresh tokens, persists refresh tokens, and deletes them.
- Validation schemas: Enforce registration and login input rules with enhanced error messages.
- Middleware: JWT authentication and role-based authorization with tenant-aware access control.

**Section sources**
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)
- [src/controllers/AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [src/controllers/UserController.js:1-94](file://src/controllers/UserController.js#L1-L94)
- [src/services/UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/services/TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)

## Architecture Overview
The user management architecture follows layered separation of concerns with enhanced tenant awareness:
- HTTP routes bind endpoints to controllers with authentication and authorization middleware.
- Controllers delegate to services for business logic with tenant context validation.
- Services interact with repositories (TypeORM) to manage persistence including tenant associations.
- Middleware enforces authentication, authorization, and tenant-aware access control.
- Validators ensure request payloads meet defined constraints with improved error handling.

```mermaid
sequenceDiagram
participant Client as "Client"
participant AuthRoute as "auth.routes.js"
participant AuthCtrl as "AuthController"
participant UserSvc as "UserService"
participant CredSvc as "CredentialService"
participant TokSvc as "TokenServices"
participant UserRepo as "User Repository"
participant RTRepo as "RefreshToken Repository"
Client->>AuthRoute : "POST /auth/register"
AuthRoute->>AuthCtrl : "register()"
AuthCtrl->>UserSvc : "create({firstName,lastName,email,password,role,tenantId})"
UserSvc->>UserRepo : "findOne({email})"
UserRepo-->>UserSvc : "null or user"
UserSvc->>UserRepo : "save({hashedPassword,role,tenantId})"
UserRepo-->>UserSvc : "saved user"
AuthCtrl->>TokSvc : "persistRefreshToken(user)"
TokSvc->>RTRepo : "save({user})"
RTRepo-->>TokSvc : "new refresh token"
AuthCtrl->>TokSvc : "generateAccessToken(payload)"
AuthCtrl->>TokSvc : "generateRefreshToken(payload)"
AuthCtrl-->>Client : "201 JSON{id}, cookies(access/refresh)"
Client->>AuthRoute : "POST /auth/login"
AuthRoute->>AuthCtrl : "login()"
AuthCtrl->>UserSvc : "findByEmailWithPassword(email)"
UserSvc->>UserRepo : "findOne(select password)"
UserRepo-->>UserSvc : "user"
AuthCtrl->>CredSvc : "comparePassword(input, hash)"
CredSvc-->>AuthCtrl : "boolean"
AuthCtrl->>TokSvc : "persistRefreshToken(user)"
AuthCtrl->>TokSvc : "generateAccessToken(payload)"
AuthCtrl->>TokSvc : "generateRefreshToken(payload)"
AuthCtrl-->>Client : "200 JSON{id}, cookies(access/refresh)"
```

**Diagram sources**
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/controllers/AuthController.js:19-136](file://src/controllers/AuthController.js#L19-L136)
- [src/services/UserService.js:7-54](file://src/services/UserService.js#L7-L54)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)

## Detailed Component Analysis

### User Entity Schema with Tenant Associations
The User entity defines the persisted representation of a user account with enhanced tenant awareness:
- Fields: id (auto-increment PK), firstName, lastName, email (unique), password (hidden from queries), role, tenantId (nullable foreign key).
- Relationships:
  - One-to-many with RefreshToken via refreshTokens.
  - Many-to-one with Tenant via tenantId foreign key relationship.
- Tenant-aware operations: Users can be associated with tenants for multi-tenant architecture support.

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
REFRESH_TOKEN {
int id PK
int userId FK
timestamp createdAt
timestamp updatedAt
}
TENANT {
int id PK
varchar name
varchar address
}
USER ||--o{ REFRESH_TOKEN : "has many"
TENANT ||--o{ USER : "contains"
```

**Diagram sources**
- [src/entity/User.js:3-49](file://src/entity/User.js#L3-L49)
- [src/entity/RefreshToken.js:3-34](file://src/entity/RefreshToken.js#L3-L34)
- [src/entity/Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)

**Section sources**
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)

### Registration Flow with Tenant Support
- Input validation: firstName, lastName, email, password validated via register-validators with enhanced error messages.
- Role assignment: Defaults to customer role during registration.
- Tenant association: Optional tenantId parameter allows user association with specific tenant.
- Password hashing: bcrypt with salt rounds is applied before storage.
- Persistence: Unique email constraint enforced; duplicate emails produce a 400 error.
- Token issuance: Access and refresh tokens generated and returned as cookies.

```mermaid
flowchart TD
Start(["POST /auth/register"]) --> Validate["Run register-validators"]
Validate --> Valid{"Valid?"}
Valid --> |No| Err400["Return 400 with errors"]
Valid --> |Yes| FindUser["Find user by email"]
FindUser --> Exists{"Email exists?"}
Exists --> |Yes| ErrDup["Return 400: email already exists"]
Exists --> |No| Hash["Hash password with bcrypt"]
Hash --> Save["Save user with role=customer, optional tenantId"]
Save --> PersistRT["Persist refresh token"]
PersistRT --> GenAcc["Generate access token (RS256)"]
GenAcc --> GenRef["Generate refresh token (HS256)"]
GenRef --> Cookies["Set access/refresh cookies"]
Cookies --> Done(["201 JSON{id}"])
```

**Diagram sources**
- [src/controllers/AuthController.js:19-70](file://src/controllers/AuthController.js#L19-L70)
- [src/services/UserService.js:7-38](file://src/services/UserService.js#L7-L38)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)

**Section sources**
- [src/controllers/AuthController.js:19-70](file://src/controllers/AuthController.js#L19-L70)
- [src/services/UserService.js:7-38](file://src/services/UserService.js#L7-L38)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/constants/index.js:1-6](file://src/constants/index.js#L1-L6)

### Authentication Flow with Enhanced Validation
- Input validation: email and password validated via improved login-validators with specific error messages.
- Credential verification: Retrieves user with password, compares plaintext vs stored hash.
- Token rotation: On successful login, a new refresh token is persisted and used to issue new access and refresh tokens.
- Response: Returns user id and sets access/refresh cookies.

```mermaid
sequenceDiagram
participant Client as "Client"
participant AuthRoute as "auth.routes.js"
participant AuthCtrl as "AuthController"
participant UserSvc as "UserService"
participant CredSvc as "CredentialService"
participant TokSvc as "TokenServices"
Client->>AuthRoute : "POST /auth/login"
AuthRoute->>AuthCtrl : "login()"
AuthCtrl->>UserSvc : "findByEmailWithPassword(email)"
UserSvc-->>AuthCtrl : "user (with password)"
AuthCtrl->>CredSvc : "comparePassword(input, hash)"
CredSvc-->>AuthCtrl : "match?"
alt match
AuthCtrl->>TokSvc : "persistRefreshToken(user)"
AuthCtrl->>TokSvc : "generateAccessToken(payload)"
AuthCtrl->>TokSvc : "generateRefreshToken(payload)"
AuthCtrl-->>Client : "200 JSON{id}, cookies(access/refresh)"
else mismatch
AuthCtrl-->>Client : "400 error"
end
```

**Diagram sources**
- [src/controllers/AuthController.js:72-136](file://src/controllers/AuthController.js#L72-L136)
- [src/services/UserService.js:48-54](file://src/services/UserService.js#L48-L54)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)

**Section sources**
- [src/controllers/AuthController.js:72-136](file://src/controllers/AuthController.js#L72-L136)
- [src/services/UserService.js:48-54](file://src/services/UserService.js#L48-L54)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)

### Enhanced User CRUD Operations with Tenant Awareness
Administrative endpoints with comprehensive tenant support:
- POST /users: Requires authentication and admin role; creates a user with provided fields, role, and optional tenantId.
- GET /users: Lists all users; requires admin role.
- GET /users/:id: Retrieves a user by id; requires authentication.
- PATCH /users/:id: Updates a user by id; requires admin role with validation middleware.
- DELETE /users/:id: Deletes a user by id; requires admin role.

```mermaid
sequenceDiagram
participant Client as "Client"
participant UserRoute as "user.routes.js"
participant UserCtrl as "UserController"
participant UserSvc as "UserService"
Client->>UserRoute : "POST /users"
UserRoute->>UserCtrl : "create()"
UserCtrl->>UserSvc : "create({...fields, role, tenantId})"
UserSvc-->>UserCtrl : "user"
UserCtrl-->>Client : "201 JSON{id}"
Client->>UserRoute : "PATCH /users/ : id"
UserRoute->>UserCtrl : "update()"
UserCtrl->>UserCtrl : "validationResult(req)"
UserCtrl->>UserSvc : "updateUser(id, {...fields, tenant})"
UserSvc-->>UserCtrl : "updatedUser"
UserCtrl-->>Client : "201 JSON{id}"
```

**Diagram sources**
- [src/routes/user.routes.js:15-35](file://src/routes/user.routes.js#L15-L35)
- [src/controllers/UserController.js:12-94](file://src/controllers/UserController.js#L12-L94)
- [src/services/UserService.js:68-84](file://src/services/UserService.js#L68-L84)

**Section sources**
- [src/routes/user.routes.js:15-35](file://src/routes/user.routes.js#L15-L35)
- [src/controllers/UserController.js:12-94](file://src/controllers/UserController.js#L12-L94)
- [src/services/UserService.js:68-84](file://src/services/UserService.js#L68-L84)

### Enhanced Validation Rules and Error Handling
- Registration:
  - firstName: required, trimmed, length 2–50.
  - lastName: required, trimmed, length 2–50.
  - email: required, normalized, valid format.
  - password: required, minimum 8 characters.
- Login:
  - email: required, normalized, valid format with specific error message "Email is required".
  - password: required, minimum 8 characters with specific error message "Password should be at least 8 chars".
- Validation middleware: Express-validator validationResult middleware for PATCH requests.
- Errors:
  - Validation failures return 400 with structured errors array.
  - Duplicate email returns 400 with specific error message.
  - General persistence/update errors return 500 with detailed error messages.
  - Authentication middleware returns 401/403 for invalid/expired tokens or insufficient permissions.

**Section sources**
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/controllers/UserController.js:54-77](file://src/controllers/UserController.js#L54-L77)
- [src/services/UserService.js:13-16](file://src/services/UserService.js#L13-L16)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)

### Security Measures
- Password hashing: bcrypt with salt rounds ensures irreversible storage.
- Access token signing: RS256 with a private key; short-lived access tokens.
- Refresh token signing: HS256 with a shared secret; persisted in DB with rotation on refresh.
- Secure cookies: httpOnly and SameSite strict; configurable domain.
- Authentication: express-jwt validates RS256 tokens from JWKS URI.
- Authorization: role-based gating via canAccess middleware with tenant-aware access control.
- Input validation: Comprehensive validation prevents injection attacks and malformed data.

**Section sources**
- [src/services/UserService.js:17-18](file://src/services/UserService.js#L17-L18)
- [src/services/TokenServices.js:12-43](file://src/services/TokenServices.js#L12-L43)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/controllers/AuthController.js:50-62](file://src/controllers/AuthController.js#L50-L62)
- [src/controllers/AuthController.js:116-129](file://src/controllers/AuthController.js#L116-L129)

### Practical Examples
- Create a user with tenant association:
  - Endpoint: POST /auth/register
  - Body: { firstName, lastName, email, password, role, tenantId }
  - Behavior: Validates inputs, hashes password, assigns role customer, associates with tenant, persists user, issues access/refresh tokens.
  - Expected response: 201 JSON with user id; cookies set.
  - Reference test: [src/test/users/register.spec.js:56-78](file://src/test/users/register.spec.js#L56-L78)
- Login with enhanced validation:
  - Endpoint: POST /auth/login
  - Body: { email, password }
  - Behavior: Validates inputs with specific error messages, checks credentials, rotates refresh token, issues new tokens.
  - Expected response: 200 JSON with user id; cookies set.
  - Reference test: [src/test/users/login.spec.js:62-74](file://src/test/users/login.spec.js#L62-L74)
- List users (admin) with tenant awareness:
  - Endpoint: GET /users
  - Headers: Cookie with access token
  - Behavior: Requires admin role; returns array of users with tenant associations.
  - Reference test: [src/test/users/create.spec.js:31-36](file://src/test/users/create.spec.js#L31-L36)
- Retrieve user by id:
  - Endpoint: GET /users/:id
  - Headers: Cookie with access token
  - Behavior: Requires authentication; returns user id with tenant information.
  - Implementation: [src/controllers/UserController.js:43-52](file://src/controllers/UserController.js#L43-L52)
- Update user with validation (admin):
  - Endpoint: PATCH /users/:id
  - Headers: Cookie with access token
  - Body: { firstName, lastName, email, role, tenantId }
  - Behavior: Requires admin role; validates input with express-validator; updates user record with tenant association.
  - Implementation: [src/controllers/UserController.js:54-77](file://src/controllers/UserController.js#L54-L77)
- Delete user (admin):
  - Endpoint: DELETE /users/:id
  - Headers: Cookie with access token
  - Behavior: Requires admin role; deletes user with tenant association.
  - Implementation: [src/controllers/UserController.js:79-94](file://src/controllers/UserController.js#L79-L94)

**Section sources**
- [src/test/users/register.spec.js:56-138](file://src/test/users/register.spec.js#L56-L138)
- [src/test/users/login.spec.js:62-90](file://src/test/users/login.spec.js#L62-L90)
- [src/test/users/create.spec.js:31-36](file://src/test/users/create.spec.js#L31-L36)
- [src/controllers/UserController.js:43-94](file://src/controllers/UserController.js#L43-L94)

### Access Control Patterns with Tenant Awareness
- authenticate middleware validates RS256 JWT from Authorization header or accessToken cookie.
- canAccess middleware restricts endpoints to specific roles (e.g., ADMIN) with tenant-aware authorization.
- Self profile endpoint retrieves current user based on auth claims with role validation.
- Tenant association: Users can be restricted to specific tenants based on their tenantId.

**Section sources**
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/controllers/AuthController.js:138-141](file://src/controllers/AuthController.js#L138-L141)

### Privacy Considerations
- Passwords are hashed and never exposed in queries; the User entity marks password as non-selectable by default.
- Access tokens are short-lived; refresh tokens are persisted server-side and rotated on refresh.
- Cookies are httpOnly and SameSite strict to mitigate XSS and CSRF risks.
- Tenant isolation: Users are isolated by tenantId to prevent cross-tenant data access.
- Input sanitization: Enhanced validation prevents injection attacks and malformed data.

**Section sources**
- [src/entity/User.js:23-26](file://src/entity/User.js#L23-L26)
- [src/services/TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)
- [src/controllers/AuthController.js:50-62](file://src/controllers/AuthController.js#L50-L62)

## Dependency Analysis
Key dependencies and relationships with enhanced tenant support:
- Routes depend on controllers and middleware with role-based access control.
- Controllers depend on services and validators with tenant validation.
- Services depend on repositories and external libraries (bcrypt, jsonwebtoken, jwks-rsa) with tenant association handling.
- Entities define relationships and constraints including tenant relationships.
- Middleware depends on configuration for JWKS and secrets with role-based authorization.

```mermaid
graph LR
RUser["user.routes.js"] --> CUser["UserController.js"]
RAuth["auth.routes.js"] --> CAuth["AuthController.js"]
CUser --> SUser["UserService.js"]
CAuth --> SUser
CAuth --> STok["TokenServices.js"]
CAuth --> SCred["CredentialService.js"]
SUser --> EUser["User.js"]
STok --> ERT["RefreshToken.js"]
MAuth["authenticate.js"] --> App["app.js"]
MCan["canAccess.js"] --> App
VReg["register-validators.js"] --> CAuth
VLog["login-validators.js"] --> CAuth
EUser --> ETenant["Tenants.js"]
```

**Diagram sources**
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/controllers/UserController.js:1-94](file://src/controllers/UserController.js#L1-L94)
- [src/controllers/AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [src/services/UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [src/services/TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [src/services/CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/entity/User.js:1-50](file://src/entity/User.js#L1-L50)
- [src/entity/RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [src/entity/Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)
- [src/app.js:1-40](file://src/app.js#L1-L40)

**Section sources**
- [src/app.js:1-40](file://src/app.js#L1-L40)
- [src/routes/user.routes.js:1-38](file://src/routes/user.routes.js#L1-L38)
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)

## Performance Considerations
- Password hashing cost: Salt rounds are configured in the service; adjust based on hardware capacity.
- Token operations: Persisting refresh tokens adds DB round-trips; consider caching frequently accessed user roles if needed.
- Validation overhead: express-validator schemas run before controller logic with enhanced error handling; keep rules minimal and efficient.
- Database indexing: Ensure unique indexes exist on email, tenantId, and composite keys for fast lookups.
- Tenant queries: Consider indexing tenantId for multi-tenant performance optimization.
- Service layer: UserService handles tenant association efficiently without additional joins.

## Troubleshooting Guide
Common issues and resolutions with enhanced validation:
- 400 Bad Request on registration:
  - Cause: Validation failure or duplicate email.
  - Resolution: Verify firstName/lastName/email/password meet constraints; ensure email is unique.
  - References: [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47), [src/services/UserService.js:13-16](file://src/services/UserService.js#L13-L16)
- 400 Bad Request on login:
  - Cause: Invalid credentials or malformed payload with specific error messages.
  - Resolution: Confirm email and password lengths and formats; ensure user exists with password.
  - References: [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25), [src/services/UserService.js:48-54](file://src/services/UserService.js#L48-L54)
- 400 Bad Request on user update:
  - Cause: Validation failure from express-validator middleware.
  - Resolution: Check firstName/lastName/email/role/tenantId format and constraints.
  - References: [src/controllers/UserController.js:54-77](file://src/controllers/UserController.js#L54-L77)
- 401 Unauthorized:
  - Cause: Missing or invalid access token.
  - Resolution: Ensure Authorization header or accessToken cookie is present and valid.
  - References: [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- 403 Forbidden:
  - Cause: Insufficient role for protected endpoints or tenant access violation.
  - Resolution: Use admin credentials for admin-only routes; verify tenant association.
  - References: [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- 500 Internal Server Error:
  - Cause: Database or key loading failures.
  - Resolution: Check private key availability and DB connectivity.
  - References: [src/services/TokenServices.js:16-23](file://src/services/TokenServices.js#L16-L23), [src/services/UserService.js:32-37](file://src/services/UserService.js#L32-L37)

**Section sources**
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/services/UserService.js:13-16](file://src/services/UserService.js#L13-L16)
- [src/services/UserService.js:32-37](file://src/services/UserService.js#L32-L37)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [src/services/TokenServices.js:16-23](file://src/services/TokenServices.js#L16-L23)

## Conclusion
The user management subsystem provides robust registration, authentication, and administrative CRUD operations with strong validation, secure credential handling, and clear access control. The enhanced system now includes comprehensive tenant awareness, improved input validation with better error messages, and enhanced security measures. The layered design promotes maintainability and testability, while JWT-based tokens and cookie policies support modern web security practices with tenant isolation capabilities.

## Appendices

### API Endpoints Summary with Tenant Support
- POST /auth/register
  - Body: { firstName, lastName, email, password, role, tenantId }
  - Response: 201 JSON { id }; cookies: accessToken, refreshToken
  - Validation: register-validators
- POST /auth/login
  - Body: { email, password }
  - Response: 200 JSON { id }; cookies: accessToken, refreshToken
  - Validation: login-validators with enhanced error messages
- GET /users
  - Response: 200 JSON { users }
  - Auth: authenticate, canAccess([ADMIN])
- GET /users/:id
  - Response: 200 JSON { id }
  - Auth: authenticate
- PATCH /users/:id
  - Body: { firstName, lastName, email, role, tenantId }
  - Response: 201 JSON { id }
  - Auth: authenticate, canAccess([ADMIN])
  - Validation: express-validator middleware
- DELETE /users/:id
  - Response: 201 JSON { id }
  - Auth: authenticate, canAccess([ADMIN])

**Section sources**
- [src/routes/auth.routes.js](file://src/routes/auth.routes.js)
- [src/routes/user.routes.js:15-35](file://src/routes/user.routes.js#L15-L35)
- [src/validators/register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [src/validators/login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [src/middleware/authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [src/middleware/canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)