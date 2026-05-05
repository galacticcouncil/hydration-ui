import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import {
  AAVE_INTEREST_RATE_MODE_VARIABLE,
  EVM_CALL_GAS,
  getVaultEvmClient,
  HDCL_POOL_ABI,
  HDCL_POOL_ADDRESS,
  HOLLAR_ADDRESS,
} from "@/modules/hdcl-vault/constants"
import { formatNumber } from "@/modules/hdcl-vault/utils/format"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

/**
 * Internal helper. Submits a single EVM call against the HDCL Aave pool
 * (or any other contract reachable via `getVaultEvmClient()`) through the
 * project's `useTransactionsStore`. Mirrors the pattern in `useVaultWrites`
 * but invalidates the pool-position query keys on success rather than the
 * vault keys.
 *
 * If the connected account isn't yet bound to its EVM mapping, the EVM
 * call is wrapped in a substrate `Utility.batch_all([bind, evm_call])` so
 * the binding happens atomically with the first borrow / supply.
 */
function useHdclPoolEvmCall() {
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const submitTx = useCallback(
    async (data: Hex, toasts: { submitted: string; success: string }) => {
      const gasPrice = await getVaultEvmClient().getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCall = {
        from: evmAddress,
        to: HDCL_POOL_ADDRESS,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPricePlus,
        maxPriorityFeePerGas: gasPricePlus,
        abi: safeStringify([...HDCL_POOL_ABI]),
      }

      const onSuccess = () => {
        // Pool reads and any vault-side reads that depend on user state.
        queryClient.invalidateQueries({ queryKey: ["hdcl-pool-position"] })
        queryClient.invalidateQueries({ queryKey: ["hdcl-vault"] })
      }

      if (isBound === false) {
        const bindTx = rpc.papi.tx.EVMAccounts.bind_evm_address()
        const evmPapiTx = transformEvmCallToPapiTx(rpc.papi, evmCall)
        const batchTx = rpc.papi.tx.Utility.batch_all({
          calls: [bindTx.decodedCall, evmPapiTx.decodedCall],
        })
        return createTransaction(
          { tx: batchTx, toasts },
          {
            onSuccess: () => {
              onSuccess()
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            },
          },
        )
      }

      return createTransaction({ tx: evmCall, toasts }, { onSuccess })
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
  )

  return { evmAddress, submitTx }
}

/**
 * Borrow HOLLAR against the user's HDCL collateral on the HDCL Aave pool.
 *
 * Uses interestRateMode=2 (variable) — the GhoAToken facilitator rejects
 * stable-rate borrows, and stable-rate has been deprecated across Aave V3
 * generally.
 */
export function useBorrowHollar() {
  const { evmAddress, submitTx } = useHdclPoolEvmCall()

  return useMutation({
    mutationFn: (hollarAmount: number) => {
      const data = encodeFunctionData({
        abi: HDCL_POOL_ABI,
        functionName: "borrow",
        args: [
          HOLLAR_ADDRESS,
          parseUnits(hollarAmount.toString(), 18),
          AAVE_INTEREST_RATE_MODE_VARIABLE,
          0, // referralCode
          evmAddress,
        ],
      })

      const fmt = formatNumber(hollarAmount, 2)
      return submitTx(data, {
        submitted: `Borrowing ${fmt} HOLLAR...`,
        success: `${fmt} HOLLAR borrowed`,
      })
    },
  })
}
