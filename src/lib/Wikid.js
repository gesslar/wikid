/**
 * Wikid - MediaWiki API Client for Bot Operations
 *
 * A comprehensive MediaWiki client that handles authentication,
 * session management, and API interactions for bot operations.
 *
 * @example
 * ```javascript
 * const wikid = new Wikid({
 *   baseUrl: "https://wiki.example.com",
 *   botUsername: "MyBot",
 *   botPassword: "password123",
 *   private: false
 * })
 *
 * await wikid.login()
 * const response = await wikid.post("api.php", {
 *   action: "edit",
 *   title: "Test Page",
 *   text: "Hello World"
 * })
 * ```
 */

import {Data, Sass, Valid} from "@gesslar/toolkit"
import fetch, {Headers,FormData} from "node-fetch"

const METHODS = Object.freeze({
  POST: "POST",
  GET: "GET",
})

export default class Wikid {
  #baseUrl
  #botUsername
  #botPassword
  #cookies = []
  #tokenCache = new Map()
  #private
  #overrideLoginCheck

  /**
   * Create a new Wikid instance
   *
   * @param {object} options - Configuration options
   * @param {string} options.baseUrl - Base URL of the MediaWiki instance
   * @param {string} options.botUsername - Bot username for authentication
   * @param {string} options.botPassword - Bot password for authentication
   * @param {boolean} [options.private] - Whether this is a private wiki requiring auth for reads
   */
  constructor(options = {}) {
    const {
      baseUrl,botUsername,botPassword,private: privateWiki=false
    } = options || {}
    this.#baseUrl = baseUrl
    this.#botUsername = botUsername
    this.#botPassword = botPassword
    this.#private = privateWiki
  }

  /**
   * Authenticate with MediaWiki and obtain session tokens
   *
   * @returns {Promise<{ok: boolean, error?: Error}>} Result object
   * @throws {Error} When authentication fails or credentials are invalid
   */
  async login() {
    try {
      this.#validate()

      const loginToken = await this.#getLoginToken()

      const json = await this.post(
        "api.php",
        {
          action: "login",
          lgname: this.#botUsername,
          lgpassword: this.#botPassword,
          lgtoken: loginToken,
          format: "json",
        }
      )

      const result = json?.login?.result
      Valid.assert(
        !!result,
        `Unexpected login response structure: ${JSON.stringify(result)}`
      )

      Valid.assert(
        result === "Success",
        `Login failed: ${json.login?.reason || "Unknown error"}`
      )

      // Pre-fetch and cache CSRF token
      await this.#getCsrfToken()

      return {ok: true}
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }

  /**
   * Get or fetch a token of specified type
   *
   * @param {string} [type] - Token type (login, watch, patrol, etc.) Defaults to csrf
   * @param {boolean} [useOverride] - Whether to use login check override
   * @private
   * @returns {Promise<string>} Token value
   */
  async #getToken(type="csrf", useOverride=false) {
    // Check cache first
    if(this.#tokenCache.has(type))
      return this.#tokenCache.get(type)

    try {
      if(useOverride)
        this.#overrideLoginCheck = Symbol(`${type} token fetch`)

      const params = {
        action: "query",
        meta: "tokens",
        format: "json"
      }

      // Add type param if not csrf (csrf is default)
      if(type !== "csrf")
        params.type = type

      const json = await this.get(
        "api.php",
        params,
        useOverride ? this.#overrideLoginCheck : null
      )

      // Token key format: "logintok" + "en" = logintoken, "csrf" + "token" = csrftoken
      const tokenKey = type === "csrf" ? "csrftoken" : `${type}token`
      const token = json?.query?.tokens?.[tokenKey]

      Valid.assert(
        !!token,
        `Unexpected ${type} token response structure: ${JSON.stringify(json)}`
      )

      // Cache the token
      this.#tokenCache.set(type, token)

      return token
    } catch (error) {
      throw Sass.new(`Error fetching ${type} token.`, error)
    }
  }

  /**
   * Retrieve login token from MediaWiki API
   *
   * @private
   * @returns {Promise<string>} Login token
   */
  async #getLoginToken() {
    return await this.#getToken("login", true)
  }

