import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { HYDRATION_CHAIN_KEY, isBinary } from "@galacticcouncil/utils"
import { PermitResult } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"
import { Binary, CompatibilityToken } from "polkadot-api"
import { first, isObjectType } from "remeda"

import { weightToEvmFeeQuery } from "@/api/evm"
import { paymentInfoQuery } from "@/api/transaction"
import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import {
  AnyPapiTx,
  AnyTransaction,
  TxOptions,
} from "@/modules/transactions/types"
import {
  isBatchDecodedCallValue,
  isDecodedCallEnum,
  isPapiTransaction,
} from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { Papi, TProviderContext } from "@/providers/rpcProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const transformPermitToPapiTx = (
  papi: Papi,
  permit: PermitResult,
): AnyPapiTx => {
  return papi.tx.MultiTransactionPayment.dispatch_permit({
    data: Binary.fromHex(permit.message.data),
    from: Binary.fromHex(permit.message.from),
    to: Binary.fromHex(permit.message.to),
    value: [BigInt(permit.message.value), 0n, 0n, 0n],
    gas_limit: BigInt(permit.message.gaslimit),
    deadline: [BigInt(permit.message.deadline), 0n, 0n, 0n],
    v: Number(permit.signature.v),
    r: Binary.fromHex(permit.signature.r),
    s: Binary.fromHex(permit.signature.s),
  })
}

export const transformEvmCallToPapiTx = (
  papi: Papi,
  tx: ExtendedEvmCall,
): AnyPapiTx => {
  return papi.tx.EVM.call({
    source: Binary.fromHex(tx.from),
    target: Binary.fromHex(tx.to),
    input: Binary.fromHex(tx.data),
    value: [0n, 0n, 0n, 0n],
    gas_limit: tx.gasLimit || 0n,
    max_fee_per_gas: [tx.maxFeePerGas || 0n, 0n, 0n, 0n],
    max_priority_fee_per_gas: [tx.maxPriorityFeePerGas || 0n, 0n, 0n, 0n],
    access_list: [],
    authorization_list: [],
    nonce: undefined,
  })
}

export const transformAnyToPapiTx = (
  papi: Papi,
  tx: AnyTransaction,
): AnyPapiTx | null => {
  if (isPapiTransaction(tx)) {
    return tx
  }

  if (isEvmCall(tx)) {
    return transformEvmCallToPapiTx(papi, tx)
  }

  return null
}

export function containsEvmCall(tx: AnyTransaction): boolean {
  if (!isPapiTransaction(tx)) return false

  const decoded = tx.decodedCall
  if (!isDecodedCallEnum(decoded)) return false

  if (decoded.type === "EVM") return true

  if (decoded.type === "Utility" && isBatchDecodedCallValue(decoded.value)) {
    return decoded.value.value.calls.some(
      (call) => isDecodedCallEnum(call) && call.type === "EVM",
    )
  }

  return false
}

export function prependEvmBindingTx(papi: Papi, tx: AnyPapiTx): AnyPapiTx {
  const bindTx = papi.tx.EVMAccounts.bind_evm_address()
  const decoded = tx.decodedCall

  if (
    isDecodedCallEnum(decoded) &&
    decoded.type === "Utility" &&
    isBatchDecodedCallValue(decoded.value)
  ) {
    return papi.tx.Utility.batch_all({
      calls: [bindTx.decodedCall, ...decoded.value.value.calls],
    })
  }

  return papi.tx.Utility.batch_all({
    calls: [bindTx.decodedCall, tx.decodedCall],
  })
}

export const isValidTxOptionsForPermit = (txOptions: TxOptions) =>
  txOptions.chainKey === HYDRATION_CHAIN_KEY &&
  txOptions.feeAssetId !== NATIVE_EVM_ASSET_ID

export const isValidEvmCallForPermit = (
  tx: AnyTransaction,
  txOptions: TxOptions,
): tx is ExtendedEvmCall =>
  isEvmCall(tx) && isValidTxOptionsForPermit(txOptions)

export const isValidPapiTxForPermit = (
  tx: AnyTransaction,
  txOptions: TxOptions,
): tx is AnyPapiTx =>
  isPapiTransaction(tx) && isValidTxOptionsForPermit(txOptions)

export const getPapiTransactionCallData = (
  tx: AnyTransaction,
  papiCompatibilityToken: CompatibilityToken,
): string => {
  if (!isPapiTransaction(tx)) return ""

  try {
    const binary = tx.getEncodedData(papiCompatibilityToken)
    return isBinary(binary) ? binary.asHex() : ""
  } catch {
    return ""
  }
}

export const getExtraTxFeeByWeight = async (
  rpc: TProviderContext,
  address: string,
  tx: AnyTransaction,
  assetOutId: string,
): Promise<string | null> => {
  const { queryClient } = rpc
  const info = await queryClient.ensureQueryData(
    paymentInfoQuery(rpc, address, tx),
  )
  if (!info) return null

  const weight = info.weight.ref_time

  return queryClient.ensureQueryData(
    weightToEvmFeeQuery(rpc, weight, assetOutId),
  )
}

export const parseTxMethodName = (
  tx: AnyTransaction,
  path?: string,
): string | undefined => {
  if (!isPapiTransaction(tx)) return
  try {
    const call = tx ? decodeTx(tx, path) : null
    if (isObjectType(call)) {
      return first(Object.keys(call))
    }
  } catch {
    return
  }
}
