import { afterEach, describe, expect, it, vi } from "vitest"

import { parseDefillamaReading } from "@/api/external/defillama"
import {
  FeedHttpError,
  fetchFeedJson,
  retryFeedQuery,
} from "@/api/external/feed"
import { getKaminoWindow, parseKaminoReading } from "@/api/external/kamino"

const defillamaEntry = (
  timestamp: string,
  apyBase: number | null,
  apy: number | null,
) => ({
  timestamp,
  tvlUsd: 1,
  apy,
  apyBase,
  apyReward: null,
  il7d: null,
  apyBase7d: null,
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("retryFeedQuery", () => {
  it("allows at most 2 retries", () => {
    const error = new Error("network")

    expect(retryFeedQuery(0, error)).toBe(true)
    expect(retryFeedQuery(1, error)).toBe(true)
    expect(retryFeedQuery(2, error)).toBe(false)
  })

  it("never retries a 4xx response", () => {
    expect(retryFeedQuery(0, new FeedHttpError("test", 400))).toBe(false)
    expect(retryFeedQuery(0, new FeedHttpError("test", 404))).toBe(false)
    expect(retryFeedQuery(0, new FeedHttpError("test", 429))).toBe(false)
  })

  it("retries a 5xx response", () => {
    expect(retryFeedQuery(0, new FeedHttpError("test", 502))).toBe(true)
  })
})

describe("fetchFeedJson", () => {
  it("throws on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 502 })),
    )

    await expect(
      fetchFeedJson("http://feed", "test", new AbortController().signal),
    ).rejects.toMatchObject({ name: "FeedHttpError", status: 502 })
  })

  it("returns the body of a 2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("[1]", { status: 200 })),
    )

    await expect(
      fetchFeedJson("http://feed", "test", new AbortController().signal),
    ).resolves.toEqual([1])
  })

  it("honours the caller's abort signal", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      init?.signal?.throwIfAborted()
      return new Response("[]")
    })
    vi.stubGlobal("fetch", fetchMock)

    const controller = new AbortController()
    controller.abort()

    await expect(
      fetchFeedJson("http://feed", "test", controller.signal),
    ).rejects.toThrow()
  })
})

describe("getKaminoWindow", () => {
  it("ends at the next whole hour and spans 24 hours", () => {
    const { start, end } = getKaminoWindow(new Date("2026-10-05T16:21:33.541Z"))

    expect(end.toISOString()).toBe("2026-10-05T17:00:00.000Z")
    expect(start.toISOString()).toBe("2026-10-04T17:00:00.000Z")
  })
})

describe("parseKaminoReading", () => {
  it("uses the newest entry by createdOn regardless of order", () => {
    const reading = parseKaminoReading(
      [
        { createdOn: "2026-10-05T15:00:00.000Z", apr: "0.05", apy: "0.0605" },
        { createdOn: "2026-10-05T16:00:00.000Z", apr: "0.05", apy: "0.0611" },
        { createdOn: "2026-10-05T14:00:00.000Z", apr: "0.05", apy: "0.0599" },
      ],
      "test",
    )

    expect(reading).toEqual({
      apy: "0.0611",
      asOf: Date.parse("2026-10-05T16:00:00.000Z"),
    })
  })

  it("throws on an empty list instead of falling back", () => {
    expect(() => parseKaminoReading([], "test")).toThrow()
  })

  it("throws on an implausible value", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() =>
      parseKaminoReading(
        [{ createdOn: "2026-10-05T16:00:00.000Z", apr: "1", apy: "1.5" }],
        "test",
      ),
    ).toThrow()
  })

  it("throws on a malformed body", () => {
    expect(() => parseKaminoReading({ error: "bad" }, "test")).toThrow()
  })
})

describe("parseDefillamaReading", () => {
  it("uses apyBase of the newest entry as a fraction", () => {
    const reading = parseDefillamaReading(
      {
        status: "success",
        data: [
          defillamaEntry("2026-10-05T12:00:00.000Z", 3.36, 3.41),
          defillamaEntry("2026-10-04T23:01:00.000Z", 5.61, 5.7),
        ],
      },
      "test",
    )

    expect(reading).toEqual({
      apy: "0.0336",
      asOf: Date.parse("2026-10-05T12:00:00.000Z"),
    })
  })

  it("falls back to apy only when apyBase is null", () => {
    const data = (apyBase: number | null) => ({
      data: [defillamaEntry("2026-10-05T12:00:00.000Z", apyBase, 5.61)],
    })

    expect(parseDefillamaReading(data(null), "test").apy).toBe("0.0561")
    expect(parseDefillamaReading(data(0), "test").apy).toBe("0")
  })

  it("throws when both values are null", () => {
    expect(() =>
      parseDefillamaReading(
        { data: [defillamaEntry("2026-10-05T12:00:00.000Z", null, null)] },
        "test",
      ),
    ).toThrow()
  })

  it("throws when there are no entries", () => {
    expect(() =>
      parseDefillamaReading({ status: "success", data: [] }, "test"),
    ).toThrow()
  })

  it("throws on a value above 100 percent", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() =>
      parseDefillamaReading(
        { data: [defillamaEntry("2026-10-05T12:00:00.000Z", 120, null)] },
        "test",
      ),
    ).toThrow()
  })
})
