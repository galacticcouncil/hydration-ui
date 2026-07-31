import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  DryRunError,
  formatPascalCaseToSentence,
  replaceAaveWithBorrow,
  safeConvertAnyToH160,
  safeStringify,
} from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import { Binary, Enum, SizedHex } from "polkadot-api"
import {
  Address,
  BaseError,
  decodeAbiParameters,
  decodeErrorResult,
  Hex,
  parseAbi,
  PublicClient,
  slice,
  toHex,
} from "viem"

import i18n from "@/i18n"
import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { Papi, TProviderContext } from "@/providers/rpcProvider"

/** Generous gas for eth_call-style simulation so reverts aren't masked as empty OOG */
const EVM_SIMULATION_GAS = 10_000_000n

const ERC20_ERRORS_ABI = parseAbi([
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InvalidSender(address sender)",
  "error ERC20InvalidReceiver(address receiver)",
  "error ERC20InvalidApprover(address approver)",
  "error ERC20InvalidSpender(address spender)",
])

type DryRunCallResult = Awaited<
  ReturnType<TProviderContext["papi"]["apis"]["DryRunApi"]["dry_run_call"]>
>
type DryRunSuccessResult = Extract<DryRunCallResult, { success: true }>
type EvmCallInfoResult = Awaited<
  ReturnType<TProviderContext["papi"]["apis"]["EthereumRuntimeRPCApi"]["call"]>
>
type EvmExitReason = Extract<
  EvmCallInfoResult,
  { success: true }
>["value"]["exit_reason"]

const ERROR_STRING_SELECTOR = "0x08c379a0"
const PANIC_SELECTOR = "0x4e487b71"

/** Aave Pool Error(string) codes → Dispatcher metadata keys (hydration-node EvmErrorDecoder) */
const AAVE_ERROR_TO_DISPATCHER: Record<string, string> = {
  "29": "Dispatcher.AaveReservePaused",
  "35": "Dispatcher.AaveHealthFactorLowerThanLiquidationThreshold",
  "36": "Dispatcher.CollateralCannotCoverNewBorrow",
  "45": "Dispatcher.AaveHealthFactorNotBelowThreshold",
  "50": "Dispatcher.AaveBorrowCapExceeded",
  "51": "Dispatcher.AaveSupplyCapExceeded",
}

/** Fallback copy for Aave codes not wired to Dispatcher errors */
const AAVE_ERROR_KEYS = {
  "26": "error.aave.amountMustBeGreaterThanZero",
  "27": "error.aave.reserveNotActive",
  "28": "error.aave.reserveFrozen",
  "29": "error.aave.reservePaused",
  "30": "error.aave.borrowingNotEnabled",
  "32": "error.aave.withdrawExceedsBalance",
  "34": "error.aave.collateralBalanceZero",
  "35": "error.aave.healthFactorBelowLiquidationThreshold",
  "36": "error.aave.collateralCannotCoverNewBorrow",
  "43": "error.aave.underlyingBalanceMustBeGreaterThanZero",
  "45": "error.aave.healthFactorNotBelowThreshold",
  "50": "error.aave.borrowCapExceeded",
  "51": "error.aave.supplyCapExceeded",
  "52": "error.aave.unbackedMintCapExceeded",
  "53": "error.aave.debtCeilingExceeded",
  "57": "error.aave.ltvValidationFailed",
  "60": "error.aave.assetNotBorrowableInIsolation",
  "62": "error.aave.userInIsolationMode",
  "82": "error.aave.assetNotListed",
  "89": "error.aave.siloedBorrowingViolation",
} as const

type AaveErrorCode = keyof typeof AAVE_ERROR_KEYS

const toU256 = (value = 0n): [bigint, bigint, bigint, bigint] => [
  value,
  0n,
  0n,
  0n,
]

const isEvmExecutedFailed = (result: DryRunSuccessResult): boolean =>
  result.value.emitted_events.some(
    (event) => event.type === "EVM" && event.value.type === "ExecutedFailed",
  )

