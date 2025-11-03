export default class Wikid {
    /**
     * Create a new Wikid instance
     *
     * @param {object} options - Configuration options
     * @param {string} options.baseUrl - Base URL of the MediaWiki instance
     * @param {string} options.botUsername - Bot username for authentication
     * @param {string} options.botPassword - Bot password for authentication
     * @param {boolean} [options.private] - Whether this is a private wiki requiring auth for reads
     */
    constructor(options?: {
        baseUrl: string;
        botUsername: string;
        botPassword: string;
        private?: boolean;
    });
    /**
     * Authenticate with MediaWiki and obtain session tokens
     *
     * @returns {Promise<{ok: boolean, error?: Error}>} Result object
     * @throws {Error} When authentication fails or credentials are invalid
     */
    login(): Promise<{
        ok: boolean;
        error?: Error;
    }>;
    /**
     * Clear authentication state and logout
     */
    logout(): void;
    /**
     * Perform POST request to MediaWiki API
     *
     * @param {string} path - API endpoint path
     * @param {object} data - Form data to send
     * @returns {Promise<Response>} Fetch response object
     * @throws {Error} When request fails or data is invalid
     */
    post(path: string, data: object): Promise<Response>;
    /**
     * Perform GET request to MediaWiki API
     *
     * @param {string} path - API endpoint path
     * @param {object} [params] - Query parameters object
     * @param {symbol} [override] - Internal override for CSRF token fetch
     * @returns {Promise<Response>} Fetch response object
     * @throws {Error} When request fails
     */
    get(path: string, params?: object, override?: symbol): Promise<Response>;
    #private;
}
//# sourceMappingURL=Wikid.d.ts.map