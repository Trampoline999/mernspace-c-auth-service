# Auth Service - Bug Fixes and Setup Summary

## Overview
This document details all the fixes and setup steps performed to get the auth-service tests passing successfully.

---

## 1. Database Setup

### Problem
The tests were failing with the following error:
```
Error during Data Source initialization: error: database "mernStack_auth_service" does not exist
```

The PostgreSQL database required by the application didn't exist on the system.

### Database Configuration
The application uses the following database configuration (from `.env.dev`):
- **Database Type:** PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database Name:** mernStack_auth_service
- **Username:** postgres
- **Password:** pass

### Solution
Created the PostgreSQL database using the command:
```bash
PGPASSWORD=pass psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE \"mernStack_auth_service\";"
```

### Verification
Verified the database was created successfully:
```bash
PGPASSWORD=pass psql -h localhost -p 5432 -U postgres -d postgres -c "\l" | grep mernStack_auth_service
```

**Result:**
```
mernStack_auth_service | postgres | UTF8 | libc | en_US.UTF-8 | en_US.UTF-8 | | |
```

---

## 2. Code Bug Fixes

After creating the database, tests were still failing with new errors:
- `Cannot read properties of undefined (reading 'create')`
- Status code 500 instead of expected 201
- No users being created in the database

### Bug #1: AuthController Constructor Syntax Error

**File:** `src/controllers/AuthController.js`

**Problem:**
The constructor had invalid JavaScript syntax using `private:` keyword which doesn't exist in JavaScript:

```javascript
// BEFORE (INCORRECT)
export class AuthController {
  userService;
  logger;
  constructor({ private: userService, private: logger }) {
    this.userService = userService;
    this.logger = logger;
  }
  // ... rest of the code
}
```

This caused `userService` and `logger` to be undefined, leading to the error "Cannot read properties of undefined (reading 'create')".

**Solution:**
Corrected the constructor to use proper object destructuring:

```javascript
// AFTER (CORRECT)
export class AuthController {
  userService;
  logger;
  constructor({ userService, logger }) {
    this.userService = userService;
    this.logger = logger;
  }
  // ... rest of the code
}
```

**Impact:**
- Fixed the dependency injection so `userService` and `logger` are properly assigned
- Resolved the "Cannot read properties of undefined" error

---

### Bug #2: UserService Not Returning Created User

**File:** `src/services/userService.js`

**Problem:**
The `create()` method was saving the user to the database but not returning the created user object:

```javascript
// BEFORE (INCORRECT)
export class UserService {
  async create({ firstName, lastName, email, password }) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save({ firstName, lastName, email, password });
      // Missing return statement!
    } catch(error) {
      const err = createHttpError(500, "failed to store data in the database");
      throw err;
    }
  }
}
```

This caused the `user` variable in `AuthController.register()` to be `undefined`, and when it tried to access `user.id`, it failed silently, resulting in a 500 error.

**Solution:**
Added a return statement to return the created user:

```javascript
// AFTER (CORRECT)
export class UserService {
  async create({ firstName, lastName, email, password }) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.save({ firstName, lastName, email, password });
      return user;  // Now returns the created user
    } catch(error) {
      const err = createHttpError(500, "failed to store data in the database");
      throw err;
    }
  }
}
```

**Impact:**
- The controller can now access `user.id` to return it in the response
- Status code properly returns 201 instead of 500
- User is successfully saved to the database

---

## 3. Test Results

### Before Fixes
```
FAIL  src/test/userRegister/register.spec.js
  POST /auth/register
    Given all test fields
      ✕ should return 200 status code
      ✕ should return json response
      ✕ should return user from database

Test Suites: 1 failed, 1 skipped, 1 of 2 total
Tests:       2 failed, 1 skipped, 1 passed, 4 total
```

### After Fixes
```
PASS  src/test/userRegister/register.spec.js
  POST /auth/register
    Given all test fields
      ✓ should return 200 status code (38 ms)
      ✓ should return json response (12 ms)
      ✓ should return user from database (13 ms)

Test Suites: 1 skipped, 1 passed, 1 of 2 total
Tests:       1 skipped, 3 passed, 4 total
```

---

## 4. Summary of Changes

### Files Modified
1. **Database:** Created `mernStack_auth_service` database in PostgreSQL
2. **src/controllers/AuthController.js:** Fixed constructor parameter destructuring
3. **src/services/userService.js:** Added return statement for created user

### Test Coverage After Fixes
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   89.44 |    88.23 |     100 |   89.44 |                   
 src/controllers    |   88.46 |       80 |     100 |   88.46 |                   
 src/services       |   81.25 |    66.66 |     100 |   81.25 |                   
--------------------|---------|----------|---------|---------|-------------------
```

---

## 5. How the Application Works Now

### User Registration Flow
1. **Request arrives** at `POST /auth/register` with user data
2. **Route handler** (`auth.routes.js`) creates instances of `UserService` and `AuthController`
3. **Controller** (`AuthController.register`) receives the request:
   - Extracts `firstName`, `lastName`, `email`, `password` from request body
   - Calls `userService.create()` with the user data
4. **Service** (`UserService.create`) handles the database operation:
   - Gets the User repository from TypeORM
   - Saves the user to the database
   - Returns the created user object (with auto-generated `id`)
5. **Controller** sends response:
   - Logs success message
   - Returns 201 status with `{ id: user.id }`
6. **Database** persists the user with all fields

### Key Components
- **TypeORM:** ORM for database operations
- **PostgreSQL:** Database storing user data
- **Express:** Web framework handling HTTP requests
- **Jest + Supertest:** Testing framework and HTTP assertions

---

## 6. Next Steps

All tests are now passing successfully. The registration endpoint is fully functional and ready for:
- Additional validation tests (email format, password strength, etc.)
- Duplicate email handling
- Password hashing implementation
- Additional endpoints (login, logout, etc.)
