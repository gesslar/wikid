# @gesslar/wikid

> If Salt'n'Pepa wrote a MediaWiki auth package in Node.js

A MediaWiki authentication library with personality. Provides bot authentication, session management, and authenticated API calls for MediaWiki.

**ESM only. Requires Node.js 20+**

## Installation

```bash
npm install @gesslar/wikid
```

## Usage

### MediaWiki Authentication & Bot Operations

```javascript
import Wikid from '@gesslar/wikid';

const wikid = new Wikid({
  baseUrl: 'https://your-wiki.com',
  botUsername: 'MyBot',
  botPassword: 'bot_password_123',
  private: false
});

// Login (uses credentials from constructor)
await wikid.login();

// Make authenticated POST requests
const result = await wikid.post('api.php', {
  action: 'edit',
  title: 'Page Title',
  text: 'Page content',
  summary: 'Edit summary'
});

// Make GET requests
const pageData = await wikid.get('api.php', {
  action: 'query',
  titles: 'Main Page',
  prop: 'revisions',
  rvprop: 'content'
});

// Logout when done
wikid.logout();
```

## Features

- **Bot authentication** with MediaWiki bot passwords
- **Automatic token management** - CSRF tokens are fetched once and cached
- **Cookie-based session handling** - Sessions persist across requests
- **Private wiki support** - Optional authentication for read operations
- **Clean error handling** - Returns structured error objects
- **ESM-only** - Modern JavaScript modules

## API Reference

### Wikid

#### Constructor

```javascript
new Wikid(options)
```

- **options.baseUrl** `string` - Base URL of MediaWiki instance (e.g., `https://wiki.example.com`)
- **options.botUsername** `string` - Bot account username
- **options.botPassword** `string` - Bot account password
- **options.private** `boolean` - Whether wiki requires auth for reads (default: false)

#### Methods

##### `login()`

Authenticate with MediaWiki using credentials from constructor.

**Returns:** `Promise<{ok: boolean, error?: Error}>`

```javascript
const result = await wikid.login();
if (!result.ok) {
  console.error('Login failed:', result.error);
}
```

##### `logout()`

Clear authentication state and end the session. Safe to call multiple times.

```javascript
wikid.logout();
```

##### `post(path, data)`

Make authenticated POST requests to MediaWiki API. Automatically handles token management.

**Parameters:**
- `path` (string) - API endpoint path (usually `'api.php'`)
- `data` (object) - Request parameters as plain object

**Returns:** `Promise<object>` - Parsed JSON response from MediaWiki

```javascript
const response = await wikid.post('api.php', {
  action: 'edit',
  title: 'Test Page',
  text: 'Content',
  summary: 'Edit summary'
});
```

**Automatic Token Management:**
- CSRF tokens are automatically fetched and cached during login
- Tokens are reused for all subsequent requests
- Different token types (csrf, patrol, rollback, etc.) are handled automatically based on the action

##### `get(path, params)`

Make GET requests to MediaWiki API.

**Parameters:**
- `path` (string) - API endpoint path (usually `'api.php'`)
- `params` (object, optional) - Query parameters as plain object

**Returns:** `Promise<object>` - Parsed JSON response from MediaWiki

```javascript
const response = await wikid.get('api.php', {
  action: 'query',
  titles: 'Main Page',
  prop: 'revisions',
  rvprop: 'content'
});
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Build TypeScript declarations
npm run types:build
```

## Dependencies

- **[@gesslar/toolkit](https://github.com/gesslar/toolkit)** - Validation, error handling with sass
- **node-fetch** - HTTP requests

## ~~License~~

Unlicense
