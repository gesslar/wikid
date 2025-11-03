# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

`@gesslar/wikid` is a MediaWiki authentication library providing bot authentication, session management, and authenticated API calls for MediaWiki. Written in pure ESM (JavaScript modules) with attitude and personality.

## Common Development Commands

### Testing
```bash
# Run tests
npm test

# Run test file directly
node tests/unit/Wikid.test.js
```

### Code Quality
```bash
# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Generate TypeScript declarations
npm run types:build
```

### Publishing
```bash
# Version bumps
npm run patch    # 1.0.0 -> 1.0.1
npm run minor    # 1.0.0 -> 1.1.0
npm run major    # 1.0.0 -> 2.0.0

# Publish to npm (public access)
npm run submit

# Update dependencies
npm run update
```

## Architecture

### Module Structure

Simple, focused package with a single export:

```javascript
import { Wikid } from '@gesslar/wikid'
```

### Key Components

- **`Wikid`** (`src/lib/Wikid.js`)
  - Bot authentication via credentials (not OAuth)
  - Session management with cookie handling
  - GET/POST API methods with automatic auth
  - Private fields pattern (#) for internal state
  - Depends on `@gesslar/toolkit` for validation (Valid) and error handling (Sass)

### Authentication Flow

1. Construct `Wikid` with `baseUrl`, `botUsername`, `botPassword`
2. Call `login()` → fetches login token → authenticates → stores CSRF token
3. Use `post()` or `get()` for authenticated API calls
4. Internal validation prevents API calls before login
5. Call `logout()` to clear session

### Dependencies

- **`@gesslar/toolkit`**: Provides `Data`, `Sass`, `Valid` utilities
- **`node-fetch`**: HTTP client with `Headers` and `FormData`
- Minimum Node.js: 18.0.0

## Code Style

This project uses a custom ESLint configuration with strict stylistic rules:

### Key Style Rules

- **Quotes**: Double quotes (`"`)
- **Semicolons**: Never (automatic semicolon insertion)
- **Indentation**: 2 spaces, no tabs
- **Line length**: 80 characters (warnings for code, ignores for comments/strings)
- **Brace style**: 1TBS (opening brace on same line, closing brace on new line)
- **Spacing**:
  - No space before function parentheses: `function()`
  - Space before blocks: `if() {`
  - No space after control statements: `if()`, `for()`, `while()`
  - Space after keywords: `return value`, `else {`
- **Blank lines**: Required after `if`, `for`, `while`, `switch`, `do` blocks and before `return`
- **Object literals**: No spaces inside braces: `{key: value}`

### JSDoc Requirements

- Required for all public functions and classes
- Must include descriptions
- Must include type annotations for params and returns
- **Never use**: `any`, `*`, bare `[]`, bare `Function`/`Object`
- **Always use**: `unknown`, `Array<Type>`, function signatures

Example:
```javascript
/**
 * Authenticates with MediaWiki API
 *
 * @param {string} username - Bot username
 * @param {string} password - Bot password
 * @returns {Promise<{ok: boolean, error?: Error}>} Result object
 */
```

## Testing Guidelines

### Test Structure

Tests use Node.js built-in test runner (`node:test`). Each test file should:

1. Test normal cases, edge cases, and error scenarios
2. Use descriptive test names
3. Verify error handling

### Essential Edge Cases

Always test:
- `null` and `undefined` inputs
- Empty strings `""`
- Empty arrays `[]` and objects `{}`
- Zero values `0` and negative numbers
- Whitespace-only strings
- Type coercion behavior

### Error Testing Patterns

```javascript
// For methods that throw
await assert.rejects(
  () => method("bad input"),
  /expected error message/
)

// For methods that return error objects
const result = await method("bad input")
assert.equal(result.ok, false)
assert.ok(result.error)
```

## Adding New Features

Follow the workflow documented in `WIRE_UP_AND_TESTING.md`:

1. **Validate logic** - Check edge cases, type handling, error boundaries
2. **Wire up exports** - Add to `src/index.js`
3. **Keep types in sync** - Run `npm run types:build` to regenerate `.d.ts` files
4. **Write comprehensive tests** - Create `tests/unit/YourClass.test.js`
5. **Run quality checks**: `npm run lint && npm test`

### Type Generation

TypeScript declarations are **generated** from JSDoc comments using `tsc --allowJs`. Do NOT hand-edit files in `src/types/`. Instead:

1. Update JSDoc in source files
2. Run `npm run types:build`
3. Verify output in `src/types/`

## MediaWiki Bot Credentials

This library uses **bot passwords**, not OAuth. To create bot credentials:

1. Log into MediaWiki
2. Go to Special:BotPasswords
3. Create a new bot with required permissions
4. Use the generated username (e.g., `MyBot`) and password

**Never commit credentials to the repository.**

## Project Philosophy

This package has personality (inspired by Salt-N-Pepa). The code should be:
- Robust with thorough validation
- Well-documented with meaningful error messages
- Tested against edge cases
- Consistent with the toolkit's patterns

See `WIRE_UP_AND_TESTING.md` for the full testing philosophy: "Good tests are like good sass - they catch problems early and give you attitude when something's wrong."
