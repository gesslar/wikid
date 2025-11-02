/**
 * MediaWiki API Client for Bot Operations
 *
 * A comprehensive MediaWiki uploader that handles authentication,
 * session management, and API interactions for bot operations.
 *
 * @example
 * ```javascript
 * const uploader = new MediaWikiUploader({
 *   baseUrl: "https://wiki.example.com",
 *   botUsername: "MyBot",
 *   botPassword: "password123",
 *   private: false
 * })
 *
 * await uploader.login()
 * const response = await uploader.post("api.php", {
 *   action: "edit",
 *   title: "Test Page",
 *   text: "Hello World"
 * })
 * ```
 */

import {Data, Valid} from "@gesslar/toolkit"
import fetch, {Headers,FormData} from "node-fetch"

const tokenPath = "api.php?action=query&meta=tokens&type=login&format=json"
const editTokenPath = "api.php?action=query&meta=tokens&format=json"
const METHODS = Object.freeze({
  POST: "POST",
  GET: "GET",
})

export default class MediaWikiUploader {
  #baseUrl
  #botUsername
  #botPassword
  #cookies = []
  #loginToken
  #csrftoken
  #private

  /**
   * Create a new MediaWiki uploader instance
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
   * @returns {Promise<MediaWikiUploader>} Returns self for chaining
   * @throws {Error} When authentication fails or credentials are invalid
   */
  async login() {
    try {
      this.#validate()

      this.#loginToken = await this.#getLoginToken()

      const response = await this.post(
        "api.php",
        {
          action: "login",
          lgname: this.#botUsername,
          lgpassword: this.#botPassword,
          lgtoken: this.#loginToken,
          format: "json",
        }
      )

      const {ok,status,statusText} = response
      this.#updateCookies(response.headers)

      console.log(ok, status, statusText)
      Valid.assert(
        ok,
        `HTTP error! status: ${status} - ${statusText}`
      )

      const json = await response.json()
      console.log(JSON.stringify(json))

      const result = json?.login?.result
      Valid.assert(
        !!result,
        `Unexpected login response structure: ${JSON.stringify(result)}`
      )

      Valid.assert(
        result === "Success",
        `Login failed: ${json.login?.reason || "Unknown error"}`
      )

      this.#csrftoken = await this.#getCsrfToken()

      return this
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }

  /**
   * Retrieve login token from MediaWiki API
   *
   * @private
   * @returns {Promise<string>} Login token
   */
  async #getLoginToken() {
    const baseUrl = this.#baseUrl
    const response = await fetch(`${baseUrl}/${tokenPath}`)

    const {ok,status,statusText} = response
    Valid.assert(ok, `HTTP error! status: ${status} - ${statusText}`)

    this.#updateCookies(response.headers)

    const json = await response.json()
    const token = json?.query?.tokens?.logintoken

    // Check if we have the expected data structure
    Valid.assert(
      !!token,
      `Unexpected login token response structure: ${JSON.stringify(json)}`
    )

    return token
  }

  /**
   * Retrieve CSRF token for editing operations
   *
   * @private
   * @returns {Promise<string>} CSRF token
   */
  async #getCsrfToken() {
    const response = await this.get(editTokenPath)
    const json = await response.json()
    const token = json?.query?.tokens?.csrftoken || {}

    Valid.assert(!!token, "Invalid token response.")

    return token
  }

  /**
   * Validate required configuration before operations
   *
   * @private
   * @throws {Error} When required configuration is missing
   */
  #validate() {
    Valid.assert(!!this.#baseUrl, "Missing baseUrl.")
    Valid.assert(!!this.#botUsername, "Missing botUsername.")
    Valid.assert(!!this.#botPassword, "Missing botPassword.")
  }

  /**
   * Validate authentication state before authenticated operations
   *
   * @private
   * @throws {Error} When not properly authenticated
   */
  #validateAfterLogin() {
    Valid.assert(!!this.#loginToken, "Not logged in.")
    Valid.assert(!!this.#csrftoken, "Not logged in.")
    Valid.assert(this.#cookies.length > 0, "Not logged in.")
  }

  /**
   * Clear authentication state and logout
   */
  logout() {
    try {
      // Clear cookies to logout
      this.#cookies = []
      this.#loginToken = null
      this.#csrftoken = null
      console.error("Logged out from MediaWiki")
    } catch (error) {
      console.error("Logout error:", error.message)
    }
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
    for(const [k,v] of Object.entries(data))
      body.append(k, String(v))

    const response = await fetch(url, {method,headers,body})

    const {ok,status,statusText} = response
    Valid.assert(ok, `HTTP error! status: ${status} - ${statusText}`)
    this.#updateCookies(response.headers)

    return await response
  }

  /**
   * Perform GET request to MediaWiki API
   *
   * @param {string} path - API endpoint path
   * @returns {Promise<Response>} Fetch response object
   * @throws {Error} When request fails
   */
  async get(path) {
    this.#validate()

    this.#private && this.#validateAfterLogin()

    const url = new URL(path, this.#baseUrl)
    const method = METHODS.GET
    const headers = this.#getHeaders()
    const response = await fetch(url, {method,headers})

    const {ok,status,statusText} = response
    Valid.assert(ok, `HTTP error! status: ${status} - ${statusText}`)
    this.#updateCookies(response.headers)

    return await response
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
