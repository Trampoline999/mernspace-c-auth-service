```markdown
# mernspace-c-auth-service Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the development patterns, coding conventions, and workflows used in the `mernspace-c-auth-service` repository. The project is a JavaScript-based authentication service, with no specific framework detected. It follows conventional commit messages, uses camelCase for file naming, and mixes default and named exports. Testing files follow the `*.test.*` pattern, though the testing framework is unspecified.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userController.js`, `authRoutes.js`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```js
    const userService = require('./userService');
    ```

### Export Style
- Both **default** and **named exports** are used.
  - Default export example:
    ```js
    module.exports = authController;
    ```
  - Named export example:
    ```js
    module.exports = { login, register };
    ```

### Commit Messages
- Use **conventional commits** with the `fix` prefix for bug fixes.
  - Example:
    ```
    fix: handle missing token in authentication middleware
    ```

## Workflows

### Bug Fixing
**Trigger:** When you need to fix a bug in the codebase  
**Command:** `/fix-bug`

1. Identify the bug and its cause.
2. Create a new branch for your fix.
3. Make code changes following the coding conventions.
4. Write or update tests as needed.
5. Commit your changes using a conventional commit message with the `fix` prefix.
   - Example: `fix: correct password hashing logic in user model`
6. Push your branch and open a pull request.

### Writing Tests
**Trigger:** When adding new features or fixing bugs  
**Command:** `/write-test`

1. Create a new test file following the `*.test.*` pattern.
   - Example: `authController.test.js`
2. Write tests for your feature or bug fix.
3. Run the tests using the project's test runner (framework unspecified).
4. Ensure all tests pass before committing.

## Testing Patterns

- Test files are named using the `*.test.*` pattern.
  - Example: `userService.test.js`
- Place test files alongside the modules they test or in a dedicated test directory.
- The testing framework is not specified; check the project or use a common JS testing tool (e.g., Jest, Mocha).

**Example test file:**
```js
// userService.test.js
const userService = require('./userService');

test('should create a new user', () => {
  // test logic here
});
```

## Commands
| Command      | Purpose                                   |
|--------------|-------------------------------------------|
| /fix-bug     | Start the bug fixing workflow             |
| /write-test  | Start the workflow for writing new tests  |
```