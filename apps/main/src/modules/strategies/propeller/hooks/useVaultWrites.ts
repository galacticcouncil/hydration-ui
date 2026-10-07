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
  useQueryClient,
} from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import waitFor from "p-wait-for"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { type Abi, encodeFunctionData, formatUnits, type Hex } from "viem"

import { evmAccountBindingQuery, useErc20Allowance } from "@/api/evm"
import { PendingApproval } from "@/components/PendingApproval"
import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { EVM_CALL_GAS } from "@/modules/strategies/propeller/constants"
import { withdrawalRowId } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { parseExactAmount } from "@/modules/strategies/propeller/utils/amount"
import {
  prepareApproval,
  prepareFundedDeposit,
} from "@/modules/strategies/propeller/utils/deposit"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { prepareWithdrawalClaim } from "@/modules/strategies/propeller/utils/withdrawalClaim"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  type TransactionCommon,
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
  gas?: bigint
}

function useVaultEvmCall(writeOptions: VaultWriteOptions = {}) {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const onWriteSuccess = writeOptions.onSuccess

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

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
        queryClient.invalidateQueries(evmAccountBindingQuery(rpc, address))
        onWriteSuccess?.()
      },
      resolveOn: "success",
    }),
    [address, invalidateVault, onWriteSuccess, queryClient, rpc],
  )

  const submitTx = useCallback(
    async (
      vaultAddress: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
      review?: Pick<TransactionCommon, "title" | "description">,
    ) => {
      if (!address) throw new Error("Connect an account before continuing")
      const isBound = await queryClient.fetchQuery({
        ...evmAccountBindingQuery(rpc, address),
        staleTime: 0,
      })
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
          { tx: batchTx, toasts, ...review },
          txOptionsForVault(vaultAddress),
        )
      }

      return createTransaction(
        { tx: evmCall, toasts, ...review },
        txOptionsForVault(vaultAddress),
      )
    },
    [
      address,
      evmAddress,
      queryClient,
      rpc,
      createTransaction,
      txOptionsForVault,
    ],
  )

  /**
   * Build EVM calls as one substrate Utility.batch_all.
   * Prepends bind_evm_address when the account is not yet mapped.
   */
  const buildBatch = useCallback(
    async (calls: BatchEvmCall[]) => {
      if (calls.length === 0) {
        throw new Error("buildBatch called with no calls")
      }
      if (!address) throw new Error("Connect an account before continuing")
      const isBound = await queryClient.fetchQuery({
        ...evmAccountBindingQuery(rpc, address),
        staleTime: 0,
      })

      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCalls = calls.map(({ to, data, abi, gas }) => ({
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: gas ?? EVM_CALL_GAS,
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

      return rpc.papi.tx.Utility.batch_all({ calls: batchInner })
    },
    [address, evmAddress, queryClient, rpc],
  )

  const submitBatch = useCallback(
    async (
      vaultAddress: Hex,
      calls: BatchEvmCall[],
      toasts: { submitted: string; success: string },
      review?: Pick<TransactionCommon, "title" | "description">,
    ) =>
      createTransaction(
        { tx: await buildBatch(calls), toasts, ...review },
        txOptionsForVault(vaultAddress),
      ),
    [buildBatch, createTransaction, txOptionsForVault],
  )

  return {
    evmAddress,
    submitTx,
    submitBatch,
    buildBatch,
    createTransaction,
    txOptionsForVault,
  }
}

export function useDeposit(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common", "propeller"])
  const { evm } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const getErc20Allowance = useErc20Allowance()
  const { evmAddress, buildBatch, createTransaction, txOptionsForVault } =
    useVaultEvmCall(options)
  const { vaultAddress, assetId } = vault
  const assetAddress = getAddressFromAssetId(assetId) as Hex
  const { decimals, symbol } = getAssetWithFallback(assetId)

  return useMutation({
    mutationFn: async (assetAmount: string) => {
      const assetBig = parseExactAmount(assetAmount, decimals)
      const amount = t("currency", {
        value: assetAmount,
        symbol,
        maximumFractionDigits: 4,
      })
      const input = {
        vault: vaultAddress,
        asset: assetAddress,
        owner: evmAddress,
        amount: assetBig,
      }

      // Built only once the approval is visible on chain, so the simulation
      // and gas estimate run against the real allowance.
      const buildDeposit = async () => ({
        tx: await buildBatch([await prepareFundedDeposit(evm, input)]),
        toasts: {
          submitted: t("propeller:deposit.toast.submitted", { amount }),
          success: t("propeller:deposit.toast.success", { amount }),
        },
      })

      const approval = await prepareApproval(evm, input)
      if (!approval) {
        return createTransaction(
          await buildDeposit(),
          txOptionsForVault(vaultAddress),
        )
      }

      return createTransaction(
        {
          tx: [
            {
              tx: await buildBatch([approval]),
              stepTitle: t("propeller:deposit.step.approve"),
              toasts: {
                submitted: t("propeller:deposit.approve.toast.submitted", {
                  symbol,
                }),
                success: t("propeller:deposit.approve.toast.success", {
                  symbol,
                }),
              },
              pendingComponent: PendingApproval,
              beforeNext: async () => {
                await waitFor(
                  async () =>
                    (await getErc20Allowance(
                      assetAddress,
                      evmAddress,
                      vaultAddress,
                    )) >= assetBig,
                  {
                    interval: 1000,
                    timeout: {
                      milliseconds: minutesToMilliseconds(3),
                      message: t("propeller:deposit.approve.timeout"),
                    },
                  },
                )
              },
            },
            {
              tx: buildDeposit,
              stepTitle: t("deposit"),
              pendingComponent: PendingApproval,
            },
          ],
        },
        txOptionsForVault(vaultAddress),
      )
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
        args: [parseExactAmount(shareAmount, decimals), evmAddress],
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
  const { t } = useTranslation(["propeller", "common"])
  const { evm } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitBatch } = useVaultEvmCall(options)

  return useMutation({
    mutationKey: propellerQueryKeys.claim(),
    mutationFn: async ({ vault, requestId }: ClaimVariables) => {
      const { calls, collateral, surplusHollar } = await prepareWithdrawalClaim(
        evm,
        vault.vaultAddress,
        requestId,
        evmAddress,
      )
      if (calls.length === 0) throw new Error(t("withdrawals.claim.empty"))
      const { symbol, decimals } = getAssetWithFallback(vault.assetId)
      const payouts = [
        ...(collateral > 0n
          ? [
              t("common:currency", {
                value: formatUnits(collateral, decimals),
                symbol,
                maximumFractionDigits: decimals,
              }),
            ]
          : []),
        ...(surplusHollar > 0n
          ? [
              t("common:currency", {
                value: formatUnits(surplusHollar, 18),
                symbol: "HOLLAR",
                maximumFractionDigits: 18,
              }),
            ]
          : []),
      ].join(" + ")
      return submitBatch(
        vault.vaultAddress,
        calls,
        {
          submitted: t("withdrawals.claim.submitted"),
          success: t("withdrawals.claim.success"),
        },
        {
          title: t("withdrawals.claim.title"),
          description: t("withdrawals.claim.description", { payouts }),
        },
      )
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

/** Materialize earnings already held as invested collateral shares. */
export function useClaimYield(options: VaultWriteOptions = {}) {
  const { t } = useTranslation("propeller")
  const { evmAddress, submitTx } = useVaultEvmCall(options)
  return useMutation({
    mutationFn: (vault: PropellerVaultConfig) =>
      submitTx(
        vault.vaultAddress,
        encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "claimYield",
          args: [evmAddress],
        }),
        [...VAULT_ABI],
        {
          submitted: "Claiming earned shares...",
          success: "Earned shares claimed",
        },
        {
          title: t("positions.action.claimEarnings"),
          description: t("positions.earningsDescription"),
        },
      ),
  })
}