  /**
   * Retrieve CSRF token for editing operations
   *
   * @private
   * @returns {Promise<string>} CSRF token
   */
  async #getCsrfToken() {
    return await this.#getToken("csrf", true)
  }

  /**
   * Validate required configuration before operations
   *
   * @param {symbol} [override] - Internal override for token fetch
   * @private
   * @throws {Error} When required configuration is missing
   */
  #validate(override=null) {
    if(this.#overrideLoginCheck === override)
      return

    Valid.assert(!!this.#baseUrl, "Missing baseUrl.")
    Valid.assert(!!this.#botUsername, "Missing botUsername.")
    Valid.assert(!!this.#botPassword, "Missing botPassword.")
  }

  /**
   * Validate authentication state before authenticated operations
   *
   * @param {symbol} [override] - Internal override for token fetch
   * @private
   * @throws {Error} When not properly authenticated
   */
  #validateAfterLogin(override) {
    if(this.#overrideLoginCheck === override)
      return

    Valid.assert(this.#tokenCache.has("login"), "Not logged in.")
    Valid.assert(this.#cookies.length > 0, "Not logged in.")
  }

  /**
   * Clear authentication state and logout
   */
  logout() {
    // Clear cookies and token cache
    this.#cookies = []
    this.#tokenCache.clear()
  }

  /**
   * Perform POST request to MediaWiki API
   *
   * @param {string} path - API endpoint path
   * @param {object} data - Form data to send
   * @returns {Promise<Response>} Fetch response object
   * @throws {Error} When request fails or data is invalid
   */
  async post(path, data) {
    this.#validate()

    Valid.assert(Data.isPlainObject(data), "Invalid data format. Use plain object.")

    const url = new URL(path, this.#baseUrl)
    const method = METHODS.POST
    const headers = this.#getHeaders()

    const body = new FormData()
    for(const [k,v] of Object.entries(data)) {
      switch(Data.typeOf(v)) {
        case "Blob":
          body.append(k, v)
          break

        case "FileObject": {
          const content = await v.read(null)
          const blob = new Blob([content])
          body.append(k, blob, v.name)
          break
        }

        default:
          body.append(k, String(v))
          break
      }
    }

    // Determine token type from action
    // Most actions use their name as token type, but common write actions use csrf
    const action = data.action
    const csrfActions = ["edit", "upload", "move", "delete", "protect", "undelete", "block", "unblock", "rollback", "login"]
    const tokenType = csrfActions.includes(action) ? "csrf" : action

    // Get token (will use cache if available)
    const token = await this.#getToken(tokenType)
    body.delete("token")
    body.append("token", token)

    const response = await fetch(url, {method,headers,body})

    const {ok,status,statusText} = response
    Valid.assert(ok, `HTTP error! status: ${status} - ${statusText}`)
    this.#updateCookies(response.headers)

    return await response.json()
  }

  /**
   * Perform GET request to MediaWiki API
   *
   * @param {string} path - API endpoint path
   * @param {object} [params] - Query parameters object
   * @param {symbol} [override] - Internal override for CSRF token fetch
   * @returns {Promise<Response>} Fetch response object
   * @throws {Error} When request fails
   */
  async get(path, params=null, override=null) {
    this.#validate()

    this.#private && this.#validateAfterLogin(override)
    this.#overrideLoginCheck = null

    const url = new URL(path, this.#baseUrl)

    // Add query parameters if params is an object
    if(Data.isPlainObject(params)) {
      for(const [k,v] of Object.entries(params)) {
        url.searchParams.append(k, String(v))
      }
    }

    const method = METHODS.GET
    const headers = this.#getHeaders()
    const response = await fetch(url, {method,headers})

    const {ok,status,statusText} = response

    Valid.assert(ok, `HTTP error! status: ${status} - ${statusText}`)

    this.#updateCookies(response.headers)

    return await response.json()
  }

  /**
   * Update cookie store from response headers
   *
   * @private
   * @param {Headers} headers - Response headers containing cookies
   */
  #updateCookies(headers) {
    const newCookies = headers.get("set-cookie")

    if(newCookies)
      // Split multiple cookies and add them to our cookie store
      this.#cookies = newCookies.split(",").map(cookie => cookie.split(";")[0].trim())
  }

  /**
   * Get request headers including authentication cookies
   *
   * @private
   * @returns {Headers} Headers object with cookies
   */
  #getHeaders() {
    const headers = new Headers()

    if(this.#cookies.length > 0)
      headers.set("Cookie", this.#cookies.join("; "))

    return headers
  }
}