const formatExitReason = (exitReason: EvmExitReason): string => {
  switch (exitReason.type) {
    case "Succeed":
      return formatPascalCaseToSentence(exitReason.value.type)
    case "Revert":
      return "EVM execution reverted"
    case "Error":
      return formatPascalCaseToSentence(exitReason.value.type)
    case "Fatal":
      if (exitReason.value.type === "Other") {
        return exitReason.value.value
      }
      if (exitReason.value.type === "CallErrorAsFatal") {
        return formatPascalCaseToSentence(exitReason.value.value.type)
      }
      return formatPascalCaseToSentence(exitReason.value.type)
  }
}

const toRevertHex = (data: Uint8Array | Hex | undefined): Hex | undefined => {
  if (!data) return undefined
  if (typeof data === "string") return data.length > 2 ? data : undefined
  if (!data.length) return undefined
  return toHex(data)
}

const decodeEvmRevertData = (
  data: Uint8Array | Hex | undefined,
): string | undefined => {
  const hex = toRevertHex(data)
  if (!hex) return undefined

  if (hex.startsWith(ERROR_STRING_SELECTOR)) {
    try {
      const [message] = decodeAbiParameters([{ type: "string" }], slice(hex, 4))
      if (typeof message !== "string" || !message) return undefined

      if (message in AAVE_ERROR_KEYS) {
        return i18n.t(AAVE_ERROR_KEYS[message as AaveErrorCode])
      }

      return message
    } catch {
      return undefined
    }
  }

  if (hex.startsWith(PANIC_SELECTOR) && hex.length >= 10) {
    const code = Number(BigInt(slice(hex, 4)))
    if (code === 0x11) return "Arithmetic overflow or underflow"
    return `Panic (${code})`
  }

  try {
    const decoded = decodeErrorResult({ abi: ERC20_ERRORS_ABI, data: hex })
    switch (decoded.errorName) {
      case "ERC20InsufficientBalance":
        return "Insufficient token balance"
      case "ERC20InsufficientAllowance":
        return "Insufficient token allowance"
      default:
        return formatPascalCaseToSentence(decoded.errorName)
    }
  } catch {
    return undefined
  }
}

const getAaveDispatcherErrorKey = (
  data: Uint8Array | Hex | undefined,
): string | undefined => {
  const hex = toRevertHex(data)
  if (!hex?.startsWith(ERROR_STRING_SELECTOR)) return undefined

  try {
    const [message] = decodeAbiParameters([{ type: "string" }], slice(hex, 4))
    if (typeof message !== "string") return undefined
    return AAVE_ERROR_TO_DISPATCHER[message]
  } catch {
    return undefined
  }
}

const extractRevertDataFromViemError = (error: unknown): Hex | undefined => {
  if (!(error instanceof BaseError)) return undefined

  const withData = error.walk((err) => {
    if (!err || typeof err !== "object" || !("data" in err)) return false
    const data = (err as { data?: unknown }).data
    if (typeof data === "string" && data.startsWith("0x") && data.length > 2) {
      return true
    }
    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      typeof (data as { data?: unknown }).data === "string"
    ) {
      return true
    }
    return false
  }) as { data?: Hex | { data?: Hex } } | null

  if (!withData?.data) return undefined
  return typeof withData.data === "string" ? withData.data : withData.data.data
}

const resolveRevertMessage = async (
  dryRunErrorDecoder: TProviderContext["dryRunErrorDecoder"],
  revertData: Uint8Array | Hex | undefined,
  exitReason?: EvmExitReason,
): Promise<DryRunError | null> => {
  const dispatcherKey = getAaveDispatcherErrorKey(revertData)
  if (dispatcherKey) {
    const error = await dryRunErrorDecoder.parseError(dispatcherKey)
    if (error?.name) {
      return {
        name: replaceAaveWithBorrow(error.name),
        description: error.description
          ? replaceAaveWithBorrow(error.description)
          : undefined,
      }
    }
  }

  const decoded = decodeEvmRevertData(revertData)
  if (decoded) {
    return { name: replaceAaveWithBorrow(decoded) }
  }

  if (exitReason) {
    return { name: formatExitReason(exitReason) }
  }

  return null
}

/**
 * ExitReason::Revert has no payload — revert bytes live in CallInfo.value.
 * Low/zero gas often yields Revert with empty value (OOG in a subcall).
 */
