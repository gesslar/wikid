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
import { Wikid } from '@gesslar/wikid';

const wikid = new Wikid({
  baseUrl: 'https://your-wiki.com',
  botUsername: 'MyBot',
  botPassword: 'bot_password_123',
  private: false
});

// Login (uses credentials from constructor)
await wikid.login();

// Make authenticated API calls
const result = await wikid.post('api.php', {
  action: 'query',
  meta: 'tokens'
});

// Get requests
const pageData = await wikid.get('api.php', {
  action: 'query',
  titles: 'Main Page'
});
```

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

##### `logout()`

End the authenticated session.

##### `post(endpoint, params)`

Make authenticated POST requests to MediaWiki API.

##### `get(endpoint, params)`

Make authenticated GET requests to MediaWiki API.

##### `uploadFile(filePath, options)`

Upload files to MediaWiki with metadata.

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
