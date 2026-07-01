import { NearAddr, ZcashAddr } from "@galacticcouncil/utils"
import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"

export const addressValidatorForPlatform = (
  platform: XcSwapPlatform,
): ((addr: string) => boolean) => {
  switch (platform) {
    case "near":
      return NearAddr.isValid
    case "zec":
      return ZcashAddr.isValid
    case "hydration":
      return () => true
  }
}
