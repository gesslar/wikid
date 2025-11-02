/**
 * Extracts media information from a given URL or file
 *
 * @param {string} source - The URL or file path to analyze
 * @returns {Promise<object | null>} Media information object or null if invalid
 */
export function getMediaInfo(source: string): Promise<object | null>;
/**
 * Validates if a URL points to a supported media type
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid media URL
 */
export function isValidMediaUrl(url: string): boolean;
/**
 * Formats media information for wiki display
 *
 * @param {object} media - Media information object
 * @returns {string} Wiki-formatted embed string
 */
export function formatMediaForWiki(media: object): string;
export { default as MediaWikiUploader } from "./lib/MediaWikiUploader.js";
export * as WikiSystem from "./bundles/WikiSystem.js";
export * from "./lib/utils.js";
//# sourceMappingURL=index.d.ts.map