import { describe, expect, it } from "vitest"
import { z } from "zod"

import { ChainReadError, DecodeError, MarketNotDeployedError } from "@/core"

const zodErrorFor = (schema: z.ZodType, value: unknown): z.ZodError => {
  const result = schema.safeParse(value)
  if (result.success) throw new Error("expected the schema to reject the value")
  return result.error
}

describe("MarketNotDeployedError", () => {
  const error = new MarketNotDeployedError("bil_v3", "0xdead")

  it("is an Error", () => {
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("MarketNotDeployedError")
  })

  it("names the market and the address", () => {
    expect(error.market).toBe("bil_v3")
    expect(error.address).toBe("0xdead")
    expect(error.message).toContain("bil_v3")
    expect(error.message).toContain("0xdead")
  })
})

describe("ChainReadError", () => {
  it("carries the transport failure as cause", () => {
    const transport = new Error("socket closed")
    const error = new ChainReadError("failed to read reserves", transport)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("ChainReadError")
    expect(error.message).toBe("failed to read reserves")
    expect(error.cause).toBe(transport)
  })
})

describe("DecodeError", () => {
  const schema = z.object({
    reserves: z.array(z.object({ decimals: z.number() })),
  })
  const cause = zodErrorFor(schema, { reserves: [{ decimals: "18" }] })
  const error = new DecodeError("reserves payload is not valid", cause)

  it("wraps the ZodError as cause rather than throwing it", () => {
    expect(error).toBeInstanceOf(Error)
    expect(error).not.toBeInstanceOf(z.ZodError)
    expect(error.name).toBe("DecodeError")
    expect(error.cause).toBe(cause)
  })

  it("exposes the failing field path", () => {
    expect(error.path).toBe("reserves[0].decimals")
    expect(error.message).toBe(
      "reserves payload is not valid at reserves[0].decimals",
    )
  })

  it("leaves the path empty when the whole payload failed", () => {
    const whole = new DecodeError(
      "reserves payload is not valid",
      zodErrorFor(schema, null),
    )

    expect(whole.path).toBe("")
    expect(whole.message).toBe("reserves payload is not valid")
  })
})
