#!/usr/bin/env node

import { describe, it } from "node:test"
import assert from "node:assert/strict"

// Test both import styles
import { MediaWikiUploader } from "../../src/index.js"
import { WikiSystem } from "../../src/index.js"

describe("MediaWikiUploader", () => {
  describe("import compatibility", () => {
    it("works with individual import", () => {
      // Test individual class import
      assert.ok(MediaWikiUploader)
      assert.equal(typeof MediaWikiUploader, "function")
    })

    it("works with semantic bundle import", () => {
      // Test semantic bundle import
      const {MediaWikiUploader: BundledClass} = WikiSystem
      assert.ok(BundledClass)
      assert.equal(typeof BundledClass, "function")
    })

    it("both import styles reference same class", () => {
      // Verify they're the same constructor
      assert.equal(MediaWikiUploader, WikiSystem.MediaWikiUploader)
    })
  })

  describe("constructor", () => {
    it("handles normal configuration", () => {
      const uploader = new MediaWikiUploader({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      assert.ok(uploader instanceof MediaWikiUploader)
    })

    it("handles empty configuration gracefully", () => {
      // Should not throw on construction
      const uploader = new MediaWikiUploader()
      assert.ok(uploader instanceof MediaWikiUploader)
    })

    it("handles private wiki flag", () => {
      const uploader = new MediaWikiUploader({
        baseUrl: "https://private.wiki.com",
        botUsername: "TestBot",
        botPassword: "password123",
        private: true
      })

      assert.ok(uploader instanceof MediaWikiUploader)
    })
  })

  describe("edge cases", () => {
    it("handles null configuration", () => {
      const uploader = new MediaWikiUploader(null)
      assert.ok(uploader instanceof MediaWikiUploader)
    })

    it("handles undefined configuration", () => {
      const uploader = new MediaWikiUploader(undefined)
      assert.ok(uploader instanceof MediaWikiUploader)
    })

    it("handles empty object configuration", () => {
      const uploader = new MediaWikiUploader({})
      assert.ok(uploader instanceof MediaWikiUploader)
    })
  })

  describe("logout method", () => {
    it("can be called safely without login", () => {
      const uploader = new MediaWikiUploader()

      // Should not throw
      assert.doesNotThrow(() => {
        uploader.logout()
      })
    })

    it("clears authentication state", () => {
      const uploader = new MediaWikiUploader({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      uploader.logout()
      // After logout, should be safe to call again
      assert.doesNotThrow(() => {
        uploader.logout()
      })
    })
  })

  describe("error scenarios", () => {
    describe("login validation", () => {
      it("throws when missing baseUrl", async () => {
        const uploader = new MediaWikiUploader({
          botUsername: "TestBot",
          botPassword: "password123"
        })

        const result = await uploader.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })

      it("throws when missing botUsername", async () => {
        const uploader = new MediaWikiUploader({
          baseUrl: "https://wiki.example.com",
          botPassword: "password123"
        })

        const result = await uploader.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })

      it("throws when missing botPassword", async () => {
        const uploader = new MediaWikiUploader({
          baseUrl: "https://wiki.example.com",
          botUsername: "TestBot"
        })

        const result = await uploader.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })
    })
  })
})
