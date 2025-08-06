import {
  gasLimitRecommendations as gasLimits,
  GasRecommendationType,
  ProtocolAction,
} from "@aave/contract-helpers"

export const gasLimitRecommendations: GasRecommendationType = {
  ...gasLimits,
  [ProtocolAction.withdraw]: {
    limit: "320000",
    recommended: "320000",
  },
  [ProtocolAction.borrow]: {
    limit: "600000",
    recommended: "600000",
  },
  [ProtocolAction.setUsageAsCollateral]: {
    limit: "500000",
    recommended: "500000",
  },
  [ProtocolAction.claimRewards]: {
    limit: "500000",
    recommended: "500000",
  },
}
