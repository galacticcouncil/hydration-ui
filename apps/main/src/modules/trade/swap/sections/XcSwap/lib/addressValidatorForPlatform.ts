import {
  BtcAddr,
  NearAddr,
  toNearAccountId,
  ZecAddr,
} from "@galacticcouncil/utils"

import { XcPlatform } from "@/utils/trade"

export const addressValidatorForPlatform = (
  platform: XcPlatform,
): ((addr: string) => boolean) => {
  switch (platform) {
    case "near":
      return NearAddr.isValid
    case "zec":
      return ZecAddr.isValid
    case "btc":
      return BtcAddr.isValid
    case "hydration":
      return () => true
  }
}

export const normalizeAddressForPlatform = (
  platform: XcPlatform,
  addr: string,
): string => (platform === "near" ? toNearAccountId(addr) : addr)
