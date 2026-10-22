import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  getAddressFromAssetId,
  safeConvertSS58toH160,
  safeStringify,
} from "@galacticcouncil/utils"
import {
  isEthereumSigner,
  useAccount,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
import { minutesToMilliseconds } from "date-fns"
import waitFor from "p-wait-for"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  type Abi,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  type Hex,
  maxUint256,
} from "viem"

import { getDryRunError } from "@/api/dryRun"
import { evmAccountBindingQuery, useErc20Allowance } from "@/api/evm"
import { PendingApproval } from "@/components/PendingApproval"
import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import {
  type PropellerVaultConfig,
  vaultCollateralDisplayId,
} from "@/modules/strategies/propeller/config/vaults"
import { EVM_CALL_GAS } from "@/modules/strategies/propeller/constants"
import {
  useBaseRates,
  useVaultDisplayAsset,
} from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { withdrawalRowId } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { parseExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { composeVaultBatch } from "@/modules/strategies/propeller/utils/batch"
import {
  encodeDeposit,
  prepareApproval,
  prepareFundedDeposit,
  prepareSwapDeposit,
} from "@/modules/strategies/propeller/utils/deposit"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { prepareWithdrawalClaim } from "@/modules/strategies/propeller/utils/withdrawalClaim"
import { type AnyPapiTx } from "@/modules/transactions/types"
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

type BatchOptions = {
  leading?: AnyPapiTx["decodedCall"][]
  atomic?: boolean
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
        // the immediate refetch can re-read a gateway node still serving the
        // pre-transaction state, and settlement logs land a scan behind — tap
        // again once the lag has passed so rows reflect the chain in seconds
        setTimeout(() => invalidateVault(vaultAddress), 4_000)
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
   * Build EVM calls as one substrate Utility.batch_all, after any leading calls.
   * Prepends bind_evm_address when the account is not yet mapped.
   */
  const buildBatch = useCallback(
    async (calls: BatchEvmCall[], { leading, atomic }: BatchOptions = {}) => {
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

      return rpc.papi.tx.Utility.batch_all({
        calls: composeVaultBatch(rpc.papi, {
          bind: isBound === false,
          leading,
          evmCalls: papiCalls,
          atomic,
        }),
      })
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

export type DepositVariables = {
  /** in units of the asset paid with */
  amount: string
  /** sell of the asset paid with for the collateral */
  trade?: { assetIn: string; tx: AnyPapiTx }
}

export function useDeposit(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common", "propeller"])
  const rpc = useRpcProvider()
  const { evm } = rpc
  const { account } = useAccount()
  const wallet = useWallet()
  const { getAssetWithFallback } = useAssets()
  const getErc20Allowance = useErc20Allowance()
  const { evmAddress, buildBatch, createTransaction, txOptionsForVault } =
    useVaultEvmCall(options)
  const { vaultAddress, assetId } = vault
  const assetAddress = getAddressFromAssetId(assetId) as Hex
  const { decimals } = getAssetWithFallback(assetId)
  // toast amounts are collateral units, labeled by its product identity (GETH)
  const { symbol } = getAssetWithFallback(vaultCollateralDisplayId(vault))

  const formatAmount = (value: string, assetSymbol = symbol) =>
    t("currency", { value, symbol: assetSymbol, maximumFractionDigits: 4 })
  const depositInput = (amount: bigint) => ({
    vault: vaultAddress,
    asset: assetAddress,
    owner: evmAddress,
    amount,
  })
  const waitForChain = async (
    isVisible: () => Promise<boolean>,
    message: string,
  ) => {
    await waitFor(isVisible, {
      interval: 1000,
      timeout: { milliseconds: minutesToMilliseconds(3), message },
    })
  }

  // Built only once the approval is visible on chain, so the simulation
  // and gas estimate run against the real allowance.
  const buildDeposit = async (amount: bigint) => {
    const value = formatAmount(formatUnits(amount, decimals))
    return {
      tx: await buildBatch([
        await prepareFundedDeposit(evm, depositInput(amount)),
      ]),
      toasts: {
        submitted: t("propeller:deposit.toast.submitted", { amount: value }),
        success: t("propeller:deposit.toast.success", { amount: value }),
      },
    }
  }

  const approvalStep = async (approval: BatchEvmCall, amount: bigint) => ({
    tx: await buildBatch([approval]),
    stepTitle: t("propeller:deposit.step.approve"),
    toasts: {
      submitted: t("propeller:deposit.approve.toast.submitted", { symbol }),
      success: t("propeller:deposit.approve.toast.success", { symbol }),
    },
    pendingComponent: PendingApproval,
    beforeNext: () =>
      waitForChain(
        async () =>
          (await getErc20Allowance(assetAddress, evmAddress, vaultAddress)) >=
          amount,
        t("propeller:deposit.approve.timeout"),
      ),
  })

  const depositStep = (amount: bigint) => ({
    tx: () => buildDeposit(amount),
    stepTitle: t("deposit"),
    pendingComponent: PendingApproval,
  })

  return useMutation({
    mutationFn: async ({ amount, trade }: DepositVariables) => {
      if (!trade) {
        const assetBig = parseExactAmount(amount, decimals)
        const approval = await prepareApproval(evm, depositInput(assetBig))
        if (!approval) {
          return createTransaction(
            await buildDeposit(assetBig),
            txOptionsForVault(vaultAddress),
          )
        }

        return createTransaction(
          {
            tx: [await approvalStep(approval, assetBig), depositStep(assetBig)],
          },
          txOptionsForVault(vaultAddress),
        )
      }

      const { amount: depositAmount, approval } = await prepareSwapDeposit(
        evm,
        {
          vault: vaultAddress,
          asset: assetAddress,
          owner: evmAddress,
          collateralId: assetId,
          assetIn: trade.assetIn,
          tradeCall: trade.tx.decodedCall,
        },
      )
      const amountIn = formatAmount(
        amount,
        getAssetWithFallback(trade.assetIn).symbol,
      )
      const deposited = formatAmount(formatUnits(depositAmount, decimals))

      if (isEthereumSigner(wallet?.signer)) {
        return createTransaction(
          {
            tx: [
              {
                tx: trade.tx,
                stepTitle: t("propeller:deposit.step.swap"),
                toasts: {
                  submitted: t("propeller:deposit.swapStep.toast.submitted", {
                    amountIn,
                    symbol,
                  }),
                  success: t("propeller:deposit.swapStep.toast.success", {
                    amountIn,
                    symbol,
                  }),
                },
                beforeNext: () =>
                  waitForChain(
                    async () =>
                      (await evm.readContract({
                        address: assetAddress,
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [evmAddress],
                      })) >= depositAmount,
                    t("propeller:deposit.swapStep.timeout"),
                  ),
              },
              ...(approval
                ? [await approvalStep(approval, depositAmount)]
                : []),
              depositStep(depositAmount),
            ],
          },
          txOptionsForVault(vaultAddress),
        )
      }

      const tx = await buildBatch(
        [
          ...(approval ? [approval] : []),
          encodeDeposit(depositInput(depositAmount)),
        ],
        { leading: [trade.tx.decodedCall], atomic: true },
      )
      // the deposit cannot be simulated before the swap, so dry-run the batch
      const dryRunError = await getDryRunError(rpc, account?.address ?? "", tx)
      if (dryRunError)
        throw new Error(`Deposit dry run failed: ${dryRunError.name}`)

      return createTransaction(
        {
          tx,
          title: t("propeller:deposit.swap.title"),
          description: t("propeller:deposit.swap.description", {
            amountIn,
            amount: deposited,
            symbol,
          }),
          toasts: {
            submitted: t("propeller:deposit.swap.toast.submitted", {
              amountIn,
              amount: deposited,
            }),
            success: t("propeller:deposit.toast.success", {
              amount: deposited,
            }),
          },
        },
        txOptionsForVault(vaultAddress),
      )
    },
  })
}

export type RedeemVariables = {
  shareAmount: string
  /** redeem the whole balance, including earnings funded after it was read */
  isMax: boolean
  /** user-facing amount in the underlying asset, for the toast only */
  displayAmount?: string
}

export function useRequestRedeem(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common", "propeller"])
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitTx } = useVaultEvmCall(options)
  const { vaultAddress, assetId, shareSymbol } = vault
  const { decimals } = getAssetWithFallback(assetId)
  // toasts speak the current display asset; the share symbol only labels the
  // raw-share fallback no UI path takes
  const { symbol } = useVaultDisplayAsset()(vault)

  return useMutation({
    mutationFn: ({ shareAmount, isMax, displayAmount }: RedeemVariables) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [
          isMax ? maxUint256 : parseExactAmount(shareAmount, decimals),
          evmAddress,
        ],
      })

      const amount = t("currency", {
        value: displayAmount ?? shareAmount,
        symbol: displayAmount === undefined ? shareSymbol : symbol,
        maximumFractionDigits: 4,
      })
      return submitTx(vaultAddress, data, [...VAULT_ABI], {
        submitted: t("propeller:withdraw.toast.submitted", { amount }),
        success: t("propeller:withdraw.toast.success", { amount }),
      })
    },
  })
}

