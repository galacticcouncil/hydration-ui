import {
  gasLimitRecommendations as gasLimits,
  GasRecommendationType,
  ProtocolAction,
} from "@aave/contract-helpers"

export const gasLimitRecommendations: GasRecommendationType = {
  ...gasLimits,
  [ProtocolAction.withdraw]: {
    limit: "800000",
    recommended: "800000",
  },
  [ProtocolAction.borrow]: {
    limit: "800000",
    recommended: "800000",
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
