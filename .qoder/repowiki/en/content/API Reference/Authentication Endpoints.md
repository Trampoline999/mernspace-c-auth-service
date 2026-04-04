# Authentication Endpoints

<cite>
**Referenced Files in This Document**
- [auth.routes.js](file://src/routes/auth.routes.js)
- [AuthController.js](file://src/controllers/AuthController.js)
- [UserService.js](file://src/services/UserService.js)
- [CredentialService.js](file://src/services/CredentialService.js)
- [TokenServices.js](file://src/services/TokenServices.js)
- [register-validators.js](file://src/validators/register-validators.js)
- [login-validators.js](file://src/validators/login-validators.js)
- [authenticate.js](file://src/middleware/authenticate.js)
- [validateRefresh.js](file://src/middleware/validateRefresh.js)
- [parseToken.js](file://src/middleware/parseToken.js)
- [index.js](file://src/constants/index.js)
- [RefreshToken.js](file://src/entity/RefreshToken.js)
- [User.js](file://src/entity/User.js)
- [config.js](file://src/config/config.js)
- [register.spec.js](file://src/test/users/register.spec.js)
- [login.spec.js](file://src/test/users/login.spec.js)
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
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive API documentation for the authentication endpoints exposed by the service. It covers:
- POST /auth/register: user registration with validation, password hashing, role assignment, and token issuance
- POST /auth/login: credential verification, JWT access token generation, refresh token issuance, and cookie setting
- POST /auth/refresh: refresh token validation and access token regeneration
- POST /auth/logout: session termination and refresh token invalidation
- GET /auth/self: authenticated user profile retrieval

For each endpoint, we specify HTTP method, URL pattern, request headers, authentication requirements, request body schemas with validation rules, response formats, error handling, and practical curl examples.

## Project Structure
The authentication module is organized around Express routes, controller orchestration, service-layer logic, middleware for token parsing and validation, validators for request schemas, and TypeORM entities for persistence.

```mermaid
graph TB
subgraph "Routes"
R1["auth.routes.js"]
end
subgraph "Controllers"
C1["AuthController.js"]
end
subgraph "Services"
S1["UserService.js"]
S2["CredentialService.js"]
S3["TokenServices.js"]
end
subgraph "Middleware"
M1["authenticate.js"]
M2["validateRefresh.js"]
M3["parseToken.js"]
end
subgraph "Validators"
V1["register-validators.js"]
V2["login-validators.js"]
end
subgraph "Entities"
E1["User.js"]
E2["RefreshToken.js"]
end
subgraph "Config"
K1["config.js"]
K2["constants/index.js"]
end
R1 --> C1
C1 --> S1
C1 --> S2
C1 --> S3
R1 --> V1
R1 --> V2
R1 --> M1
R1 --> M2
R1 --> M3
S1 --> E1
S3 --> E2
S3 --> K1
C1 --> K2
```

**Diagram sources**
- [auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [User.js:1-50](file://src/entity/User.js#L1-L50)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [config.js:1-34](file://src/config/config.js#L1-L34)
- [index.js:1-6](file://src/constants/index.js#L1-L6)

**Section sources**
- [auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)

## Core Components
- Route bindings define endpoint URLs and attach middleware and validators.
- Controller orchestrates request validation, service calls, token generation, and cookie setting.
- Services encapsulate business logic: user creation/password comparison, JWT signing, refresh token persistence/deletion.
- Middleware enforces authentication for protected routes and validates refresh tokens.
- Validators define request schema rules for registration and login.
- Entities model persisted resources: User and RefreshToken.
- Constants define roles.
- Configuration supplies secrets and endpoints.

**Section sources**
- [auth.routes.js:16-46](file://src/routes/auth.routes.js#L16-L46)
- [AuthController.js:19-211](file://src/controllers/AuthController.js#L19-L211)
- [UserService.js:7-98](file://src/services/UserService.js#L7-L98)
- [TokenServices.js:8-59](file://src/services/TokenServices.js#L8-L59)
- [CredentialService.js:3-5](file://src/services/CredentialService.js#L3-L5)
- [authenticate.js:6-25](file://src/middleware/authenticate.js#L6-L25)
- [validateRefresh.js:7-31](file://src/middleware/validateRefresh.js#L7-L31)
- [register-validators.js:3-46](file://src/validators/register-validators.js#L3-L46)
- [login-validators.js:3-24](file://src/validators/login-validators.js#L3-L24)
- [User.js:3-49](file://src/entity/User.js#L3-L49)
- [RefreshToken.js:3-34](file://src/entity/RefreshToken.js#L3-L34)
- [index.js:1-6](file://src/constants/index.js#L1-L6)
- [config.js:23-33](file://src/config/config.js#L23-L33)

## Architecture Overview
The authentication flow integrates route handlers, validation, controller actions, and services. Access tokens are validated via RS256 using JWKS; refresh tokens are HS256-signed and validated against persisted records.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "auth.routes.js"
participant Ctrl as "AuthController"
participant U as "UserService"
participant P as "CredentialService"
participant T as "TokenService"
participant RTbl as "RefreshToken entity"
Client->>Router : "POST /auth/register"
Router->>Ctrl : "register(req,res,next)"
Ctrl->>U : "create({firstName,lastName,email,password,role})"
U-->>Ctrl : "User saved"
Ctrl->>T : "persistRefreshToken(user)"
T-->>Ctrl : "RefreshToken record"
Ctrl->>T : "generateAccessToken(payload)"
Ctrl->>T : "generateRefreshToken(payloadWithTokenId)"
Ctrl-->>Client : "201 JSON {id} + cookies accessToken, refreshToken"
Client->>Router : "POST /auth/login"
Router->>Ctrl : "login(req,res,next)"
Ctrl->>U : "findByEmailWithPassword({email})"
U-->>Ctrl : "User with password"
Ctrl->>P : "comparePassword(password, hash)"
P-->>Ctrl : "match?"
Ctrl->>T : "persistRefreshToken(user)"
T-->>Ctrl : "RefreshToken record"
Ctrl->>T : "generateAccessToken(payload)"
Ctrl->>T : "generateRefreshToken(payloadWithTokenId)"
Ctrl-->>Client : "200 JSON {id} + cookies accessToken, refreshToken"
```

**Diagram sources**
- [auth.routes.js:29-35](file://src/routes/auth.routes.js#L29-L35)
- [AuthController.js:19-136](file://src/controllers/AuthController.js#L19-L136)
- [UserService.js:7-54](file://src/services/UserService.js#L7-L54)
- [CredentialService.js:3-5](file://src/services/CredentialService.js#L3-L5)
- [TokenServices.js:45-43](file://src/services/TokenServices.js#L45-L43)

## Detailed Component Analysis

### POST /auth/register
- Method: POST
- URL: /auth/register
- Request Headers:
  - Content-Type: application/json
- Authentication: Not required
- Request Body Schema:
  - firstName: string, required, min 2, max 50, trimmed
  - lastName: string, required, min 2, max 50, trimmed
  - email: string, required, valid email, normalized
  - password: string, required, min 8 characters
- Validation Rules:
  - Uses express-validator schema for registration
  - Rejects missing/invalid fields with 400
- Behavior:
  - Checks for existing email; rejects with 400 if duplicate
  - Hashes password using bcrypt
  - Assigns role customer
  - Persists user
  - Generates refresh token and access token
  - Sets httpOnly cookies for accessToken and refreshToken
  - Returns 201 with JSON { id }
- Success Response:
  - Status: 201
  - Body: { id: number }
  - Cookies: accessToken, refreshToken
- Error Responses:
  - 400 Bad Request: validation errors or duplicate email
  - 500 Internal Server Error: database/store failure
- Practical curl Example:
  - curl -X POST https://localhost:8080/auth/register -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"securePass123"}' --cookie-jar cookies.txt
- Common Error Scenarios:
  - Missing fields or invalid email/password length → 400
  - Duplicate email → 400
  - Database error during save → 500

**Section sources**
- [auth.routes.js:29-31](file://src/routes/auth.routes.js#L29-L31)
- [register-validators.js:3-46](file://src/validators/register-validators.js#L3-L46)
- [AuthController.js:19-70](file://src/controllers/AuthController.js#L19-L70)
- [UserService.js:7-38](file://src/services/UserService.js#L7-L38)
- [index.js:1-6](file://src/constants/index.js#L1-L6)
- [TokenServices.js:45-43](file://src/services/TokenServices.js#L45-L43)

### POST /auth/login
- Method: POST
- URL: /auth/login
- Request Headers:
  - Content-Type: application/json
- Authentication: Not required
- Request Body Schema:
  - email: string, required, valid email, normalized
  - password: string, required, min 8 characters
- Validation Rules:
  - Uses express-validator schema for login
  - Rejects missing/invalid fields with 400
- Behavior:
  - Finds user by email including password
  - Compares password using bcrypt
  - On mismatch, returns 400
  - Generates refresh token and access token
  - Sets httpOnly cookies for accessToken and refreshToken
  - Returns 200 with JSON { id }
- Success Response:
  - Status: 200
  - Body: { id: number }
  - Cookies: accessToken, refreshToken
- Error Responses:
  - 400 Bad Request: invalid credentials or validation errors
  - 500 Internal Server Error: unexpected error
- Practical curl Example:
  - curl -X POST https://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"securePass123"}' --cookie-jar cookies.txt
- Common Error Scenarios:
  - Email not found or wrong password → 400
  - Validation errors → 400

**Section sources**
- [auth.routes.js:33-35](file://src/routes/auth.routes.js#L33-L35)
- [login-validators.js:3-24](file://src/validators/login-validators.js#L3-L24)
- [AuthController.js:72-136](file://src/controllers/AuthController.js#L72-L136)
- [UserService.js:48-54](file://src/services/UserService.js#L48-L54)
- [CredentialService.js:3-5](file://src/services/CredentialService.js#L3-L5)
- [TokenServices.js:45-43](file://src/services/TokenServices.js#L45-L43)

### POST /auth/refresh
- Method: POST
- URL: /auth/refresh
- Request Headers:
  - Cookie: refreshToken=... (required)
- Authentication: Not required (validated via middleware)
- Request Body: None
- Behavior:
  - Validates refresh token signature and checks revocation against persisted tokens
  - On success, generates new access and refresh tokens
  - Replaces refresh token (rotation) and updates persisted record
  - Sets httpOnly cookies for accessToken and refreshToken
  - Returns 200 with JSON { id }
- Success Response:
  - Status: 200
  - Body: { id: number }
  - Cookies: accessToken, refreshToken
- Error Responses:
  - 400 Bad Request: invalid/expired/revoked refresh token or user not found
  - 500 Internal Server Error: unexpected error
- Practical curl Example:
  - curl -X POST https://localhost:8080/auth/refresh --cookie "refreshToken=...; accessToken=..." --cookie-jar cookies.txt
- Common Error Scenarios:
  - Missing/invalid refresh token → 400
  - Revoked token (not found in DB) → 400
  - User not found by token subject → 400

**Section sources**
- [auth.routes.js:41-43](file://src/routes/auth.routes.js#L41-L43)
- [validateRefresh.js:7-31](file://src/middleware/validateRefresh.js#L7-L31)
- [AuthController.js:143-192](file://src/controllers/AuthController.js#L143-L192)
- [TokenServices.js:45-58](file://src/services/TokenServices.js#L45-L58)

### POST /auth/logout
- Method: POST
- URL: /auth/logout
- Request Headers:
  - Authorization: Bearer <access_token> (optional)
  - Cookie: refreshToken=... (optional)
- Authentication: Optional; token parsed by middleware
- Request Body: None
- Behavior:
  - Parses refresh token from cookie
  - Deletes refresh token record from DB
  - Clears accessToken and refreshToken cookies
  - Returns 200 with JSON { message }
- Success Response:
  - Status: 200
  - Body: { message: string }
- Error Responses:
  - 500 Internal Server Error: unexpected error
- Practical curl Example:
  - curl -X POST https://localhost:8080/auth/logout --cookie "refreshToken=...; accessToken=..."
- Common Error Scenarios:
  - Token parsing or deletion failure → 500

**Section sources**
- [auth.routes.js:44-46](file://src/routes/auth.routes.js#L44-L46)
- [parseToken.js:4-11](file://src/middleware/parseToken.js#L4-L11)
- [AuthController.js:194-211](file://src/controllers/AuthController.js#L194-L211)
- [TokenServices.js:54-58](file://src/services/TokenServices.js#L54-L58)

### GET /auth/self
- Method: GET
- URL: /auth/self
- Request Headers:
  - Authorization: Bearer <access_token> (required)
- Authentication: Required (RS256 via JWKS)
- Request Body: None
- Behavior:
  - Extracts user ID from access token
  - Loads user from DB
  - Returns user object
- Success Response:
  - Status: 200
  - Body: User object (fields depend on entity definition)
- Error Responses:
  - 401 Unauthorized: missing/invalid token
  - 404 Not Found: user not found by ID
  - 500 Internal Server Error: unexpected error
- Practical curl Example:
  - curl -X GET https://localhost:8080/auth/self -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

**Section sources**
- [auth.routes.js:37-39](file://src/routes/auth.routes.js#L37-L39)
- [authenticate.js:6-25](file://src/middleware/authenticate.js#L6-L25)
- [AuthController.js:138-141](file://src/controllers/AuthController.js#L138-L141)
- [UserService.js:56-62](file://src/services/UserService.js#L56-L62)

## Dependency Analysis
Key dependencies and interactions:
- Routes bind endpoints to controller methods and attach validators and middleware.
- Controller depends on UserService for user operations, CredentialService for password comparison, and TokenService for JWT operations.
- TokenService depends on configuration for secrets and keys, and on RefreshToken entity for persistence.
- Middleware authenticate and validateRefresh enforce token policies and extract tokens from headers or cookies.

```mermaid
graph LR
AR["auth.routes.js"] --> AC["AuthController.js"]
AC --> US["UserService.js"]
AC --> CS["CredentialService.js"]
AC --> TS["TokenServices.js"]
TS --> CFG["config.js"]
TS --> RT["RefreshToken.js"]
AC --> ROLES["constants/index.js"]
AR --> AUTH["authenticate.js"]
AR --> VR["validateRefresh.js"]
AR --> PT["parseToken.js"]
US --> UE["User.js"]
```

**Diagram sources**
- [auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [UserService.js:1-99](file://src/services/UserService.js#L1-L99)
- [CredentialService.js:1-7](file://src/services/CredentialService.js#L1-L7)
- [TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [config.js:1-34](file://src/config/config.js#L1-L34)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [User.js:1-50](file://src/entity/User.js#L1-L50)
- [index.js:1-6](file://src/constants/index.js#L1-L6)
- [authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)

**Section sources**
- [auth.routes.js:16-46](file://src/routes/auth.routes.js#L16-L46)
- [AuthController.js:11-16](file://src/controllers/AuthController.js#L11-L16)
- [TokenServices.js:8-11](file://src/services/TokenServices.js#L8-L11)

## Performance Considerations
- Password hashing uses bcrypt with a fixed cost; ensure appropriate hardware provisioning for registration/login throughput.
- Access tokens are short-lived (1 hour); rely on refresh tokens for extended sessions.
- JWKS caching is enabled for access token validation; keep network latency low for token verification.
- Refresh token revocation occurs on logout and refresh rotation; maintain efficient DB indexing on refreshTokens.id and user associations.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Validation failures (400):
  - Missing/empty fields or invalid formats trigger validation errors with array of details.
  - Registration: email already exists returns 400.
- Authentication errors (401):
  - Missing or invalid Authorization header/token.
- Token-related errors (400):
  - Login with wrong credentials returns 400.
  - Refresh with revoked/not-found token returns 400.
- Logout errors (500):
  - Unexpected failures during refresh token deletion or cookie clearing.
- Tests as references:
  - Registration tests validate DB persistence, role assignment, password hashing, cookie issuance, and refresh token storage.
  - Login tests validate successful login and password comparison.

**Section sources**
- [AuthController.js:23-26](file://src/controllers/AuthController.js#L23-L26)
- [UserService.js:13-16](file://src/services/UserService.js#L13-L16)
- [AuthController.js:86-101](file://src/controllers/AuthController.js#L86-L101)
- [validateRefresh.js:14-30](file://src/middleware/validateRefresh.js#L14-L30)
- [AuthController.js:152-159](file://src/controllers/AuthController.js#L152-L159)
- [register.spec.js:98-104](file://src/test/users/register.spec.js#L98-L104)
- [login.spec.js:62-74](file://src/test/users/login.spec.js#L62-L74)

## Conclusion
The authentication module provides a robust, standards-compliant authentication flow with strong validation, secure token handling, and clear error signaling. The documented endpoints support user registration, login, refresh, logout, and profile retrieval with explicit schemas and error codes.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Endpoint Reference Summary
- POST /auth/register
  - Headers: Content-Type: application/json
  - Body: firstName, lastName, email, password
  - Response: 201 { id }, cookies: accessToken, refreshToken
  - Errors: 400 (validation/duplicate), 500 (store failure)
- POST /auth/login
  - Headers: Content-Type: application/json
  - Body: email, password
  - Response: 200 { id }, cookies: accessToken, refreshToken
  - Errors: 400 (invalid credentials/validation)
- POST /auth/refresh
  - Headers: Cookie: refreshToken=...
  - Body: none
  - Response: 200 { id }, cookies: accessToken, refreshToken
  - Errors: 400 (invalid/expired/revoked token/user not found)
- POST /auth/logout
  - Headers: Authorization: Bearer <access_token>, Cookie: refreshToken=...
  - Body: none
  - Response: 200 { message }
  - Errors: 500 (unexpected)
- GET /auth/self
  - Headers: Authorization: Bearer <access_token>
  - Body: none
  - Response: 200 User object
  - Errors: 401 (unauthorized), 404 (not found)

[No sources needed since this section provides general guidance]