import { TypeRegistry } from "@polkadot/types"
import { test, expect } from "vitest"
import { getAccountResolver } from "./accountResolver"

const registry = new TypeRegistry()
test("account resolver", () => {
  const accountResolver = getAccountResolver(registry)

  expect([
    accountResolver(0).toString(),
    accountResolver(10).toString(),
    accountResolver(14).toString(),
    accountResolver(12).toString(),
    accountResolver(15).toString(),
  ]).toEqual([
    "5EYCAe5c7fnf6Er9ebHGTdvLY9kXtcQeTxYxWMjaQwwvF7sS",
    "5EYCAe5c7fnf6Er9ebKysuNDf6WWU9RPpfx41nbw3ChCwccN",
    "5EYCAe5c7fnf6Er9ebM4r1Ya75DJJMptmMi6DZMGtWC81v1M",
    "5EYCAe5c7fnf6Er9ebLXMxTPt5ruPFd9J1q57fybxrSfUZyg",
    "5EYCAe5c7fnf6Er9ebMLb36ADZtVkuvmW2ebmW37ML4rHaqv",
  ])
})
