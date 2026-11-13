import type { Address } from "viem"
import { describe, expect, it } from "vitest"

import { assessClaim, hasBlocker } from "@/core"
import type { ClaimableReward } from "@/types"

const controller = "0x00000000000000000000000000000000000000c0" as Address
const hdx = "0x0000000000000000000000000000000100000000" as Address
const gdot = "0x00000000000000000000000000000001000002b2" as Address

const claimable = (
  rewardTokenAddress: Address,
  amount: string,
  amountUsd: string,
): ClaimableReward => ({
  rewardTokenAddress,
  rewardTokenSymbol: "REWARD",
  incentiveControllerAddress: controller,
  amount,
  amountUsd,
})

const rewards = [
  claimable(hdx, "1250.5", "12.30012345"),
  claimable(gdot, "0.75", "3.1"),
]

describe("assessClaim", () => {
  it("sums every reward's USD value when claiming all", () => {
    const assessment = assessClaim({ claimable: rewards, reward: "all" })

    expect(assessment.rewards).toEqual(rewards)
    expect(assessment.totalUsd).toBe("15.40012345")
    expect(assessment.findings).toEqual([])
  })

  it("keeps only the selected reward, matching its address case-insensitively", () => {
    const assessment = assessClaim({
      claimable: rewards,
      reward: gdot.toUpperCase().replace("0X", "0x") as Address,
    })

    expect(assessment.rewards).toEqual([rewards[1]])
    expect(assessment.totalUsd).toBe("3.1")
    expect(assessment.findings).toEqual([])
  })

  it("blocks a reward with nothing accrued", () => {
    const assessment = assessClaim({
      claimable: [...rewards, claimable(controller, "0", "0")],
      reward: controller,
    })

    expect(assessment.totalUsd).toBe("0")
    expect(hasBlocker(assessment.findings)).toBe(true)
    expect(assessment.findings).toEqual([
      { kind: "blocker", code: "nothingToClaim", params: {} },
    ])
  })

  it("blocks claiming all when every reward is zero", () => {
    const assessment = assessClaim({
      claimable: [claimable(hdx, "0", "0"), claimable(gdot, "0", "0")],
      reward: "all",
    })

    expect(assessment.findings).toEqual([
      { kind: "blocker", code: "nothingToClaim", params: {} },
    ])
  })

  it("blocks claiming all when nothing has accrued at all", () => {
    const assessment = assessClaim({ claimable: [], reward: "all" })

    expect(assessment.rewards).toEqual([])
    expect(assessment.totalUsd).toBe("0")
    expect(hasBlocker(assessment.findings)).toBe(true)
  })
})
