import { describe, expect, it } from "vitest"

import * as core from "@/core"

describe("core entrypoint", () => {
  it("is importable", () => {
    expect(core).toBeDefined()
  })
})
