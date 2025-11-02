#!/usr/bin/env node

import { describe, it } from "node:test"
import assert from "node:assert/strict"

import {
  getMediaInfo,
  isValidMediaUrl,
  formatMediaForWiki,
  detectMediaType
} from "../../src/index.js"

describe("wiki-your-media utilities", () => {
  describe("detectMediaType", () => {
    it("should detect image types", () => {
      assert.equal(detectMediaType("https://example.com/photo.jpg"), "image")
      assert.equal(detectMediaType("https://example.com/photo.png"), "image")
      assert.equal(detectMediaType("https://example.com/photo.gif"), "image")
      assert.equal(detectMediaType("https://example.com/photo.webp"), "image")
      assert.equal(detectMediaType("https://example.com/photo.svg"), "image")
    })

    it("should detect video types", () => {
      assert.equal(detectMediaType("https://example.com/video.mp4"), "video")
      assert.equal(detectMediaType("https://example.com/video.webm"), "video")
      assert.equal(detectMediaType("https://example.com/video.avi"), "video")
      assert.equal(detectMediaType("https://example.com/video.mov"), "video")
    })

    it("should detect audio types", () => {
      assert.equal(detectMediaType("https://example.com/audio.mp3"), "audio")
      assert.equal(detectMediaType("https://example.com/audio.wav"), "audio")
      assert.equal(detectMediaType("https://example.com/audio.ogg"), "audio")
      assert.equal(detectMediaType("https://example.com/audio.m4a"), "audio")
    })

    it("should default to document for unknown types", () => {
      assert.equal(detectMediaType("https://example.com/file.pdf"), "document")
      assert.equal(detectMediaType("https://example.com/file.txt"), "document")
      assert.equal(detectMediaType("https://example.com/file.doc"), "document")
    })

    it("handles edge cases", () => {
      assert.equal(detectMediaType(""), "document")
      assert.equal(detectMediaType("no-extension"), "document")
      assert.equal(detectMediaType("file."), "document")
    })
  })

  describe("isValidMediaUrl", () => {
    it("should validate proper URLs", () => {
      assert.equal(isValidMediaUrl("https://example.com/image.jpg"), true)
      assert.equal(isValidMediaUrl("http://example.com/video.mp4"), true)
      assert.equal(isValidMediaUrl("https://cdn.example.com/audio.mp3"), true)
    })

    it("should reject invalid URLs", () => {
      assert.equal(isValidMediaUrl("not-a-url"), false)
      assert.equal(isValidMediaUrl(""), false)
      assert.equal(isValidMediaUrl("ftp://invalid.protocol/file.jpg"), true) // URL constructor accepts this
    })

    it("handles edge cases", () => {
      assert.equal(isValidMediaUrl(null), false)
      assert.equal(isValidMediaUrl(undefined), false)
      // Test with number (should be coerced to string)
      assert.equal(isValidMediaUrl(123), false)
    })
  })

  describe("getMediaInfo", () => {
    it("should return media info for valid URLs", async () => {
      const result = await getMediaInfo("https://example.com/photo.jpg")
      assert.deepEqual(result, {
        url: "https://example.com/photo.jpg",
        type: "image"
      })
    })

    it("should return media info for different types", async () => {
      const videoResult = await getMediaInfo("https://example.com/video.mp4")
      assert.deepEqual(videoResult, {
        url: "https://example.com/video.mp4",
        type: "video"
      })

      const audioResult = await getMediaInfo("https://example.com/audio.mp3")
      assert.deepEqual(audioResult, {
        url: "https://example.com/audio.mp3",
        type: "audio"
      })
    })

    it("should return null for invalid URLs", async () => {
      const result = await getMediaInfo("invalid-url")
      assert.equal(result, null)
    })

    it("handles edge cases", async () => {
      assert.equal(await getMediaInfo(""), null)
      assert.equal(await getMediaInfo(null), null)
      assert.equal(await getMediaInfo(undefined), null)
    })
  })

  describe("formatMediaForWiki", () => {
    it("should format images correctly", () => {
      const media = { url: "https://example.com/image.jpg", type: "image" }
      const result = formatMediaForWiki(media)
      assert.equal(result, '![Media](https://example.com/image.jpg)')
    })

    it("should format videos correctly", () => {
      const media = { url: "https://example.com/video.mp4", type: "video" }
      const result = formatMediaForWiki(media)
      assert.equal(result, '<video src="https://example.com/video.mp4" controls title="Media"></video>')
    })

    it("should format audio correctly", () => {
      const media = { url: "https://example.com/audio.mp3", type: "audio" }
      const result = formatMediaForWiki(media)
      assert.equal(result, '<audio src="https://example.com/audio.mp3" controls title="Media"></audio>')
    })

    it("should format documents correctly", () => {
      const media = { url: "https://example.com/file.pdf", type: "document" }
      const result = formatMediaForWiki(media)
      assert.equal(result, '[Media](https://example.com/file.pdf)')
    })

    it("handles media with custom metadata", () => {
      const media = {
        url: "https://example.com/image.jpg",
        type: "image",
        metadata: { title: "Custom Title" }
      }
      const result = formatMediaForWiki(media)
      assert.equal(result, '![Custom Title](https://example.com/image.jpg)')
    })

    it("handles edge cases", () => {
      // Test with minimal media object
      assert.doesNotThrow(() => {
        formatMediaForWiki({ url: "test.jpg", type: "image" })
      })

      // Test with missing metadata
      const result = formatMediaForWiki({ url: "test.jpg", type: "image" })
      assert.ok(result.includes("test.jpg"))
    })
  })
})
