import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import i18n from "@/i18n"
import {
  AAVE_INTEREST_RATE_MODE_VARIABLE,
  EVM_CALL_GAS,
  BIL_POOL_ABI,
  BIL_POOL_ADDRESS,
  HOLLAR_ADDRESS,
} from "@/modules/strategies/bil/constants"
import { BIL_QUERY_KEY_PREFIX } from "@/modules/strategies/bil/utils/queryKeys"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

/**
 * Internal helper. Submits a single EVM call against the BIL Aave pool
 * (or any other contract reachable via `getVaultEvmClient()`) through the
 * project's `useTransactionsStore`. Mirrors the pattern in `useVaultWrites`
 * but invalidates the pool-position query keys on success rather than the
 * vault keys.
 *
 * If the connected account isn't yet bound to its EVM mapping, the EVM
 * call is wrapped in a substrate `Utility.batch_all([bind, evm_call])` so
 * the binding happens atomically with the first borrow / supply.
 */
function useBilPoolEvmCall() {
  const { evm } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const rpc = useRpcProvider()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const submitTx = useCallback(
    async (data: Hex, toasts: { submitted: string; success: string }) => {
      const gasPrice = await evm.getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCall = {
        from: evmAddress,
        to: BIL_POOL_ADDRESS,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPricePlus,
        maxPriorityFeePerGas: gasPricePlus,
        abi: safeStringify([...BIL_POOL_ABI]),
      }

      if (isBound === false) {
        const bindTx = rpc.papi.tx.EVMAccounts.bind_evm_address()
        const evmPapiTx = transformEvmCallToPapiTx(rpc.papi, evmCall)
        const batchTx = rpc.papi.tx.Utility.batch_all({
          calls: [bindTx.decodedCall, evmPapiTx.decodedCall],
        })
        return createTransaction({
          tx: batchTx,
          toasts,
          invalidateQueries: [
            [BIL_QUERY_KEY_PREFIX],
            evmAccountBindingQuery(rpc, address).queryKey,
          ],
        })
      }

      return createTransaction({
        tx: evmCall,
        toasts,
        invalidateQueries: [
          [BIL_QUERY_KEY_PREFIX],
          evmAccountBindingQuery(rpc, address).queryKey,
        ],
      })
    },
    [evmAddress, isBound, rpc, address, createTransaction, evm],
  )

  return { evmAddress, submitTx }
}

/**
 * Borrow HOLLAR against the user's BIL collateral on the BIL Aave pool.
 *
 * Uses interestRateMode=2 (variable) — the GhoAToken facilitator rejects
 * stable-rate borrows, and stable-rate has been deprecated across Aave V3
 * generally.
 */
export function useBorrowHollar() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitTx } = useBilPoolEvmCall()

  return useMutation({
    mutationFn: (hollarAmount: number) => {
      const data = encodeFunctionData({
        abi: BIL_POOL_ABI,
        functionName: "borrow",
        args: [
          HOLLAR_ADDRESS,
          parseUnits(hollarAmount.toString(), 18),
          AAVE_INTEREST_RATE_MODE_VARIABLE,
          0, // referralCode
          evmAddress,
        ],
      })

      const fmt = t("common:currency", {
        value: hollarAmount,
        symbol: "HOLLAR",
        maximumFractionDigits: 2,
      })
      return submitTx(data, {
        submitted: `Borrowing ${fmt}...`,
        success: `${fmt} borrowed`,
      })
    },
  })
}

/**
 * Repay HOLLAR debt on the BIL Aave pool.
 *
 * Mirrors `useBorrowHollar` — single `pool.repay(asset, amount, mode, onBehalfOf)`
 * EVM call routed through the project's transaction store. Uses variable rate
 * mode (=2) to match the borrow side. Pass `Number.MAX_SAFE_INTEGER` semantics
 * via the upstream caller to repay the full debt; the call here just forwards
 * the parsed wei amount unchanged.
 */
export function useRepayHollar() {
  const { evmAddress, submitTx } = useBilPoolEvmCall()

  return useMutation({
    mutationFn: (hollarAmount: number) => {
      const data = encodeFunctionData({
        abi: BIL_POOL_ABI,
        functionName: "repay",
        args: [
          HOLLAR_ADDRESS,
          parseUnits(hollarAmount.toString(), 18),
          AAVE_INTEREST_RATE_MODE_VARIABLE,
          evmAddress,
        ],
      })

      const fmt = i18n.t("common:currency", {
        value: hollarAmount,
        symbol: "HOLLAR",
        maximumFractionDigits: 2,
      })
      return submitTx(data, {
        submitted: `Repaying ${fmt}...`,
        success: `${fmt} repaid`,
      })
    },
  })
}
