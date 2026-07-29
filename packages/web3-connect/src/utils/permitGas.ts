import { clampBigInt } from "@galacticcouncil/utils"

import {
  EVM_GAS_TO_WEIGHT,
  EVM_MAX_GAS_LIMIT,
  EVM_MIN_GAS_LIMIT,
} from "@/config/evm"

const GAS_LIMIT_SURPLUS_PERCENT = 30n
const GAS_PRICE_SURPLUS_PERCENT = 5n

export const getPermitGasFromWeight = (weight: bigint): bigint => {
  const gasByWeight = clampBigInt(weight / EVM_GAS_TO_WEIGHT, {
    min: EVM_MIN_GAS_LIMIT,
    max: EVM_MAX_GAS_LIMIT,
  })
  const gasLimitSurplus = (gasByWeight * GAS_LIMIT_SURPLUS_PERCENT) / 100n

  return gasByWeight + gasLimitSurplus
}

export const getPermitGasLimit = (gas: bigint, weight: bigint): bigint => {
  const gasByWeight = weight / EVM_GAS_TO_WEIGHT
  const baseGasLimit = gasByWeight > gas ? gasByWeight : gas
  const gasLimitSurplus = (baseGasLimit * GAS_LIMIT_SURPLUS_PERCENT) / 100n

  return baseGasLimit + gasLimitSurplus
}

export const getPermitGasPrice = (gasPriceBase: bigint): bigint =>
  gasPriceBase + (gasPriceBase * GAS_PRICE_SURPLUS_PERCENT) / 100n
