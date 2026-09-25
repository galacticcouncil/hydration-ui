import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  getAddressFromAssetId,
  safeConvertSS58toH160,
  safeStringify,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  type Abi,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  parseUnits,
} from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { EVM_CALL_GAS } from "@/modules/strategies/propeller/constants"
import { withdrawalRowId } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  type TransactionOptions,
  useTransactionsStore,
} from "@/states/transactions"

type VaultWriteOptions = {
  onSuccess?: () => void
}

interface BatchEvmCall {
  to: Hex
  data: Hex
  abi: Abi
}

function useVaultEvmCall(writeOptions: VaultWriteOptions = {}) {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const onWriteSuccess = writeOptions.onSuccess

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  // accountBalances is a live subscription and updates itself; invalidating it
  // would reset every balance in the app to pending.
  const invalidateVault = useCallback(
    (vaultAddress: Hex) =>
      queryClient.invalidateQueries({
        queryKey: propellerQueryKeys.vault(vaultAddress),
      }),
    [queryClient],
  )

  const txOptionsForVault = useCallback(
    (vaultAddress: Hex): TransactionOptions => ({
      onSuccess: () => {
        invalidateVault(vaultAddress)
        if (isBound === false) {
          queryClient.invalidateQueries(evmAccountBindingQuery(rpc, address))
        }
        onWriteSuccess?.()
      },
      resolveOn: "success",
    }),
    [address, invalidateVault, isBound, onWriteSuccess, queryClient, rpc],
  )

  const submitTx = useCallback(
    async (
      vaultAddress: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
    ) => {
      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to: vaultAddress,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        abi: safeStringify(abi),
      }

      // Batch bind + evm call when the account is not yet mapped to EVM.
      if (isBound === false) {
        const bindTx = rpc.papi.tx.EVMAccounts.bind_evm_address()
        const evmPapiTx = transformEvmCallToPapiTx(rpc.papi, evmCall)
        const batchTx = rpc.papi.tx.Utility.batch_all({
          calls: [bindTx.decodedCall, evmPapiTx.decodedCall],
        })

        return createTransaction(
          { tx: batchTx, toasts },
          txOptionsForVault(vaultAddress),
        )
      }

      return createTransaction(
        { tx: evmCall, toasts },
        txOptionsForVault(vaultAddress),
      )
    },
    [evmAddress, isBound, rpc, createTransaction, txOptionsForVault],
  )

  /**
   * Submit EVM calls as one substrate Utility.batch_all.
   * Prepends bind_evm_address when the account is not yet mapped.
   */
  const submitBatch = useCallback(
    async (
      vaultAddress: Hex,
      calls: BatchEvmCall[],
      toasts: { submitted: string; success: string },
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
        txOptionsForVault(vaultAddress),
      )
    },
    [evmAddress, isBound, rpc, createTransaction, txOptionsForVault],
  )

  return { evmAddress, submitTx, submitBatch }
}

export function useDeposit(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common"])
  const { evm } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitBatch } = useVaultEvmCall(options)
  const { vaultAddress, assetId } = vault
  const assetAddress = getAddressFromAssetId(assetId) as Hex
  const { decimals, symbol } = getAssetWithFallback(assetId)

  return useMutation({
    mutationFn: async (assetAmount: string) => {
      const assetBig = parseUnits(assetAmount, decimals)
      const calls: BatchEvmCall[] = []

      const assetAllowance = await evm.readContract({
        address: assetAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [evmAddress, vaultAddress],
      })

      if (assetAllowance < assetBig) {
        calls.push({
          to: assetAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [vaultAddress, assetBig],
          }),
          abi: [...erc20Abi],
        })
      }

      calls.push({
        to: vaultAddress,
        data: encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [assetBig, evmAddress],
        }),
        abi: [...VAULT_ABI],
      })

      const fmt = t("currency", {
        value: assetAmount,
        symbol,
        maximumFractionDigits: 4,
      })
      return submitBatch(vaultAddress, calls, {
        submitted: `Depositing ${fmt}...`,
        success: `${fmt} deposited`,
      })
    },
  })
}

export function useRequestRedeem(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common"])
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitTx } = useVaultEvmCall(options)
  const { vaultAddress, assetId, shareSymbol } = vault
  const decimals = getAssetWithFallback(assetId).decimals

  return useMutation({
    mutationFn: (shareAmount: string) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(shareAmount, decimals), evmAddress],
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

export type ClaimVariables = {
  vault: PropellerVaultConfig
  requestId: number
}

export function useClaim(options: VaultWriteOptions = {}) {
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitTx } = useVaultEvmCall(options)

  return useMutation({
    mutationKey: propellerQueryKeys.claim(),
    mutationFn: ({ vault, requestId }: ClaimVariables) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "claim",
        args: [BigInt(requestId), evmAddress],
      })
      const { symbol } = getAssetWithFallback(vault.assetId)
      return submitTx(vault.vaultAddress, data, [...VAULT_ABI], {
        submitted: `Claiming ${symbol}...`,
        success: "Claim sent",
      })
    },
  })
}

/** Withdrawal row ids (`vaultAddress:requestId`) with a claim in flight. */
export function usePendingClaimIds() {
  return useMutationState({
    filters: { mutationKey: propellerQueryKeys.claim(), status: "pending" },
    select: (mutation) => {
      const { vault, requestId } = mutation.state.variables as ClaimVariables
      return withdrawalRowId(vault.vaultAddress, requestId)
    },
  })
}
