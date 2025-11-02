/**
 * Utility functions for media processing and wiki integration
 */

/**
 * Default configuration for wiki media processing
 */
export const DEFAULT_CONFIG = {
  allowedTypes: ["image", "video", "audio", "document"],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  defaultQuality: 0.8,
}

/**
 * Determines media type from file extension or URL
 *
 * @param {string} url - The URL to analyze
 * @returns {string} Media type: 'image', 'video', 'audio', or 'document'
 */
export function detectMediaType(url) {
  const pathname = url.toLowerCase()

  if(pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/)) {
    return "image"
  } else if(pathname.match(/\.(mp4|webm|avi|mov|mkv|flv|wmv)$/)) {
    return "video"
  } else if(pathname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/)) {
    return "audio"
  }

  return "document"
}

/**
 * Validates media URL and type against configuration
 *
 * @param {string} url - The URL to validate
 * @param {object} config - Configuration object (optional)
 * @returns {boolean} True if valid
 */
export function validateMedia(url, config = DEFAULT_CONFIG) {
  try {
    new URL(url)
  } catch {
    return false
  }

  const mediaType = detectMediaType(url)

  return config.allowedTypes?.includes(mediaType) ?? true
}

/**
 * Generates a wiki-formatted media embed
 *
 * @param {object} media - Media information object
 * @param {object} options - Processing options (optional)
 * @returns {string} Wiki-formatted embed string
 */
export function generateWikiEmbed(media, options = {}) {
  const {url, type, dimensions, metadata} = media
  const title = metadata?.title || "Media"

  switch(type) {
    case "image": {
      let embed = `![${title}](${url}`
      if(dimensions && (options.maxWidth || options.maxHeight)) {
        const width = options.maxWidth && dimensions.width > options.maxWidth
          ? options.maxWidth
          : dimensions.width
        const height = options.maxHeight &&
          dimensions.height > options.maxHeight
          ? options.maxHeight
          : dimensions.height
        embed += ` "${width}x${height}"`
      }

      embed += ")"

      return embed
    }

    case "video":
      return `<video src="${url}" controls title="${title}"></video>`

    case "audio":
      return `<audio src="${url}" controls title="${title}"></audio>`

    default:
      return `[${title}](${url})`
  }
}

/**
 * Extracts file extension from URL
 *
 * @param {string} url - The URL to analyze
 * @returns {string} File extension (lowercase)
 */
export function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname
    const match = pathname.match(/\.([^.]+)$/)

    return match ? match[1].toLowerCase() : ""
  } catch {
    return ""
  }
}

/**
 * Generates a safe filename for wiki systems
 *
 * @param {string} originalName - Original filename
 * @returns {string} Safe filename
 */
export function generateSafeFilename(originalName) {
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

/**
 * Calculates scaled dimensions while maintaining aspect ratio
 *
 * @param {object} original - Original dimensions {width, height}
 * @param {object} constraints - Size constraints {maxWidth?, maxHeight?}
 * @returns {object} Scaled dimensions {width, height}
 */
export function calculateScaledDimensions(original, constraints) {
  let {width, height} = original
  const {maxWidth, maxHeight} = constraints

  if(maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  if(maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  return {width: Math.round(width), height: Math.round(height)}
}
