# @gesslar/wiki-your-media

> If Salt'n'Pepa wrote a MediaWiki auth and util package in Node.js

A MediaWiki authentication and utility library with personality. Provides bot authentication, session management, and media utilities for MediaWiki APIs.

## Installation

```bash
npm install @gesslar/wiki-your-media
```

## Usage

### MediaWiki Authentication & Bot Operations

```javascript
import { MediaWikiUploader } from '@gesslar/wiki-your-media';

const uploader = new MediaWikiUploader({
  baseUrl: 'https://your-wiki.com',
  botUsername: 'MyBot',
  botPassword: 'bot_password_123',
  private: false
});

// Login (uses credentials from constructor)
await uploader.login();

// Make authenticated API calls
const result = await uploader.post('api.php', {
  action: 'query',
  meta: 'tokens'
});

// Get requests
const pageData = await uploader.get('api.php', {
  action: 'query',
  titles: 'Main Page'
});
```

### Media Utilities

```javascript
import { detectMediaType, validateMedia, generateWikiEmbed } from '@gesslar/wiki-your-media';

// Detect media type from filename
const type = detectMediaType('video.mp4'); // 'video'

// Validate media files
const isValid = validateMedia('image.jpg'); // true

// Generate wiki markup
const embed = generateWikiEmbed('MyFile.jpg', 'Image caption');
// Returns: [[File:MyFile.jpg|thumb|Image caption]]
```

### Semantic Bundle Import

```javascript
// Import everything through semantic bundles
import { WikiSystem } from '@gesslar/wiki-your-media';

const { MediaWikiUploader, detectMediaType } = WikiSystem;
```

## API Reference

### MediaWikiUploader

#### Constructor

```javascript
new MediaWikiUploader(options)
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

### Utility Functions

#### `detectMediaType(filename)`

Detect media type from file extension.

- Returns: `'image' | 'video' | 'audio' | 'document'`

#### `validateMedia(filename)`

Validate if file is supported media type.

- Returns: `boolean`

#### `generateWikiEmbed(filename, caption, options)`

Generate MediaWiki markup for file embeds.

- Returns: `string` - Wiki markup

## Supported Media Types

- **Images**: jpg, jpeg, png, gif, webp, svg, bmp, tiff, ico
- **Videos**: mp4, webm, avi, mov, mkv, flv, wmv, m4v
- **Audio**: mp3, wav, ogg, m4a, aac, flac, wma
- **Documents**: pdf, doc, docx, txt, and others

## Development

```bash
# Run tests
node tests/unit/MediaWikiUploader.test.js && node tests/unit/utils.test.js

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

## License

Unlicense
