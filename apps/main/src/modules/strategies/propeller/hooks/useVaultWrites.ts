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
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
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
import { bestSellWithTxQuery } from "@/api/trade"
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
import { swapDepositBuyQuery } from "@/modules/strategies/propeller/hooks/useDepositQuote"
import { withdrawalRowId } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { useFormatSurplusHollar } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { parseExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { composeVaultBatch } from "@/modules/strategies/propeller/utils/batch"
import {
  buildDepositBuy,
  CHAIN_WAIT,
  encodeApproval,
  encodeDeposit,
  isCallNode,
  isUnwrapRoute,
  prepareApproval,
  prepareFundedDeposit,
  readSellLimit,
} from "@/modules/strategies/propeller/utils/deposit"
import {
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import {
  buildPayoutSell,
  getPayoutSell,
} from "@/modules/strategies/propeller/utils/payout"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { prepareWithdrawalClaim } from "@/modules/strategies/propeller/utils/withdrawalClaim"
import { type AnyPapiTx } from "@/modules/transactions/types"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { type Papi, useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
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
  trailing?: AnyPapiTx["decodedCall"][]
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
        // again as the lag passes (one node trailed by ~15 s on 0.lark) so
        // the position and the form never offer a balance already withdrawn
        for (const delay of [4_000, 8_000, 15_000])
          setTimeout(() => invalidateVault(vaultAddress), delay)
      },
      onSubmitted: () => onWriteSuccess?.(),
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
   * Build EVM calls as one substrate Utility.batch_all, between any leading and trailing calls.
   * Prepends bind_evm_address when the account is not yet mapped.
   */
  const buildBatch = useCallback(
    async (
      calls: BatchEvmCall[],
      { leading, trailing, atomic }: BatchOptions = {},
    ) => {
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
          trailing,
          atomic,
        }),
      })
    },
    [address, evmAddress, queryClient, rpc],
  )

  return {
    evmAddress,
    submitTx,
    buildBatch,
    createTransaction,
    txOptionsForVault,
  }
}

/** Polls until a submitted step's effect is visible on chain. */
const waitForChain = async (
  isVisible: () => Promise<boolean>,
  message: string,
) => {
  await waitFor(isVisible, {
    interval: CHAIN_WAIT.interval,
    timeout: { milliseconds: CHAIN_WAIT.timeout, message },
  })
}

export type DepositVariables = {
  /** in units of the asset paid with */
  amount: string
  /** buys the collateral from the asset paid with, in the deposit's own batch */
  trade?: {
    assetIn: string
    tx: AnyPapiTx
    /** a 1:1 unwrap, with no leftover */
    exact: boolean
    depositAmount: bigint
    maxAmountIn: bigint
    leftover?: bigint
  }
}

export function useDeposit(
  vault: PropellerVaultConfig,
  options: VaultWriteOptions = {},
) {
  const { t } = useTranslation(["common", "propeller"])
  const rpc = useRpcProvider()
  const { evm } = rpc
  const { account } = useAccount()
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
      executedAmount: { amount: formatUnits(amount, decimals), assetId },
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

      const { exact, depositAmount, maxAmountIn, leftover } = trade
      const payAsset = getAssetWithFallback(trade.assetIn)
      const formatPay = (value: bigint) =>
        formatAmount(formatUnits(value, payAsset.decimals), payAsset.symbol)
      const deposited = formatAmount(formatUnits(depositAmount, decimals))
      // also asserts the vault is ready, unpaused and still has room
      const approval = await prepareApproval(evm, depositInput(depositAmount))
      const tx = await buildBatch(
        [
          ...(approval ? [approval] : []),
          encodeDeposit(depositInput(depositAmount)),
        ],
        { leading: [trade.tx.decodedCall], atomic: true },
      )
      // the deposit cannot be simulated before the swap, so dry-run the batch
      // best, not papi's finalized default: a just-received pay asset must count
      const dryRunError = await getDryRunError(
        rpc,
        account?.address ?? "",
        tx,
        {
          at: "best",
        },
      )
      if (dryRunError)
        throw new Error(`Deposit dry run failed: ${dryRunError.name}`)

      return createTransaction(
        {
          tx,
          title: t("deposit"),
          description: exact
            ? t("propeller:deposit.swap.description.exact", {
                amountIn: formatAmount(amount, payAsset.symbol),
                amount: deposited,
                symbol,
              })
            : t("propeller:deposit.swap.description", {
                amount: deposited,
                maxAmountIn: formatPay(maxAmountIn),
                leftover: formatPay(leftover ?? 0n),
              }),
          toasts: {
            submitted: t("propeller:deposit.toast.submitted", {
              amount: deposited,
            }),
            success: t("propeller:deposit.toast.success", {
              amount: deposited,
            }),
          },
          // the review checks what's left of the fee asset after this
          executedAmount: {
            amount: formatUnits(maxAmountIn, payAsset.decimals),
            assetId: trade.assetIn,
          },
        },
        txOptionsForVault(vaultAddress),
      )
    },
  })
}

