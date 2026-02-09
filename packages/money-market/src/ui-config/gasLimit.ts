import {
  gasLimitRecommendations as gasLimits,
  GasRecommendationType,
  ProtocolAction,
} from "@aave/contract-helpers"

export const gasLimitRecommendations: GasRecommendationType = {
  ...gasLimits,
  [ProtocolAction.withdraw]: {
    limit: "600000",
    recommended: "600000",
  },
  [ProtocolAction.borrow]: {
    limit: "1000000",
    recommended: "1000000",
  },
  [ProtocolAction.setUsageAsCollateral]: {
    limit: "800000",
    recommended: "800000",
  },
  [ProtocolAction.claimRewards]: {
    limit: "1000000",
    recommended: "1000000",
  },
}
