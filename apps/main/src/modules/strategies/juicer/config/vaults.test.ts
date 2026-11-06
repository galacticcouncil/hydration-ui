import { expect, test } from "vitest"

import {
  JUICER_VAULTS,
  juicerPositionId,
  vaultByPositionId,
  vaultByShareAssetId,
} from "@/modules/strategies/juicer/config/vaults"

test("every vault is found by its position id and share asset", () => {
  for (const vault of JUICER_VAULTS) {
    expect(vaultByPositionId(juicerPositionId(vault))).toBe(vault)
    expect(vaultByShareAssetId(vault.shareAssetId)).toBe(vault)
  }
  expect(vaultByPositionId(undefined)).toBeUndefined()
  expect(vaultByShareAssetId("0")).toBeUndefined()
})
