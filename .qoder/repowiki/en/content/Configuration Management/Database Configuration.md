# Database Configuration

<cite>
**Referenced Files in This Document**
- [data-source.js](file://src/config/data-source.js)
- [config.js](file://src/config/config.js)
- [logger.js](file://src/config/logger.js)
- [server.js](file://src/server.js)
- [User.js](file://src/entity/User.js)
- [RefreshToken.js](file://src/entity/RefreshToken.js)
- [Tenants.js](file://src/entity/Tenants.js)
- [1773479637906-migration.js](file://src/migration/1773479637906-migration.js)
- [1773660957544-rename_tables.js](file://src/migration/1773660957544-rename_tables.js)
- [1773678089909-create_tenant_table.js](file://src/migration/1773678089909-create_tenant_table.js)
- [1773678973384-add_FK_tenant_table_and_to_user_table.js](file://src/migration/1773678973384-add_FK_tenant_table_and_to_user_table.js)
- [1773681570855-add_nullable_field_to_tenantID.js](file://src/migration/1773681570855-add_nullable_field_to_tenantID.js)
- [package.json](file://package.json)
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
This document explains how the authentication service configures and manages its database using TypeORM. It covers DataSource initialization, connection parameters, entity registration, migrations, logging, and operational guidance for PostgreSQL connectivity, including SSL considerations and connection string formatting. It also documents entity relationships, schema management, and practical troubleshooting steps.

## Project Structure
The database configuration centers around a single DataSource instance that loads environment variables, registers entities, and configures migrations. The server initializes the DataSource at startup and starts the Express application upon successful connection.

```mermaid
graph TB
subgraph "Config"
CFG["Config module<br/>loads environment per NODE_ENV"]
DS["DataSource<br/>TypeORM configuration"]
LOG["Logger<br/>Winston transport setup"]
end
subgraph "Entities"
U["User entity"]
RT["RefreshToken entity"]
T["Tenant entity"]
end
subgraph "Migrations"
M1["Initial migration"]
M2["Rename tables"]
M3["Create tenant table"]
M4["Add FKs"]
M5["Nullable tenantId"]
end
subgraph "Runtime"
SRV["Server<br/>initializes DataSource"]
APP["Express app"]
end
CFG --> DS
DS --> U
DS --> RT
DS --> T
DS --> M1
DS --> M2
DS --> M3
DS --> M4
DS --> M5
SRV --> DS
SRV --> APP
LOG --> SRV
```

**Diagram sources**
- [data-source.js:1-22](file://src/config/data-source.js#L1-L22)
- [config.js:1-34](file://src/config/config.js#L1-L34)
- [logger.js:1-42](file://src/config/logger.js#L1-L42)
- [server.js:1-21](file://src/server.js#L1-L21)
- [User.js:1-50](file://src/entity/User.js#L1-L50)
- [RefreshToken.js:1-35](file://src/entity/RefreshToken.js#L1-L35)
- [Tenants.js:1-29](file://src/entity/Tenants.js#L1-L29)
- [1773479637906-migration.js:1-34](file://src/migration/1773479637906-migration.js#L1-L34)
- [1773660957544-rename_tables.js:1-31](file://src/migration/1773660957544-rename_tables.js#L1-L31)
- [1773678089909-create_tenant_table.js:1-31](file://src/migration/1773678089909-create_tenant_table.js#L1-L31)
- [1773678973384-add_FK_tenant_table_and_to_user_table.js:1-39](file://src/migration/1773678973384-add_FK_tenant_table_and_to_user_table.js#L1-L39)
- [1773681570855-add_nullable_field_to_tenantID.js:1-31](file://src/migration/1773681570855-add_nullable_field_to_tenantID.js#L1-L31)

**Section sources**
- [data-source.js:1-22](file://src/config/data-source.js#L1-L22)
- [config.js:1-34](file://src/config/config.js#L1-L34)
- [server.js:1-21](file://src/server.js#L1-L21)

## Core Components
- DataSource configuration
  - Type: PostgreSQL
  - Host, port, username, password, database loaded from environment
  - Entities registered: User, RefreshToken, Tenant
  - Migrations enabled except in test environment
  - Synchronize enabled only in dev/test environments
  - Logging disabled
- Environment configuration
  - Dotenv loads environment-specific files based on NODE_ENV
  - Exposes DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, and other runtime settings
- Server lifecycle
  - Initializes DataSource during startup
  - Starts Express app after successful connection
- Logger
  - Winston-based logging with file and console transports
  - Conditional silencing in prod

**Section sources**
- [data-source.js:8-22](file://src/config/data-source.js#L8-L22)
- [config.js:7-33](file://src/config/config.js#L7-L33)
- [server.js:7-19](file://src/server.js#L7-L19)
- [logger.js:4-39](file://src/config/logger.js#L4-L39)

## Architecture Overview
The runtime initializes the database connection before serving requests. TypeORM manages entity synchronization and migrations according to environment settings.

```mermaid
sequenceDiagram
participant Proc as "Process"
participant Server as "Server"
participant DS as "DataSource"
participant DB as "PostgreSQL"
Proc->>Server : "Start"
Server->>DS : "initialize()"
DS->>DB : "Connect using configured params"
DB-->>DS : "Connection OK"
DS-->>Server : "Initialization success"
Server-->>Proc : "Ready to serve"
```

**Diagram sources**
- [server.js:9-10](file://src/server.js#L9-L10)
- [data-source.js:8-22](file://src/config/data-source.js#L8-L22)

## Detailed Component Analysis

### DataSource Configuration
- Connection parameters
  - type: postgres
  - host, port, username, password, database resolved from environment
- Pool and retry
  - No explicit pool or retry configuration is set in the DataSource
- Entities
  - Registered: User, RefreshToken, Tenant
- Migrations
  - Enabled for non-test environments
- Logging
  - Disabled
- Synchronize
  - Enabled only for test/dev environments

Operational implications:
- In production-like environments, synchronize should remain disabled to avoid unintended schema alterations.
- Migrations are managed via scripts defined in package.json.

**Section sources**
- [data-source.js:8-22](file://src/config/data-source.js#L8-L22)
- [package.json:11-13](file://package.json#L11-L13)

### Environment Configuration
- Dotenv loads environment-specific files based on NODE_ENV
- Exposes database and application settings for runtime consumption

**Section sources**
- [config.js:7-33](file://src/config/config.js#L7-L33)

### Entity Relationship Model
The entities define a many-to-one relationship between User and Tenant, and a one-to-many relationship between User and RefreshToken.

```mermaid
erDiagram
USERS {
int id PK
varchar firstName
varchar lastName
varchar email UK
varchar password
varchar role
int tenantId
}
REFRESH_TOKENS {
int id PK
int userId FK
timestamp createdAt
timestamp updatedAt
}
TENANTS {
int id PK
varchar name
varchar address
}
USERS ||--o{ REFRESH_TOKENS : "has many"
TENANTS ||--o{ USERS : "has many"
```

**Diagram sources**
- [User.js:3-49](file://src/entity/User.js#L3-L49)
- [RefreshToken.js:3-34](file://src/entity/RefreshToken.js#L3-L34)
- [Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)

**Section sources**
- [User.js:3-49](file://src/entity/User.js#L3-L49)
- [RefreshToken.js:3-34](file://src/entity/RefreshToken.js#L3-L34)
- [Tenants.js:3-28](file://src/entity/Tenants.js#L3-L28)

### Migration History and Schema Management
The migration suite evolves the schema from an initial users/refresh tokens setup to a multi-tenant model with foreign keys and nullable tenant associations.

```mermaid
flowchart TD
A["Initial migration<br/>users + refresh tokens"] --> B["Rename tables<br/>adjust FKs"]
B --> C["Create tenants table<br/>add tenantId to users"]
C --> D["Add FK constraints<br/>rename userId -> tenantId"]
D --> E["Make tenantId nullable<br/>final schema"]
```

**Diagram sources**
- [1773479637906-migration.js:16-32](file://src/migration/1773479637906-migration.js#L16-L32)
- [1773660957544-rename_tables.js:16-29](file://src/migration/1773660957544-rename_tables.js#L16-L29)
- [1773678089909-create_tenant_table.js:16-29](file://src/migration/1773678089909-create_tenant_table.js#L16-L29)
- [1773678973384-add_FK_tenant_table_and_to_user_table.js:16-37](file://src/migration/1773678973384-add_FK_tenant_table_and_to_user_table.js#L16-L37)
- [1773681570855-add_nullable_field_to_tenantID.js:16-29](file://src/migration/1773681570855-add_nullable_field_to_tenantID.js#L16-L29)

**Section sources**
- [1773479637906-migration.js:10-33](file://src/migration/1773479637906-migration.js#L10-L33)
- [1773660957544-rename_tables.js:10-30](file://src/migration/1773660957544-rename_tables.js#L10-L30)
- [1773678089909-create_tenant_table.js:10-30](file://src/migration/1773678089909-create_tenant_table.js#L10-L30)
- [1773678973384-add_FK_tenant_table_and_to_user_table.js:10-38](file://src/migration/1773678973384-add_FK_tenant_table_and_to_user_table.js#L10-L38)
- [1773681570855-add_nullable_field_to_tenantID.js:10-30](file://src/migration/1773681570855-add_nullable_field_to_tenantID.js#L10-L30)

### Connection Management and Lifecycle
- Initialization occurs at server startup
- On success, the server listens on the configured port
- On failure, the process exits with a non-zero code

```mermaid
sequenceDiagram
participant Boot as "Bootstrap"
participant DS as "DataSource"
participant Net as "Network"
Boot->>DS : "initialize()"
DS-->>Boot : "OK or error"
Boot->>Net : "listen(PORT)"
Net-->>Boot : "ready"
```

**Diagram sources**
- [server.js:7-19](file://src/server.js#L7-L19)
- [data-source.js:8-22](file://src/config/data-source.js#L8-L22)

**Section sources**
- [server.js:7-19](file://src/server.js#L7-L19)

## Dependency Analysis
- DataSource depends on:
  - Environment configuration for connection parameters
  - Entity definitions for schema mapping
  - Migration scripts for schema evolution
- Server depends on DataSource for database readiness
- Logger integrates with server lifecycle for diagnostics

```mermaid
graph LR
CFG["Config"] --> DS["DataSource"]
ENT1["User"] --> DS
ENT2["RefreshToken"] --> DS
ENT3["Tenant"] --> DS
MIG["Migrations"] --> DS
DS --> SRV["Server"]
SRV --> APP["Express App"]
LOG["Logger"] --> SRV
```

**Diagram sources**
- [data-source.js:3-6](file://src/config/data-source.js#L3-L6)
- [config.js:23-33](file://src/config/config.js#L23-L33)
- [server.js:5](file://src/server.js#L5)
- [logger.js:1-42](file://src/config/logger.js#L1-L42)

**Section sources**
- [data-source.js:3-6](file://src/config/data-source.js#L3-L6)
- [config.js:23-33](file://src/config/config.js#L23-L33)
- [server.js:5](file://src/server.js#L5)
- [logger.js:1-42](file://src/config/logger.js#L1-L42)

## Performance Considerations
- Disable synchronize in production to prevent automatic schema changes.
- Keep logging disabled in production to reduce overhead.
- Consider adding connection pooling and retry policies if throughput increases; these are not currently configured in the DataSource.
- Monitor migration execution in CI/CD to ensure schema updates are applied consistently.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and remedies:
- Connection failures
  - Verify environment variables for host, port, username, password, and database name.
  - Confirm the database is reachable from the service container/host.
  - For local development, ensure the database is running and accepts connections.
- Authentication errors
  - Validate credentials and database user permissions.
  - Check for typos in environment files.
- Migration errors
  - Run migrations explicitly using the provided scripts.
  - Review migration logs for failing SQL statements.
- Logging and diagnostics
  - Use Winston transports to capture errors and info.
  - Adjust log levels and destinations as needed.

**Section sources**
- [config.js:7-33](file://src/config/config.js#L7-L33)
- [logger.js:4-39](file://src/config/logger.js#L4-L39)
- [package.json:11-13](file://package.json#L11-L13)

## Conclusion
The authentication service uses a minimal, environment-driven TypeORM configuration to connect to PostgreSQL. DataSource centralizes connection parameters, entity registration, and migrations. The server initializes the database at startup and serves requests upon successful connection. For production, keep synchronize off, manage migrations explicitly, and monitor logs for operational insights.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### PostgreSQL Connection String Formatting
- Connection string format for PostgreSQL typically follows:
  - postgresql://user:password@host:port/dbname
- When using environment variables, construct the connection string from:
  - DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
- SSL considerations
  - Enable SSL mode in the connection string or driver configuration when connecting to managed databases.
  - Provide CA certificates if required by the provider.
  - Prefer TLS-enabled connections in production environments.

[No sources needed since this section provides general guidance]

### Migration Execution Examples
- Generate a new migration:
  - Use the migration generation script defined in package.json.
- Run pending migrations:
  - Use the migration run script defined in package.json.
- Create an empty migration template:
  - Use the migration create script defined in package.json.

**Section sources**
- [package.json:11-13](file://package.json#L11-L13)