const resolveEvmCallFailure = async (
  papi: Papi,
  evm: PublicClient,
  dryRunErrorDecoder: TProviderContext["dryRunErrorDecoder"],
  tx: ExtendedEvmCall,
  address: string,
): Promise<DryRunError | null> => {
  const from = (tx.from || safeConvertAnyToH160(address)) as SizedHex<20>
  if (!from || !tx.to || !tx.data) return null

  // Always use ample gas for simulation — tight/zero gas yields Revert with empty value
  const result = await papi.apis.EthereumRuntimeRPCApi.call(
    from,
    tx.to as SizedHex<20>,
    Binary.fromHex(tx.data),
    toU256(tx.value ?? 0n),
    toU256(EVM_SIMULATION_GAS),
    undefined,
    undefined,
    undefined,
    true, // estimate mode — works for bound addresses on older runtimes
    undefined,
    undefined,
  )

  if (!result.success) {
    const error = await dryRunErrorDecoder.parseError(result.value)
    return error
      ? { ...error, name: replaceAaveWithBorrow(error.name) }
      : { name: "EVM call validation failed" }
  }

  // CallInfo.value = return/revert bytes; exit_reason.Revert never carries data
  const { exit_reason: exitReason, value } = result.value
  if (exitReason.type === "Succeed") return null

  const fromRuntime = await resolveRevertMessage(
    dryRunErrorDecoder,
    value,
    exitReason,
  )
  if (fromRuntime && toRevertHex(value)) return fromRuntime

  // Retry via eth_call (viem sometimes surfaces reason on the thrown error)
  try {
    await evm.call({
      account: from as Address,
      to: tx.to as Address,
      data: tx.data as Hex,
      value: tx.value,
      gas: EVM_SIMULATION_GAS,
    })
  } catch (error) {
    const revertData = extractRevertDataFromViemError(error)
    const fromViem = await resolveRevertMessage(
      dryRunErrorDecoder,
      revertData,
      exitReason,
    )
    if (fromViem && toRevertHex(revertData)) return fromViem

    if (error instanceof BaseError && error.shortMessage) {
      const msg = error.shortMessage
      // Avoid generic viem noise when we already know it's an empty revert
      if (!msg.toLowerCase().includes("execution reverted")) {
        return { name: replaceAaveWithBorrow(msg) }
      }
    }
  }

  return fromRuntime ?? { name: "EVM execution reverted" }
}

export const papiDryRunErrorQuery = (
  { papi, evm, dryRunErrorDecoder }: TProviderContext,
  address: string,
  tx: AnyTransaction,
  debug?: boolean,
) =>
  queryOptions({
    queryKey: ["dryRun", "papi", address, safeStringify(tx)],
    queryFn: async (): Promise<DryRunError | null> => {
      try {
        const evmCall = isEvmCall(tx) ? tx : null

        const papiTx = (() => {
          if (isPapiTransaction(tx)) return tx

          if (evmCall) {
            // Match submit path: Dispatcher fails the extrinsic on EVM revert
            return papi.tx.Dispatcher.dispatch_evm_call({
              call: transformEvmCallToPapiTx(papi, evmCall).decodedCall,
            })
          }

          return null
        })()

        if (!papiTx) return null

        const origin = Enum("system", Enum("Signed", address))
        const result = await papi.apis.DryRunApi.dry_run_call(
          origin,
          // @ts-expect-error contains structured call data
          papiTx.decodedCall,
          1,
        )

        if (!result.success) return null

        const failedAsExtrinsic = !result.value.execution_result.success
        const failedAsEvmEvent = isEvmExecutedFailed(result)

        if (!failedAsExtrinsic && !failedAsEvmEvent) return null

        if (evmCall) {
          const evmError = await resolveEvmCallFailure(
            papi,
            evm,
            dryRunErrorDecoder,
            evmCall,
            address,
          )
          if (evmError) {
            if (debug) {
              console.log(
                new Date().toLocaleTimeString(),
                evmError.name,
                decodeTx(papiTx),
              )
            }
            return evmError
          }
        }

        const executionResult = result.value.execution_result
        if (!executionResult.success) {
          const error = await dryRunErrorDecoder.parseError(
            executionResult.value.error,
          )

          if (debug && error) {
            console.log(
              new Date().toLocaleTimeString(),
              error.name,
              decodeTx(papiTx),
            )
          }

          return error
            ? { ...error, name: replaceAaveWithBorrow(error.name) }
            : null
        }

        return { name: "EVM execution failed" }
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