export type TransferSharesVariables = {
  /** exact share amount to move; the caller resolves display units to shares */
  shareAmount: string
  /** user-facing amount in the current display asset, for the toast only */
  displayAmount: string
  to: Hex
}

/**
 * Transfers vault shares (the position itself). The vault token folds any
 * funded-but-virtual yield into real shares on transfer, so the exact share
 * amount is all the chain needs.
 */
export function useTransferShares(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common", "propeller"])
  const { getAssetWithFallback } = useAssets()
  const { submitTx } = useVaultEvmCall(options)
  const { decimals } = getAssetWithFallback(vault.assetId)
  const { symbol } = useVaultDisplayAsset()(vault)

  return useMutation({
    mutationFn: ({
      shareAmount,
      displayAmount,
      to,
    }: TransferSharesVariables) => {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, parseExactAmount(shareAmount, decimals)],
      })
      const amount = t("currency", {
        value: displayAmount,
        symbol,
        maximumFractionDigits: 4,
      })
      return submitTx(vault.vaultAddress, data, [...erc20Abi], {
        submitted: t("propeller:transfer.toast.submitted", { amount }),
        success: t("propeller:transfer.toast.success", { amount }),
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
  const { getRate } = useBaseRates()
  const getDisplayAsset = useVaultDisplayAsset()

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
      // the chain pays collateral; the toast speaks the current display asset
      const { symbol } = getDisplayAsset(vault)
      const { decimals } = getAssetWithFallback(vault.assetId)
      const rate = getRate(vault) ?? "1"
      const payouts = [
        ...(collateral > 0n
          ? [
              t("common:currency", {
                value: Big(formatUnits(collateral, decimals))
                  .times(rate)
                  .toString(),
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
