import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { EVM_DISPATCH_ADDRESS } from "@galacticcouncil/web3-connect/src/config/evm"
import {
  getPermitGasFromWeight,
  getPermitGasLimit,
  getPermitGasPrice,
} from "@galacticcouncil/web3-connect/src/utils/permitGas"
import Big from "big.js"
import { Binary } from "polkadot-api"
import { EstimateGasParameters, formatEther, Hex } from "viem"

import { getSpotPrice, spotPriceQuery } from "@/api/spotPrice"
import { paymentInfoQuery } from "@/api/transaction"
import { AnyTransaction } from "@/modules/transactions/types"
import {
  containsEvmCall,
  getNestedEvmCallsFeeWei,
  transformAnyToPapiTx,
} from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { TAsset } from "@/providers/assetsProvider"
import { TProviderContext } from "@/providers/rpcProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

type FeeEstimate = {
  feeEstimateNative: string
  feeEstimate: string
  feeAssetId: string
}

const getEvmGasFeeWei = async (
  rpc: TProviderContext,
  address: string,
  anyTx: AnyTransaction,
): Promise<bigint> => {
  const weight = await getPermitWeight(rpc, address, anyTx)

  const [gas, gasPriceBase] = await Promise.all([
    getPermitGas(rpc, address, anyTx, weight),
    rpc.evm.getGasPrice(),
  ])

  const gasLimit = getPermitGasLimit(gas, weight)
  const gasPrice = getPermitGasPrice(gasPriceBase)

  // Wallets validate balance against gasLimit × gasPrice before signing.
  // On-chain, only gas_used × gas_price is charged.
  const dispatchFeeWei = gasLimit * gasPrice
  const nestedEvmFeeWei = containsEvmCall(anyTx)
    ? getNestedEvmCallsFeeWei(anyTx)
    : 0n

  return dispatchFeeWei + nestedEvmFeeWei
}

const getPermitWeight = async (
  rpc: TProviderContext,
  address: string,
  anyTx: AnyTransaction,
): Promise<bigint> => {
  const info = await rpc.queryClient.ensureQueryData(
    paymentInfoQuery(rpc, address, anyTx),
  )

  if (!info) {
    throw new Error("EVM permit fee estimation failed")
  }

  return info.weight.ref_time
}

const getPermitGas = async (
  rpc: TProviderContext,
  address: string,
  anyTx: AnyTransaction,
  weight: bigint,
): Promise<bigint> => {
  const evmAddress = safeConvertSS58toH160(address) as Hex

  if (isEvmCall(anyTx)) {
    return rpc.evm.estimateGas({
      account: evmAddress,
      to: anyTx.to as Hex,
      data: anyTx.data as Hex,
      value: anyTx.value ?? 0n,
    })
  }

  if (weight > 0n) {
    return getPermitGasFromWeight(weight)
  }

  return rpc.evm.estimateGas(
    await getPermitDispatchGasEstimate(rpc, anyTx, address),
  )
}

const getPermitDispatchGasEstimate = async (
  rpc: TProviderContext,
  anyTx: AnyTransaction,
  address: string,
): Promise<EstimateGasParameters> => {
  const papiTx = transformAnyToPapiTx(rpc.papi, anyTx)
  const evmAddress = safeConvertSS58toH160(address) as Hex

  if (!papiTx) {
    throw new Error("Unsupported transaction type for permit fee estimation")
  }

  return {
    account: evmAddress,
    to: EVM_DISPATCH_ADDRESS as Hex,
    data: Binary.toHex(await papiTx.getEncodedData()) as Hex,
    value: 0n,
  }
}

const evmWeiToNativeFee = async (
  rpc: TProviderContext,
  wei: bigint,
  nativeAssetId: string,
): Promise<string> => {
  const spot = await rpc.queryClient.ensureQueryData(
    spotPriceQuery(rpc, NATIVE_EVM_ASSET_ID, nativeAssetId),
  )

  if (!spot?.spotPrice) return "0"

  return Big(formatEther(wei)).times(spot.spotPrice.toString()).toString()
}

const convertNativeFeeToFeeAsset = async (
  rpc: TProviderContext,
  feeEstimateNative: string,
  feeAsset: TAsset,
  native: TAsset,
): Promise<string> => {
  const spot = await getSpotPrice(rpc.sdk.api.router, native.id, feeAsset.id)()

  if (spot?.spotPrice) {
    return Big(feeEstimateNative).mul(spot.spotPrice).toFixed(feeAsset.decimals)
  }

  const assetPaymentValue =
    await rpc.papi.query.MultiTransactionPayment.AcceptedCurrencies.getValue(
      Number(feeAsset.id),
    )

  if (!assetPaymentValue) {
    throw new Error(`Asset ${feeAsset.id} is not accepted for payment`)
  }

  const assetPaymentValueAdjusted = scaleHuman(
    assetPaymentValue,
    feeAsset.decimals,
  )

  return Big(1)
    .div(assetPaymentValueAdjusted)
    .mul(feeEstimateNative)
    .toFixed(feeAsset.decimals)
}

export const isPermitFeeEstimation = (feeAssetId: string) =>
  feeAssetId !== NATIVE_EVM_ASSET_ID

export const estimateEvmFee = async (
  rpc: TProviderContext,
  address: string,
  anyTx: AnyTransaction,
  feeAsset: TAsset,
  native: TAsset,
): Promise<FeeEstimate> => {
  const wei = await getEvmGasFeeWei(rpc, address, anyTx)

  const feeEstimateNative = await evmWeiToNativeFee(rpc, wei, native.id)

  return {
    feeEstimateNative,
    feeEstimate: formatEther(wei),
    feeAssetId: feeAsset.id,
  }
}

export const estimatePermitFee = async (
  rpc: TProviderContext,
  address: string,
  anyTx: AnyTransaction,
  feeAsset: TAsset,
  native: TAsset,
): Promise<FeeEstimate> => {
  const wei = await getEvmGasFeeWei(rpc, address, anyTx)

  const feeEstimateNative = await evmWeiToNativeFee(rpc, wei, native.id)

  const feeEstimate = await convertNativeFeeToFeeAsset(
    rpc,
    feeEstimateNative,
    feeAsset,
    native,
  )

  return {
    feeEstimateNative,
    feeEstimate,
    feeAssetId: feeAsset.id,
  }
}
