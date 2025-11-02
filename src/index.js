/**
 * @file wiki-your-media - A utility library for working with media in wiki systems
 */import {detectMediaType, validateMedia, generateWikiEmbed} from "./lib/utils.js"

/**
 * Extracts media information from a given URL or file
 *
 * @param {string} source - The URL or file path to analyze
 * @returns {Promise<object | null>} Media information object or null if invalid
 */
export async function getMediaInfo(source) {
  try {
    new URL(source) // Just validate the URL
    const type = detectMediaType(source)

    return {
      url: source,
      type,
    }
  } catch (error) {
    console.warn("Failed to parse media source:", error)

    return null
  }
}

/**
 * Validates if a URL points to a supported media type
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid media URL
 */
export function isValidMediaUrl(url) {
  return validateMedia(url)
}

/**
 * Formats media information for wiki display
 *
 * @param {object} media - Media information object
 * @returns {string} Wiki-formatted embed string
 */
export function formatMediaForWiki(media) {
  return generateWikiEmbed(media)
}

// ==========================================
// INDIVIDUAL EXPORTS - Granular imports
// ==========================================

export {default as MediaWikiUploader} from "./lib/MediaWikiUploader.js"

// ==========================================
// SEMANTIC BUNDLES - Domain-based imports
// ==========================================

export * as WikiSystem from "./bundles/WikiSystem.js"

// Export all utilities
export * from "./lib/utils.js"
