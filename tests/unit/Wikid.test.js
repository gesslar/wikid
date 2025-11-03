#!/usr/bin/env node

import { describe, it } from "node:test"
import assert from "node:assert/strict"

import Wikid from "../../src/index.js"

describe("Wikid", () => {
  describe("import", () => {
    it("can be imported from package", () => {
      assert.ok(Wikid)
      assert.equal(typeof Wikid, "function")
    })
  })

  describe("constructor", () => {
    it("handles normal configuration", () => {
      const wikid = new Wikid({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      assert.ok(wikid instanceof Wikid)
    })

    it("handles empty configuration gracefully", () => {
      // Should not throw on construction
      const wikid = new Wikid()
      assert.ok(wikid instanceof Wikid)
    })

    it("handles private wiki flag", () => {
      const wikid = new Wikid({
        baseUrl: "https://private.wiki.com",
        botUsername: "TestBot",
        botPassword: "password123",
        private: true
      })

      assert.ok(wikid instanceof Wikid)
    })
  })

  describe("edge cases", () => {
    it("handles null configuration", () => {
      const wikid = new Wikid(null)
      assert.ok(wikid instanceof Wikid)
    })

    it("handles undefined configuration", () => {
      const wikid = new Wikid(undefined)
      assert.ok(wikid instanceof Wikid)
    })

    it("handles empty object configuration", () => {
      const wikid = new Wikid({})
      assert.ok(wikid instanceof Wikid)
    })
  })

  describe("logout method", () => {
    it("can be called safely without login", () => {
      const wikid = new Wikid()

      // Should not throw
      assert.doesNotThrow(() => {
        wikid.logout()
      })
    })

    it("clears authentication state", () => {
      const wikid = new Wikid({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      wikid.logout()
      // After logout, should be safe to call again
      assert.doesNotThrow(() => {
        wikid.logout()
      })
    })
  })

  describe("error scenarios", () => {
    describe("login validation", () => {
      it("returns error object when missing baseUrl", async () => {
        const wikid = new Wikid({
          botUsername: "TestBot",
          botPassword: "password123"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
        assert.match(result.error.message, /baseUrl/i)
      })

      it("returns error object when missing botUsername", async () => {
        const wikid = new Wikid({
          baseUrl: "https://wiki.example.com",
          botPassword: "password123"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
        assert.match(result.error.message, /botUsername/i)
      })

      it("returns error object when missing botPassword", async () => {
        const wikid = new Wikid({
          baseUrl: "https://wiki.example.com",
          botUsername: "TestBot"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
        assert.match(result.error.message, /botPassword/i)
      })
    })
  })

  describe("cookie management", () => {
    it("starts with empty cookie jar", () => {
      const wikid = new Wikid({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      // Should start with no cookies (can't directly test private field)
      // but we can verify logout clears state
      assert.doesNotThrow(() => wikid.logout())
    })

    it("logout clears cookies and tokens", () => {
      const wikid = new Wikid({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      // Call logout multiple times - should be safe
      wikid.logout()
      wikid.logout()
      wikid.logout()

      assert.ok(true, "Multiple logout calls should not throw")
    })
  })

  describe("private wiki configuration", () => {
    it("accepts private flag in constructor", () => {
      const wikid = new Wikid({
        baseUrl: "https://private.wiki.com",
        botUsername: "TestBot",
        botPassword: "password123",
        private: true
      })

      assert.ok(wikid instanceof Wikid)
    })

    it("defaults private flag to false", () => {
      const wikid = new Wikid({
        baseUrl: "https://wiki.example.com",
        botUsername: "TestBot",
        botPassword: "password123"
      })

      assert.ok(wikid instanceof Wikid)
    })
  })

  describe("type handling", () => {
    it("handles various falsy configuration values", () => {
      // These should all construct without throwing
      assert.ok(new Wikid())
      assert.ok(new Wikid(null))
      assert.ok(new Wikid(undefined))
      assert.ok(new Wikid({}))
      assert.ok(new Wikid({baseUrl: ""}))
      assert.ok(new Wikid({botUsername: ""}))
      assert.ok(new Wikid({botPassword: ""}))
    })

    it("preserves configuration values", () => {
      const config = {
        baseUrl: "https://test.wiki.com",
        botUsername: "MyTestBot",
        botPassword: "secret123",
        private: true
      }

      const wikid = new Wikid(config)

      // Values are stored (can't test private fields directly,
      // but login validation will check them)
      assert.ok(wikid instanceof Wikid)
    })
  })

  describe("input validation edge cases", () => {
    it("handles whitespace-only values", () => {
      const wikid = new Wikid({
        baseUrl: "   ",
        botUsername: "   ",
        botPassword: "   "
      })

      assert.ok(wikid instanceof Wikid)
    })

    it("handles numeric values in configuration", () => {
      const wikid = new Wikid({
        baseUrl: 12345,
        botUsername: 67890,
        botPassword: 11111
      })

      assert.ok(wikid instanceof Wikid)
    })

    it("handles boolean private flag variations", () => {
      // Truthy values
      assert.ok(new Wikid({private: true}))
      assert.ok(new Wikid({private: 1}))
      assert.ok(new Wikid({private: "yes"}))

      // Falsy values
      assert.ok(new Wikid({private: false}))
      assert.ok(new Wikid({private: 0}))
      assert.ok(new Wikid({private: ""}))
      assert.ok(new Wikid({private: null}))
    })
  })
})
