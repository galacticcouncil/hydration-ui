import { ReserveDataHumanized } from "@aave/contract-helpers"
import { EvmCall } from "@galacticcouncil/xc-sdk"

export type { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"

export enum CapType {
  "supplyCap" = "supplyCap",
  "borrowCap" = "borrowCap",
}

export type ToastsConfig = {
  submitted: string
  success: string
}

export type MoneyMarketTxFn = (
  data: {
    tx: ExtendedEvmCall | ExtendedEvmCall[]
    toasts?: ToastsConfig
  },
  options: {
    onSuccess: () => void
  },
  withExtraGas?: boolean,
) => void

export interface ExtendedEvmCall extends EvmCall {
  nonce?: bigint
  gasLimit?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export type FormatterFn = (
  value: number | bigint | string | null | undefined,
  opts?: Record<string, number | string>,
) => string

export type ReserveFormatterFn = <T extends ReserveDataHumanized>(
  reserve: T,
) => T

export type ExternalApyData = Map<
  string,
  {
    borrowApy: string | null
    supplyApy: string | null
  }
>
