import {
  safeConvertSS58toH160,
  safeStringify,
  UINT256_MAX,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import i18n from "@/i18n"
import {
  AAVE_INTEREST_RATE_MODE_VARIABLE,
  BIL_POOL_ABI,
  BIL_POOL_ADDRESS,
  EVM_CALL_GAS,
  HOLLAR_ADDRESS,
} from "@/modules/strategies/bil/constants"
import { BIL_QUERY_KEY_PREFIX } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

/**
 * Internal helper. Submits a single EVM call against the BIL Aave pool
 * (or any other contract reachable via `getVaultEvmClient()`) through the
 * project's `useTransactionsStore`. Mirrors the pattern in `useVaultWrites`
 * but invalidates the pool-position query keys on success rather than the
 * vault keys.
 */
function useBilPoolEvmCall() {
  const { evm } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()

  const evmAddress = safeConvertSS58toH160(account?.address ?? "") as Hex

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

      return createTransaction({
        tx: evmCall,
        toasts,
        invalidateQueries: [[BIL_QUERY_KEY_PREFIX]],
      })
    },
    [evmAddress, createTransaction, evm],
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
 * mode (=2) to match the borrow side. When repaying the full debt, pass
 * `repayAll: true` so the call uses `UINT256_MAX` (Aave's "repay everything"
 * sentinel) instead of a fixed wei amount that may drift with accrued interest.
 */
export function useRepayHollar() {
  const { evmAddress, submitTx } = useBilPoolEvmCall()

  return useMutation({
    mutationFn: ({
      amount,
      repayAll,
    }: {
      amount: number
      repayAll?: boolean
    }) => {
      const data = encodeFunctionData({
        abi: BIL_POOL_ABI,
        functionName: "repay",
        args: [
          HOLLAR_ADDRESS,
          repayAll ? UINT256_MAX : parseUnits(amount.toString(), 18),
          AAVE_INTEREST_RATE_MODE_VARIABLE,
          evmAddress,
        ],
      })

      const fmt = i18n.t("common:currency", {
        value: amount,
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
