import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { type Abi, encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import {
  ERC20_ABI,
  EVM_CALL_GAS,
  VAULT_ABI,
} from "@/modules/strategies/propeller/constants"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

/** A single EVM call to be wrapped + bundled into a substrate batch. */
interface BatchEvmCall {
  to: Hex
  data: Hex
  abi: Abi
}

function useVaultEvmCall() {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const submitTx = useCallback(
    async (
      to: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
    ) => {
      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        abi: safeStringify(abi),
      }

      // If account not yet bound to EVM, batch bind + evm call
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
              queryClient.invalidateQueries({ queryKey: ["propeller-vault"] })
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            },
          },
        )
      }

      return createTransaction(
        { tx: evmCall, toasts },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["propeller-vault"] })
          },
        },
      )
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
  )

  /**
   * Submit N EVM calls atomically as a single substrate `Utility.batch_all`.
   * Each call is wrapped through `transformEvmCallToPapiTx` then bundled.
   * If the user isn't yet bound to their EVM mapping, prepends the bind tx
   * to the same batch so binding happens atomically with the first call.
   *
   * Used by the deposit flow (ETH.approve → vault.deposit).
   */
  const submitBatch = useCallback(
    async (
      calls: BatchEvmCall[],
      toasts: { submitted: string; success: string },
      invalidateKeys: string[][] = [["propeller-vault"]],
    ) => {
      if (calls.length === 0) {
        throw new Error("submitBatch called with no calls")
      }

      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCalls = calls.map(({ to, data, abi }) => ({
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        abi: safeStringify(abi),
      }))

      const papiCalls = evmCalls.map(
        (c) => transformEvmCallToPapiTx(rpc.papi, c).decodedCall,
      )

      const batchInner =
        isBound === false
          ? [
              rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              ...papiCalls,
            ]
          : papiCalls

      const batchTx = rpc.papi.tx.Utility.batch_all({ calls: batchInner })

      return createTransaction(
        { tx: batchTx, toasts },
        {
          onSuccess: () => {
            for (const k of invalidateKeys) {
              queryClient.invalidateQueries({ queryKey: k })
            }
            if (isBound === false) {
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            }
          },
        },
      )
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
  )

  return { evmAddress, submitTx, submitBatch }
}

/**
 * Deposit ETH and end up holding pETH shares.
 *
 * Vault pulls ETH via ERC-4626 `deposit(assets, receiver)`, so we approve
 * the vault for the ETH amount (if needed) then call deposit. Both calls are
 * bundled into a single substrate `Utility.batch_all`.
 */
export function useDeposit() {
  const { t } = useTranslation(["common"])
  const { evm } = useRpcProvider()
  const { evmAddress, submitBatch } = useVaultEvmCall()
  const { vaultAddress, assetAddress, symbol } = useActivePropellerVault()

  return useMutation({
    mutationFn: async (ethAmount: number) => {
      const ethBig = parseUnits(ethAmount.toString(), 18)
      const calls: BatchEvmCall[] = []

      const ethAllowance = await evm.readContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [evmAddress, vaultAddress],
      })

      if (ethAllowance < ethBig) {
        calls.push({
          to: assetAddress,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, ethBig],
          }),
          abi: [...ERC20_ABI],
        })
      }

      calls.push({
        to: vaultAddress,
        data: encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [ethBig, evmAddress],
        }),
        abi: [...VAULT_ABI],
      })

      const fmt = t("currency", {
        value: ethAmount,
        symbol,
        maximumFractionDigits: 4,
      })
      return submitBatch(calls, {
        submitted: `Depositing ${fmt}...`,
        success: `${fmt} deposited`,
      })
    },
  })
}

/**
 * Request an async redemption of `shares` pETH back to ETH.
 *
 * `requestRedeem(shares, owner)` escrows the shares and appends a request to
 * the queue. The keeper later unwinds the loop and settles the request; the
 * user then calls `claim(requestId, receiver)` to collect their ETH.
 */
export function useRequestRedeem() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitTx } = useVaultEvmCall()
  const { vaultAddress, shareSymbol } = useActivePropellerVault()

  return useMutation({
    mutationFn: (shareAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(shareAmount.toString(), 18), evmAddress],
      })

      const fmt = t("currency", {
        value: shareAmount,
        symbol: shareSymbol,
        maximumFractionDigits: 4,
      })
      return submitTx(vaultAddress, data, [...VAULT_ABI], {
        submitted: `Requesting ${fmt} withdrawal...`,
        success: `${fmt} withdrawal requested`,
      })
    },
  })
}

/**
 * Claim a single settled redemption request — pays the owed ETH out to the
 * caller's own address. `requestId` comes from the redemption queue read.
 */
export function useClaim() {
  const { evmAddress, submitTx } = useVaultEvmCall()
  const { vaultAddress, symbol } = useActivePropellerVault()

  return useMutation({
    mutationFn: (requestId: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "claim",
        args: [BigInt(requestId), evmAddress],
      })
      return submitTx(vaultAddress, data, [...VAULT_ABI], {
        submitted: `Claiming ${symbol}...`,
        success: "Claim sent",
      })
    },
  })
}
