/**
 * Determines media type from file extension or URL
 *
 * @param {string} url - The URL to analyze
 * @returns {string} Media type: 'image', 'video', 'audio', or 'document'
 */
export function detectMediaType(url: string): string;
/**
 * Validates media URL and type against configuration
 *
 * @param {string} url - The URL to validate
 * @param {object} config - Configuration object (optional)
 * @returns {boolean} True if valid
 */
export function validateMedia(url: string, config?: object): boolean;
/**
 * Generates a wiki-formatted media embed
 *
 * @param {object} media - Media information object
 * @param {object} options - Processing options (optional)
 * @returns {string} Wiki-formatted embed string
 */
export function generateWikiEmbed(media: object, options?: object): string;
/**
 * Extracts file extension from URL
 *
 * @param {string} url - The URL to analyze
 * @returns {string} File extension (lowercase)
 */
export function getFileExtension(url: string): string;
/**
 * Generates a safe filename for wiki systems
 *
 * @param {string} originalName - Original filename
 * @returns {string} Safe filename
 */
export function generateSafeFilename(originalName: string): string;
/**
 * Calculates scaled dimensions while maintaining aspect ratio
 *
 * @param {object} original - Original dimensions {width, height}
 * @param {object} constraints - Size constraints {maxWidth?, maxHeight?}
 * @returns {object} Scaled dimensions {width, height}
 */
export function calculateScaledDimensions(original: object, constraints: object): object;
export namespace DEFAULT_CONFIG {
    let allowedTypes: string[];
    let maxFileSize: number;
    let defaultQuality: number;
}
//# sourceMappingURL=utils.d.ts.map