import { EvmCall } from "@galacticcouncil/xcm-sdk"

export enum CapType {
  "supplyCap" = "supplyCap",
  "borrowCap" = "borrowCap",
}

export type MoneyMarketEnv = "mainnet" | "testnet"

export type MoneyMarketTxFn = (
  call: ExtendedEvmCall,
  options: {
    onSuccess: () => void
  },
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