/**
 * The batch a deposit of the whole balance would sign, to size the fee MAX leaves
 * behind. A reference, not a worst case: a smaller trade can take another route,
 * which the review's fee check catches. Approval is always included.
 */
export function useDepositReferenceTx(
  deposit: PropellerDepositOption,
  balance: string,
  enabled: boolean,
) {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, buildBatch } = useVaultEvmCall()
  const { vault, assetId } = deposit
  const { vaultAddress } = vault
  const address = useAccount().account?.address ?? ""
  const payDecimals = getAssetWithFallback(assetId).decimals
  const collateralDecimals = getAssetWithFallback(vault.assetId).decimals

  return useQuery({
    queryKey: [
      ...propellerQueryKeys.vault(vaultAddress),
      "deposit-reference",
      address,
      assetId,
      balance,
    ],
    enabled: enabled && rpc.isReady && !!address && Big(balance || "0").gt(0),
    queryFn: async () => {
      const input = (amount: bigint) => ({
        vault: vaultAddress,
        asset: getAddressFromAssetId(vault.assetId) as Hex,
        owner: evmAddress,
        amount,
      })
      const batch = (amount: bigint, leading?: AnyPapiTx["decodedCall"]) =>
        buildBatch(
          [encodeApproval(input(amount)), encodeDeposit(input(amount))],
          {
            leading: leading ? [leading] : undefined,
            atomic: true,
          },
        )

      if (!isSwapDeposit(deposit))
        return batch(parseExactAmount(balance, collateralDecimals))

      const { swap, tx } = await rpc.queryClient.ensureQueryData(
        bestSellWithTxQuery(rpc, {
          assetIn: assetId,
          assetOut: vault.assetId,
          amountIn: balance,
          slippage: 0,
          address,
        }),
      )
      const assetIn = Number(assetId)
      const assetOut = Number(vault.assetId)
      if (isUnwrapRoute(swap.swaps, { assetIn, assetOut })) {
        if (!tx) throw new Error("No conversion to size the fee from")
        return batch(swap.amountIn, tx.decodedCall)
      }

      const buy = await rpc.queryClient.ensureQueryData(
        swapDepositBuyQuery(rpc, {
          vault,
          assetIn: assetId,
          amountIn: balance,
          decimalsIn: payDecimals,
          collateralDecimals,
          address,
        }),
      )
      if (!buy) throw new Error("No buy to size the fee from")
      return batch(
        buy.amountOut,
        buildDepositBuy(rpc.papi, { ...buy, assetIn, assetOut }).decodedCall,
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
      return submitTx(
        vaultAddress,
        data,
        [...VAULT_ABI],
        {
          submitted: t("propeller:withdraw.toast.submitted", { amount }),
          success: t("propeller:withdraw.toast.success", { amount }),
        },
        {
          title: t("propeller:withdraw.review.title"),
          // MAX sends the "every share" value (2^256 - 1) the call data shows
          // in full; say what it means before it reads as a bug
          description: t(
            isMax
              ? "propeller:withdraw.review.max"
              : "propeller:withdraw.review.amount",
            { amount },
          ),
        },
      )
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
  /** asset the claimed collateral is sold into; unset or the collateral itself sells nothing */
  payoutAssetId?: string
}

/** A decoded call as a submittable tx, through its pallet's own builder. */
const decodedCallToTx = (papi: Papi, call: AnyPapiTx["decodedCall"]) => {
  if (!isCallNode(call) || !isCallNode(call.value))
    throw new Error("Not a decoded call")
  const { type: pallet } = call
  const { type: method, value: args } = call.value
  const build = (
    papi.tx as unknown as Record<
      string,
      Record<string, (args: unknown) => AnyPapiTx> | undefined
    >
  )[pallet]?.[method]
  if (!build) throw new Error(`No builder for ${pallet}.${method}`)
  return build(args)
}

export function useClaim(options: VaultWriteOptions = {}) {
  const { t } = useTranslation(["propeller", "common"])
  const rpc = useRpcProvider()
  const { evm, sdk } = rpc
  const { account } = useAccount()
  const wallet = useWallet()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, buildBatch, createTransaction, txOptionsForVault } =
    useVaultEvmCall(options)
  const { getRate } = useBaseRates()
  const getDisplayAsset = useVaultDisplayAsset()
  const formatSurplus = useFormatSurplusHollar()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const address = account?.address ?? ""

  /** Router.sell of exactly the claimed collateral, priced by the SDK now. */
  const buildSell = async (
    vault: PropellerVaultConfig,
    payoutAssetId: string,
    collateral: bigint,
  ) => {
    const kind = getPayoutSell(vault, payoutAssetId)
    if (kind === "none" || collateral === 0n) return null
    const { decimals } = getAssetWithFallback(vault.assetId)
    const swap = await sdk.api.router.getBestSell(
      Number(vault.assetId),
      Number(payoutAssetId),
      formatUnits(collateral, decimals),
    )
    const tx = await sdk.tx
      .trade(swap)
      .withSlippage(slippage)
      .withBeneficiary(address)
      .build()
      .then((built) => built.get())
    // the 1:1 unwrap returns exactly what it sells, so it takes no buffer
    return buildPayoutSell(
      tx.decodedCall,
      collateral,
      kind === "exact" ? { minAmountOut: collateral } : {},
    )
  }

  /**
   * What the claim pays: a sell pays at least its minimum in the payout asset;
   * without one the chain pays collateral, spoken in the current display asset.
   */
  const describePayouts = (
    vault: PropellerVaultConfig,
    payoutAssetId: string,
    collateral: bigint,
    surplusHollar: bigint,
    sell: AnyPapiTx["decodedCall"] | null,
  ) => {
    const payout = getAssetWithFallback(payoutAssetId)
    const { decimals } = getAssetWithFallback(vault.assetId)
    const minAmountOut = sell ? readSellLimit(sell)?.minAmountOut : undefined
    const minimum =
      minAmountOut !== undefined
        ? t("common:currency", {
            value: formatUnits(minAmountOut, payout.decimals),
            symbol: payout.symbol,
            // a review, not a ledger: six places pin it to a fraction of a cent
            maximumFractionDigits: 6,
          })
        : null
    // a swap's minimum is its slippage floor, not what arrives; the 1:1
    // unwrap's minimum is exactly what arrives
    const collateralPayout = minimum
      ? getPayoutSell(vault, payoutAssetId) === "swap"
        ? t("withdrawals.claim.atLeast", { amount: minimum })
        : minimum
      : t("common:currency", {
          value: Big(formatUnits(collateral, decimals))
            .times(getRate(vault) ?? "1")
            .toString(),
          symbol: getDisplayAsset(vault).symbol,
          maximumFractionDigits: 6,
        })
    return [
      ...(collateral > 0n ? [collateralPayout] : []),
      ...(surplusHollar > 0n ? [formatSurplus(surplusHollar)] : []),
    ].join(" + ")
  }

  /**
   * EVM signers can't put a substrate sell behind the EVM calls: claim, wait
   * for the collateral to arrive, then sell exactly that much.
   */
  const claimThenSellSteps = async (
    vault: PropellerVaultConfig,
    payoutAssetId: string,
    collateral: bigint,
    claimStep: TransactionCommon & { tx: AnyPapiTx },
  ) => {
    const collateralAddress = getAddressFromAssetId(vault.assetId) as Hex
    const readCollateral = () =>
      evm.readContract({
        address: collateralAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [evmAddress],
      })
    const before = await readCollateral()
    const swapToasts = {
      amountIn: t("common:currency", {
        value: formatUnits(
          collateral,
          getAssetWithFallback(vault.assetId).decimals,
        ),
        symbol: getAssetWithFallback(vaultCollateralDisplayId(vault)).symbol,
        maximumFractionDigits: 4,
      }),
      symbol: getAssetWithFallback(payoutAssetId).symbol,
    }
    return [
      {
        ...claimStep,
        stepTitle: t("withdrawals.claim.step.claim"),
        // dispatch-precompile calls emit no logs, so watch the balance
        beforeNext: () =>
          waitForChain(
            async () => (await readCollateral()) >= before + collateral,
            t("withdrawals.claim.timeout"),
          ),
      },
      {
        stepTitle: t("withdrawals.claim.step.swap"),
        tx: async () => {
          const sell = await buildSell(vault, payoutAssetId, collateral)
          if (!sell) throw new Error("No payout sell to build")
          return {
            tx: decodedCallToTx(rpc.papi, sell),
            toasts: {
              submitted: t(
                "withdrawals.claim.swap.toast.submitted",
                swapToasts,
              ),
              success: t("withdrawals.claim.swap.toast.success", swapToasts),
            },
          }
        },
      },
    ]
  }

  return useMutation({
    mutationKey: propellerQueryKeys.claim(),
    mutationFn: async ({
      vault,
      requestId,
      payoutAssetId = vault.assetId,
    }: ClaimVariables) => {
      const { calls, collateral, surplusHollar, complete, exact } =
        await prepareWithdrawalClaim(
          evm,
          vault.vaultAddress,
          requestId,
          evmAddress,
        )
      if (calls.length === 0) throw new Error(t("withdrawals.claim.empty"))
      const sell = await buildSell(vault, payoutAssetId, collateral)
      const payouts = describePayouts(
        vault,
        payoutAssetId,
        collateral,
        surplusHollar,
        sell,
      )
      const claim = {
        title: t("withdrawals.claim.title"),
        // an exact claim pays only this; an older vault's claim pays all
        // settled at execution, and a sell sized before then leaves the
        // newer tranche unsold, as the collateral itself
        description: t(
          complete || exact
            ? "withdrawals.claim.descriptionFinal"
            : sell
              ? "withdrawals.claim.descriptionUnsold"
              : "withdrawals.claim.description",
          {
            payouts,
            collateral: getAssetWithFallback(vault.assetId).symbol,
          },
        ),
        toasts: {
          submitted: t("withdrawals.claim.submitted"),
          success: t("withdrawals.claim.success"),
        },
      }
      const txOptions = txOptionsForVault(vault.vaultAddress)

      if (sell && isEthereumSigner(wallet?.signer)) {
        const tx = await buildBatch(calls, { atomic: true })
        const steps = await claimThenSellSteps(
          vault,
          payoutAssetId,
          collateral,
          {
            ...claim,
            tx,
          },
        )
        return createTransaction({ tx: steps }, txOptions)
      }

      // a reverted claim must stop the rest: claimSurplus, and a sell that
      // would otherwise spend collateral the wallet already held
      const tx = await buildBatch(calls, {
        atomic: true,
        trailing: sell ? [sell] : [],
      })
      if (sell) {
        // the claimable tranche can be newer than finalized; papi's default
        // (finalized) would see nothing to sell and fail a claim that succeeds
        const dryRunError = await getDryRunError(rpc, address, tx, {
          at: "best",
        })
        if (dryRunError)
          throw new Error(`Claim dry run failed: ${dryRunError.name}`)
      }
      return createTransaction({ tx, ...claim }, txOptions)
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
