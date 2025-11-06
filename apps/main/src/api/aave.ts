import { HEALTH_FACTOR_RISK_THRESHOLD } from "@galacticcouncil/money-market/ui-config"
import { aave } from "@galacticcouncil/sdk-next"
import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"

type HealthFactorArgs = {
  readonly address: string
  readonly assetId: string
  readonly amount: string
}

export type HealthFactorResult = {
  readonly current: string
  readonly future: string
  readonly isBelowRiskThreshold: boolean
  readonly isSignificantChange: boolean
  readonly isUserConsentRequired: boolean
}

export const AAVE_GAS_LIMIT = aave.AAVE_GAS_LIMIT

const formatHealthFactorResult = ({
  currentHF,
  futureHF,
}: {
  currentHF: number
  futureHF: number
}): HealthFactorResult => {
  const current = Big(currentHF)
  const future = Big(futureHF)

  const isBelowRiskThreshold = future.lt(HEALTH_FACTOR_RISK_THRESHOLD)
  const isSignificantChange = future
    .round(2, Big.roundDown)
    .lt(current.round(2, Big.roundDown))

  return {
    current: current.toString(),
    future: future.toString(),
    isBelowRiskThreshold,
    isSignificantChange,
    isUserConsentRequired: isSignificantChange && isBelowRiskThreshold,
  }
}

export const healthFactorAfterWithdrawQuery = (
  { sdk, isLoaded }: TProviderContext,
  { address, assetId, amount }: HealthFactorArgs,
) =>
  queryOptions({
    queryKey: ["healthFactor", "withdraw", address, assetId, amount],
    queryFn: async () => {
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address),
        sdk.api.aave.getHealthFactorAfterWithdraw(
          address,
          Number(assetId),
          amount,
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    enabled: isLoaded && !!address && !!assetId && Big(amount || "0").gt(0),
  })

export const healthFactorAfterSupplyQuery = (
  { sdk, isLoaded }: TProviderContext,
  { address, assetId, amount }: HealthFactorArgs,
) =>
  queryOptions({
    queryKey: ["healthFactor", "supply", address, assetId, amount],
    queryFn: async () => {
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address),
        sdk.api.aave.getHealthFactorAfterSupply(
          address,
          Number(assetId),
          amount,
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    enabled: isLoaded && !!address && !!assetId && Big(amount || "0").gt(0),
  })
