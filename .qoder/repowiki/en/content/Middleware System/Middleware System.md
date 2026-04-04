# Middleware System

<cite>
**Referenced Files in This Document**
- [authenticate.js](file://src/middleware/authenticate.js)
- [canAccess.js](file://src/middleware/canAccess.js)
- [parseToken.js](file://src/middleware/parseToken.js)
- [validateRefresh.js](file://src/middleware/validateRefresh.js)
- [auth.routes.js](file://src/routes/auth.routes.js)
- [AuthController.js](file://src/controllers/AuthController.js)
- [config.js](file://src/config/config.js)
- [TokenServices.js](file://src/services/TokenServices.js)
- [RefreshToken.js](file://src/entity/RefreshToken.js)
- [register-validators.js](file://src/validators/register-validators.js)
- [login-validators.js](file://src/validators/login-validators.js)
- [index.js](file://src/constants/index.js)
- [app.js](file://src/app.js)
- [server.js](file://src/server.js)
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
This document explains the middleware system used in the authentication service. It covers:
- Authentication middleware for JWT validation and token extraction from headers and cookies
- Authorization middleware for role-based access control
- Validation middleware for request parameter validation using schema-based validators
- Practical examples of middleware chain processing and custom middleware development
- Middleware order, execution flow, and error propagation
- Performance considerations, caching strategies, and debugging techniques
- Guidelines for extending the middleware system and implementing custom middleware patterns

## Project Structure
The middleware system is organized under the middleware folder and integrated into Express routes and controllers. Supporting configuration, services, and validators are located in dedicated folders.

```mermaid
graph TB
subgraph "Express App"
APP["app.js"]
SRV["server.js"]
end
subgraph "Routes"
AUTH_ROUTES["auth.routes.js"]
end
subgraph "Controllers"
AUTH_CTRL["AuthController.js"]
end
subgraph "Middleware"
AUTH_MW["authenticate.js"]
ACCESS_MW["canAccess.js"]
PARSE_MW["parseToken.js"]
REFRESH_MW["validateRefresh.js"]
end
subgraph "Services"
TOKEN_SVC["TokenServices.js"]
end
subgraph "Config"
CFG["config.js"]
end
subgraph "Validators"
REG_VALID["register-validators.js"]
LOG_VALID["login-validators.js"]
end
SRV --> APP
APP --> AUTH_ROUTES
AUTH_ROUTES --> AUTH_MW
AUTH_ROUTES --> ACCESS_MW
AUTH_ROUTES --> PARSE_MW
AUTH_ROUTES --> REFRESH_MW
AUTH_ROUTES --> REG_VALID
AUTH_ROUTES --> LOG_VALID
AUTH_ROUTES --> AUTH_CTRL
AUTH_CTRL --> TOKEN_SVC
AUTH_MW --> CFG
REFRESH_MW --> CFG
PARSE_MW --> CFG
```

**Diagram sources**
- [app.js:1-40](file://src/app.js#L1-L40)
- [server.js:1-21](file://src/server.js#L1-L21)
- [auth.routes.js:1-49](file://src/routes/auth.routes.js#L1-L49)
- [AuthController.js:1-212](file://src/controllers/AuthController.js#L1-L212)
- [authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)
- [validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [TokenServices.js:1-60](file://src/services/TokenServices.js#L1-L60)
- [config.js:1-34](file://src/config/config.js#L1-L34)
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)

**Section sources**
- [app.js:1-40](file://src/app.js#L1-L40)
- [server.js:1-21](file://src/server.js#L1-L21)

## Core Components
- Authentication middleware: Validates access tokens using RS256 with JWKS-based secret caching and supports token extraction from Authorization header or cookies.
- Authorization middleware: Enforces role-based access control by checking the authenticated user’s role against allowed roles.
- Refresh token parsing middleware: Parses refresh tokens using HS256 from cookies.
- Refresh token validation middleware: Validates refresh tokens against persisted records to detect revocation.
- Request validation middleware: Uses schema-based validators for registration and login endpoints.
- Error handling middleware: Centralized error handler that logs and responds with structured error objects.

**Section sources**
- [authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)
- [validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [app.js:23-37](file://src/app.js#L23-L37)

## Architecture Overview
The middleware system integrates with Express routing and controller actions. Authentication and authorization occur before controller logic, while validation occurs prior to controller invocation. Error handling is centralized.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "auth.routes.js"
participant AuthMW as "authenticate.js"
participant AccessMW as "canAccess.js"
participant Ctrl as "AuthController.js"
Client->>Router : "GET /auth/self"
Router->>AuthMW : "Apply JWT validation"
AuthMW-->>Router : "Attach req.auth (sub, role)"
Router->>Ctrl : "Invoke controller method"
Ctrl-->>Client : "Response with user data"
```

**Diagram sources**
- [auth.routes.js:37-39](file://src/routes/auth.routes.js#L37-L39)
- [authenticate.js:6-25](file://src/middleware/authenticate.js#L6-L25)
- [AuthController.js:138-141](file://src/controllers/AuthController.js#L138-L141)

## Detailed Component Analysis

### Authentication Middleware (JWT Validation)
Purpose:
- Validates access tokens using RS256 with JWKS-based secret caching and rate limiting.
- Extracts tokens from Authorization header or cookies.

Key behaviors:
- Secret source: JWKS URI configured via environment variables with caching enabled.
- Token extraction: Prefers Authorization: Bearer <token>; falls back to cookie accessToken.
- Algorithm: RS256 enforced.

```mermaid
flowchart TD
Start(["Incoming Request"]) --> GetAuth["Get Authorization Header"]
GetAuth --> HasBearer{"Has Bearer Token?"}
HasBearer --> |Yes| UseHeader["Use Bearer Token"]
HasBearer --> |No| GetCookie["Read Cookie 'accessToken'"]
GetCookie --> HasCookie{"Cookie Present?"}
HasCookie --> |Yes| UseCookie["Use Cookie Token"]
HasCookie --> |No| NoToken["No Token Found"]
UseHeader --> Validate["Validate RS256 via JWKS"]
UseCookie --> Validate
Validate --> Valid{"Valid?"}
Valid --> |Yes| AttachAuth["Attach req.auth (sub, role)"]
Valid --> |No| NextErr["Call next(error)"]
AttachAuth --> End(["Proceed to next middleware"])
NoToken --> NextErr
```

**Diagram sources**
- [authenticate.js:6-25](file://src/middleware/authenticate.js#L6-L25)

**Section sources**
- [authenticate.js:1-26](file://src/middleware/authenticate.js#L1-L26)
- [config.js:11-33](file://src/config/config.js#L11-L33)

### Authorization Middleware (Role-Based Access Control)
Purpose:
- Enforces role-based access by comparing the authenticated user’s role with allowed roles.

Key behaviors:
- Reads role from req.auth.role.
- Rejects requests with 403 if role is not included in allowedRoles.
- Calls next() if authorized.

```mermaid
flowchart TD
Start(["Request with req.auth"]) --> ReadRole["Read req.auth.role"]
ReadRole --> Allowed{"Is role in allowedRoles?"}
Allowed --> |Yes| Next["next()"]
Allowed --> |No| Err["Create 403 error and next(error)"]
Next --> End(["Authorized"])
Err --> End
```

**Diagram sources**
- [canAccess.js:4-22](file://src/middleware/canAccess.js#L4-L22)

**Section sources**
- [canAccess.js:1-23](file://src/middleware/canAccess.js#L1-L23)
- [index.js:1-6](file://src/constants/index.js#L1-L6)

### Refresh Token Parsing Middleware
Purpose:
- Parses refresh tokens from cookies using HS256.

Key behaviors:
- Extracts refreshToken from cookies.
- Uses PRIVATE_KEY_SECRET from configuration.

```mermaid
flowchart TD
Start(["Incoming Request"]) --> GetCookie["Read Cookie 'refreshToken'"]
GetCookie --> HasCookie{"Cookie Present?"}
HasCookie --> |Yes| Parse["Parse with HS256"]
HasCookie --> |No| NoToken["No Token Found"]
Parse --> Done(["Parsed Token Available"])
NoToken --> Done
```

**Diagram sources**
- [parseToken.js:4-13](file://src/middleware/parseToken.js#L4-L13)

**Section sources**
- [parseToken.js:1-14](file://src/middleware/parseToken.js#L1-L14)
- [config.js:19-20](file://src/config/config.js#L19-L20)

### Refresh Token Validation Middleware
Purpose:
- Validates refresh tokens against persisted records to detect revocation.

Key behaviors:
- Extracts token from cookies.
- Checks revocation by querying the RefreshToken entity using token ID and user ID.
- Returns revoked if record not found; logs errors on exceptions.

```mermaid
flowchart TD
Start(["Incoming Request"]) --> GetCookie["Read Cookie 'refreshToken'"]
GetCookie --> HasCookie{"Cookie Present?"}
HasCookie --> |No| Revoked["Mark as revoked"]
HasCookie --> |Yes| Find["Find RefreshToken by id and user.id"]
Find --> Found{"Record Found?"}
Found --> |Yes| NotRevoked["Not revoked"]
Found --> |No| Revoked
Revoked --> End(["Return true (revoked)"])
NotRevoked --> End
```

**Diagram sources**
- [validateRefresh.js:7-31](file://src/middleware/validateRefresh.js#L7-L31)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)

**Section sources**
- [validateRefresh.js:1-34](file://src/middleware/validateRefresh.js#L1-L34)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)

### Validation Middleware (Request Parameter Validation)
Purpose:
- Validates request body fields using schema-based validators for registration and login.

Key behaviors:
- Registration validator enforces name/email/password constraints.
- Login validator enforces email/password constraints.
- Validation results are checked in controllers; empty results proceed, otherwise 400 is returned.

```mermaid
flowchart TD
Start(["POST /auth/register"]) --> ApplyReg["Apply register-validators"]
ApplyReg --> ValidReg{"Validation OK?"}
ValidReg --> |Yes| Next["Next middleware/controller"]
ValidReg --> |No| Err["Return 400 with errors"]
Start2(["POST /auth/login"]) --> ApplyLog["Apply login-validators"]
ApplyLog --> ValidLog{"Validation OK?"}
ValidLog --> |Yes| Next
ValidLog --> |No| Err
```

**Diagram sources**
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [AuthController.js:19-26](file://src/controllers/AuthController.js#L19-L26)
- [AuthController.js:72-79](file://src/controllers/AuthController.js#L72-L79)

**Section sources**
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [AuthController.js:19-26](file://src/controllers/AuthController.js#L19-L26)
- [AuthController.js:72-79](file://src/controllers/AuthController.js#L72-L79)

### Middleware Chain Processing Examples
Example 1: GET /auth/self
- Route applies authentication middleware before invoking the controller.
- Controller reads user by req.auth.sub.

Example 2: POST /auth/logout
- Route applies refresh token parsing middleware before invoking the controller.
- Controller deletes refresh token and clears cookies.

Example 3: POST /auth/refresh
- Route applies refresh token validation middleware before invoking the controller.
- Controller rotates tokens and persists new refresh token.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "auth.routes.js"
participant ParseMW as "parseToken.js"
participant Ctrl as "AuthController.js"
Client->>Router : "POST /auth/logout"
Router->>ParseMW : "Parse refresh token"
ParseMW-->>Router : "Attach req.auth (id, role)"
Router->>Ctrl : "Invoke logout"
Ctrl-->>Client : "200 with message"
```

**Diagram sources**
- [auth.routes.js:44-46](file://src/routes/auth.routes.js#L44-L46)
- [parseToken.js:4-13](file://src/middleware/parseToken.js#L4-L13)
- [AuthController.js:194-210](file://src/controllers/AuthController.js#L194-L210)

**Section sources**
- [auth.routes.js:37-46](file://src/routes/auth.routes.js#L37-L46)
- [AuthController.js:138-141](file://src/controllers/AuthController.js#L138-L141)
- [AuthController.js:194-210](file://src/controllers/AuthController.js#L194-L210)

### Custom Middleware Development
Patterns demonstrated in the codebase:
- Higher-order middleware returning a function with signature (req, res, next).
- Using req.auth populated by JWT middleware for downstream decisions.
- Leveraging configuration for secrets and algorithms.
- Integrating with repositories/entities for persistence checks.

Guidelines:
- Keep middleware single-purpose and composable.
- Use configuration for environment-specific values.
- Propagate errors via next(error) to central error handler.
- Attach validated data to req for downstream consumption.

**Section sources**
- [canAccess.js:4-22](file://src/middleware/canAccess.js#L4-L22)
- [config.js:19-33](file://src/config/config.js#L19-L33)
- [validateRefresh.js:14-30](file://src/middleware/validateRefresh.js#L14-L30)

## Dependency Analysis
The middleware system depends on:
- Express for routing and middleware composition
- express-jwt and jwks-rsa for JWT validation and JWKS caching
- http-errors for standardized error creation
- TypeORM entities and repositories for refresh token persistence
- Environment configuration for secrets and URIs

```mermaid
graph LR
AUTH_ROUTES["auth.routes.js"] --> AUTH_MW["authenticate.js"]
AUTH_ROUTES --> ACCESS_MW["canAccess.js"]
AUTH_ROUTES --> PARSE_MW["parseToken.js"]
AUTH_ROUTES --> REFRESH_MW["validateRefresh.js"]
AUTH_ROUTES --> CTRL["AuthController.js"]
AUTH_MW --> CFG["config.js"]
REFRESH_MW --> CFG
PARSE_MW --> CFG
REFRESH_MW --> RT["RefreshToken.js"]
CTRL --> TOKEN_SVC["TokenServices.js"]
```

**Diagram sources**
- [auth.routes.js:12-14](file://src/routes/auth.routes.js#L12-L14)
- [authenticate.js:1-3](file://src/middleware/authenticate.js#L1-L3)
- [validateRefresh.js:1-5](file://src/middleware/validateRefresh.js#L1-L5)
- [parseToken.js:1-2](file://src/middleware/parseToken.js#L1-L2)
- [config.js:19-33](file://src/config/config.js#L19-L33)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [AuthController.js:1-16](file://src/controllers/AuthController.js#L1-L16)
- [TokenServices.js:1-11](file://src/services/TokenServices.js#L1-L11)

**Section sources**
- [auth.routes.js:12-14](file://src/routes/auth.routes.js#L12-L14)
- [authenticate.js:1-3](file://src/middleware/authenticate.js#L1-L3)
- [validateRefresh.js:1-5](file://src/middleware/validateRefresh.js#L1-L5)
- [parseToken.js:1-2](file://src/middleware/parseToken.js#L1-L2)
- [config.js:19-33](file://src/config/config.js#L19-L33)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [AuthController.js:1-16](file://src/controllers/AuthController.js#L1-L16)
- [TokenServices.js:1-11](file://src/services/TokenServices.js#L1-L11)

## Performance Considerations
- JWKS caching: Enabled in authentication middleware to reduce network calls and improve latency.
- Rate limiting: Enabled for JWKS secret retrieval to prevent abuse.
- Algorithm enforcement: RS256 ensures strong cryptographic validation.
- Cookie-based tokens: Reduce header overhead for refresh tokens.
- Centralized error handling: Prevents redundant error handling logic and improves consistency.

Recommendations:
- Monitor JWKS cache hit rates and tune cache settings.
- Consider short-lived access tokens and robust refresh token lifecycle management.
- Add request timeouts and circuit breakers for external dependencies (e.g., JWKS).
- Use structured logging to track middleware execution times.

**Section sources**
- [authenticate.js:7-11](file://src/middleware/authenticate.js#L7-L11)
- [validateRefresh.js:14-30](file://src/middleware/validateRefresh.js#L14-L30)

## Troubleshooting Guide
Common issues and resolutions:
- Missing or malformed Authorization header: Ensure Bearer token is present; fallback to cookie token is supported.
- Role mismatch leading to 403: Verify allowed roles and user role attached to req.auth.
- Revoked refresh token: Confirm token exists in refreshTokens table and is not deleted.
- Validation errors: Inspect validator messages and ensure request body conforms to schema.
- Centralized error response: Review error handler logs and response format.

Debugging tips:
- Log req.auth contents after authentication middleware.
- Enable logging in refresh token validation to capture lookup failures.
- Use structured logs for error tracking and correlation IDs.

**Section sources**
- [app.js:23-37](file://src/app.js#L23-L37)
- [canAccess.js:10-17](file://src/middleware/canAccess.js#L10-L17)
- [validateRefresh.js:14-30](file://src/middleware/validateRefresh.js#L14-L30)
- [AuthController.js:19-26](file://src/controllers/AuthController.js#L19-L26)
- [AuthController.js:72-79](file://src/controllers/AuthController.js#L72-L79)

## Conclusion
The middleware system provides a clear, modular foundation for authentication, authorization, and validation. It leverages industry-standard libraries, centralized configuration, and a consistent error-handling pattern. By following the patterns shown here, developers can extend the system with additional middleware while maintaining performance, security, and maintainability.

## Appendices

### Middleware Order and Execution Flow
Typical flow:
1. Validation middleware runs first to sanitize and validate inputs.
2. Authentication middleware validates the access token and attaches user info.
3. Authorization middleware enforces role-based permissions.
4. Controller handles business logic using req.auth and validated inputs.
5. Centralized error handler standardizes error responses.

```mermaid
flowchart LR
Validators["Validators"] --> Auth["Authenticate"]
Auth --> Access["Authorize"]
Access --> Controller["Controller"]
Controller --> ErrorHandler["Error Handler"]
```

**Diagram sources**
- [register-validators.js:1-47](file://src/validators/register-validators.js#L1-L47)
- [login-validators.js:1-25](file://src/validators/login-validators.js#L1-L25)
- [authenticate.js:6-25](file://src/middleware/authenticate.js#L6-L25)
- [canAccess.js:4-22](file://src/middleware/canAccess.js#L4-L22)
- [app.js:23-37](file://src/app.js#L23-L37)

### Token Generation and Persistence
- Access tokens: RS256 signed with a private key, short-lived.
- Refresh tokens: HS256 signed with a shared secret, persisted in the database, rotated on refresh.

```mermaid
sequenceDiagram
participant Ctrl as "AuthController.js"
participant Svc as "TokenServices.js"
participant Repo as "RefreshToken Repository"
Ctrl->>Svc : "generateAccessToken(payload)"
Svc-->>Ctrl : "accessToken"
Ctrl->>Svc : "persistRefreshToken(user)"
Svc->>Repo : "save({ user })"
Repo-->>Svc : "newRefreshToken"
Svc-->>Ctrl : "refreshToken"
```

**Diagram sources**
- [AuthController.js:42-47](file://src/controllers/AuthController.js#L42-L47)
- [TokenServices.js:12-43](file://src/services/TokenServices.js#L12-L43)
- [TokenServices.js:45-52](file://src/services/TokenServices.js#L45-L52)