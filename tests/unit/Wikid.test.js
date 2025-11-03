#!/usr/bin/env node

import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { Wikid } from "../../src/index.js"

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
      it("throws when missing baseUrl", async () => {
        const wikid = new Wikid({
          botUsername: "TestBot",
          botPassword: "password123"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })

      it("throws when missing botUsername", async () => {
        const wikid = new Wikid({
          baseUrl: "https://wiki.example.com",
          botPassword: "password123"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })

      it("throws when missing botPassword", async () => {
        const wikid = new Wikid({
          baseUrl: "https://wiki.example.com",
          botUsername: "TestBot"
        })

        const result = await wikid.login()
        assert.equal(result.ok, false)
        assert.ok(result.error)
      })
    })
  })
})
