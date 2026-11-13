import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { formatUnits, parseUnits } from "viem"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { useVaultEvmCall } from "@/modules/strategies/bil/hooks/useVaultWrites"
import {
  MULTIPLY_OPEN_GAS,
  MULTIPLY_QUERY_KEY_PREFIX,
} from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useLooperRecoveryStore } from "@/modules/strategies/multiply/hooks/useLooperRecoveryStore"
import { useOpenCalls } from "@/modules/strategies/multiply/hooks/useOpenMultiplyPosition"
import {
  type BalanceSnapshot,
  getLooperEntry,
  type LooperEntryInput,
} from "@/modules/strategies/multiply/utils/entry"
import { type AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  getTxResultBlockHeight,
  isSubstrateTxResult,
  type TSuccessResult,
  useTransactionsStore,
} from "@/states/transactions"

/** Step 1 of a two-step entry: whatever turns the pay asset(s) into collateral. */
export type LooperEntryStep1 = {
  /** how step 2 reads the received collateral from step 1's events */
  variant: "sell" | "proportional"
  /** the asset sold; the proportional variant ignores it */
  payAssetId: string
  tx: AnyTransaction
  /** what the user pays, formatted for the toasts ("1,000 USDT") */
  paid: string
}

export type OpenMultiplyEntryInput = {
  step1: LooperEntryStep1
  leverage: number
  /** read when step 2 is built, so its floors and room use fresh reserves */
  getMarket: () => {
    collateralPriceInDebt: number
    /** in collateral units; null when uncapped */
    maxDeposit: number | null
  }
}

/**
 * Opens a loop paying with another asset, in two signatures: step 1 buys the
 * collateral, step 2 opens with exactly what step 1 delivered. If step 2
 * fails or is closed after step 1 landed, the bought collateral is recorded
 * in `useLooperRecoveryStore` so the form can offer to open with it.
 */
export const useOpenMultiplyEntry = (pair: MultiplyPair) => {
  const { t } = useTranslation("strategies")
  const { account } = useAccount()
  const { papi, sdk } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const display = useResolveAssetDisplay()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { buildBatchTx } = useVaultEvmCall()
  const buildOpenCalls = useOpenCalls(pair)
  const setRecovery = useLooperRecoveryStore((s) => s.set)
  const clearRecovery = useLooperRecoveryStore((s) => s.clear)

  return useMutation({
    mutationFn: async ({
      step1,
      leverage,
      getMarket,
    }: OpenMultiplyEntryInput) => {
      if (!account?.address) throw new Error("No account address")
      const address = account.address

      const collateral = display(pair.collateralAssetId)
      const debt = getAssetWithFallback(pair.debtAssetId)
      const aCollateral = getAssetWithFallback(
        pair.aCollateralAssetId.toString(),
      )
      const symbol = collateral.symbol

      // results without events: the collateral at step 1's block and the one before
      const readBalances = async (
        result: TSuccessResult | undefined,
      ): Promise<BalanceSnapshot | undefined> => {
        const height = result ? getTxResultBlockHeight(result) : null
        const hash =
          result && "blockHash" in result ? result.blockHash : undefined
        if (height === null || !hash) return undefined
        const parentHash = await papi.query.System.BlockHash.getValue(
          height - 1,
          { at: hash },
        )
        const balanceAt = (at: string) =>
          sdk.client.balance.getBalanceAt(
            address,
            Number(pair.collateralAssetId),
            at,
          )
        const [before, after] = await Promise.all([
          balanceAt(parentHash),
          balanceAt(hash),
        ])
        return { before: before.transferable, after: after.transferable }
      }

      const readStep1 = async (
        result: TSuccessResult | undefined,
      ): Promise<LooperEntryInput["step1"]> => {
        const events =
          result && isSubstrateTxResult(result) ? result.events : null
        const balances = events ? undefined : await readBalances(result)

        return step1.variant === "sell"
          ? {
              variant: "sell",
              events: {
                routerExecuted: events
                  ? papi.event.Router.Executed.filter(events).map(
                      (e) => e.payload,
                    )
                  : [],
              },
              balances,
            }
          : {
              variant: "proportional",
              events: {
                liquidityAdded: events
                  ? papi.event.Stableswap.LiquidityAdded.filter(events).map(
                      (e) => e.payload,
                    )
                  : [],
              },
              balances,
            }
      }

      // set once step 1 landed ("" until what it delivered is read); left for
      // recovery if step 2 doesn't finish
      let held: string | null = null

      try {
        await createTransaction(
          {
            tx: [
              {
                stepTitle: t("multiply.open.step.buy", { symbol }),
                tx: () => ({
                  title: t("multiply.open.step.buy", { symbol }),
                  tx: step1.tx,
                  toasts: {
                    submitted: t("multiply.open.toast.buy.submitted", {
                      paid: step1.paid,
                      symbol,
                    }),
                    success: t("multiply.open.toast.buy.success", {
                      paid: step1.paid,
                      symbol,
                    }),
                  },
                }),
              },
              {
                stepTitle: t("multiply.open.step.open"),
                tx: async ([result]) => {
                  held = ""
                  const { collateralPriceInDebt, maxDeposit } = getMarket()
                  const entry = getLooperEntry({
                    account: address,
                    payAssetId: step1.payAssetId,
                    collateralAssetId: pair.collateralAssetId,
                    step1: await readStep1(result),
                    minAmount: BigInt(aCollateral.existentialDeposit),
                    maxDeposit:
                      maxDeposit === null
                        ? null
                        : parseUnits(
                            maxDeposit.toFixed(collateral.decimals),
                            collateral.decimals,
                          ),
                    feeBudget: pair.feeBudget,
                    floors: {
                      collateralDecimals: collateral.decimals,
                      debtDecimals: debt.decimals,
                      collateralPriceInDebt,
                      debtEd: BigInt(debt.existentialDeposit),
                      aCollateralEd: BigInt(aCollateral.existentialDeposit),
                    },
                  })
                  held =
                    entry.received > 0n
                      ? formatUnits(entry.received, collateral.decimals)
                      : null
                  if (!entry.ok) {
                    throw new Error(
                      t(`multiply.open.entryError.${entry.error}`, { symbol }),
                    )
                  }

                  const calls = await buildOpenCalls({
                    leverage,
                    ...entry.open,
                  })
                  const toastValues = {
                    amount: formatUnits(entry.received, collateral.decimals),
                    symbol,
                    paid: step1.paid,
                    leverage,
                  }
                  return {
                    title: t("multiply.open.step.open"),
                    tx: await buildBatchTx(calls, MULTIPLY_OPEN_GAS),
                    toasts: {
                      submitted: t(
                        "multiply.open.toast.paid.submitted",
                        toastValues,
                      ),
                      success: t(
                        "multiply.open.toast.paid.success",
                        toastValues,
                      ),
                    },
                    invalidateQueries: [[MULTIPLY_QUERY_KEY_PREFIX]],
                  }
                },
              },
            ],
          },
          { resolveOn: "success" },
        )
      } catch (error) {
        if (held !== null) setRecovery(pair.slug, held)
        throw error
      }
      clearRecovery(pair.slug)
    },
  })
}
