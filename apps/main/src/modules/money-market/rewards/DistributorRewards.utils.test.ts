import { interpolationFormat } from "@galacticcouncil/utils/src/helpers/interpolation"
import i18next from "i18next"
import { describe, expect, it } from "vitest"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import common from "@/i18n/locales/en/common.json"
import {
  getDistributorRewardsAssetId,
  getDistributorRewardsSymbol,
  hasDistributorRewards,
} from "@/modules/money-market/rewards/DistributorRewards.utils"

const i18n = i18next.createInstance()
i18n.init({
  initImmediate: false,
  lng: "en",
  ns: ["common"],
  defaultNS: "common",
  resources: { en: { common } },
  interpolation: { format: interpolationFormat, escapeValue: false },
})

// the real strings, through the formatters the app registers
const t = i18n.getFixedT("en")

// an account with no entry under the live root, as the claim hook answers it
const NO_CLAIM: RewardsDistributorClaim = {
  status: "none",
  assetId: "",
  symbol: "",
  owed: "0",
  owedUsd: "0",
}
const CLAIM: RewardsDistributorClaim = {
  status: "claimable",
  assetId: "43",
  symbol: "PRIME",
  owed: "12.5",
  owedUsd: "25",
}

// the accrued hook's answer without the account or the token's registry entry
const NO_ACCRUED: RewardsDistributorAccrued = {
  assetId: "",
  symbol: "",
  stages: [],
}
const ACCRUED: RewardsDistributorAccrued = {
  assetId: "43",
  symbol: "PRIME",
  stages: [{ stage: "accruing", amount: "3.2", claimableAt: undefined }],
}

describe("hasDistributorRewards", () => {
  it.each([
    ["an amount to claim and nothing waiting", CLAIM, NO_ACCRUED],
    [
      "an amount too small to claim yet",
      { ...CLAIM, status: "belowDeposit" as const },
      NO_ACCRUED,
    ],
    ["a new supplier, with an estimate and no claim", NO_CLAIM, ACCRUED],
    ["an amount to claim and more waiting", CLAIM, ACCRUED],
  ])("shows the block for %s", (_, claim, accrued) => {
    expect(hasDistributorRewards(claim, accrued)).toBe(true)
  })

  it("hides the block when nothing is claimable or waiting", () => {
    expect(hasDistributorRewards(NO_CLAIM, NO_ACCRUED)).toBe(false)
  })
})

describe("getDistributorRewardsSymbol", () => {
  it("is the claim's", () => {
    expect(
      getDistributorRewardsSymbol(CLAIM, { ...ACCRUED, symbol: "OTHER" }),
    ).toBe("PRIME")
  })

  it("is the accrued rewards' for a new supplier, whose claim names none", () => {
    expect(getDistributorRewardsSymbol(NO_CLAIM, ACCRUED)).toBe("PRIME")
  })
})

describe("getDistributorRewardsAssetId", () => {
  it("is the claim's", () => {
    expect(
      getDistributorRewardsAssetId(CLAIM, { ...ACCRUED, assetId: "7" }),
    ).toBe("43")
  })

  it("is the accrued rewards' for a new supplier, whose claim names none", () => {
    expect(getDistributorRewardsAssetId(NO_CLAIM, ACCRUED)).toBe("43")
  })
})

describe("the shared currency formatter", () => {
  // the block prints a new supplier's claimable amount with it, which is zero
  it("prints zero in the reward token", () => {
    // the number formatter separates with non-breaking spaces
    expect(
      t("currency", { value: "0", symbol: "PRIME" }).replaceAll(" ", " "),
    ).toBe("0 PRIME")
  })
})
