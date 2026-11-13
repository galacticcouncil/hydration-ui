import {
  ModalContentDivider,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { bestSellQuery } from "@/api/trade"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplySwapResult } from "@/modules/strategies/multiply/components/MultiplySwapResult"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { type MultiplyPosition } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import {
  getExitCost,
  getWithdrawDebtRepay,
} from "@/modules/strategies/multiply/utils/projection"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  pair: MultiplyPair
  position: MultiplyPosition
  // human units
  amount: string
  isMax: boolean
  collateralPriceUsd: number
  debtPriceUsd: number
}

// What a withdraw pays out and what it leaves behind. A max withdraw closes
// the position, so it pays out the whole net value and the fee budget.
export const MultiplyWithdrawSummary: React.FC<Props> = ({
  pair,
  position,
  amount,
  isMax,
  collateralPriceUsd,
  debtPriceUsd,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const rpc = useRpcProvider()
  const display = useResolveAssetDisplay()
  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)
  const feeAsset = display(pair.feeAssetId)

  const nav = Number(formatUnits(position.nav, collateral.decimals))
  const leverage = Number(formatUnits(position.leverage, 18))
  const priceInDebt = debtPriceUsd > 0 ? collateralPriceUsd / debtPriceUsd : 0
  const debtTotal = (nav * leverage - nav) * priceInDebt

  const withdrawn = isMax ? nav : Math.min(Number(amount || 0), nav)
  const repay = getWithdrawDebtRepay({
    amount: withdrawn,
    nav,
    debt: debtTotal,
  })
  const sold = priceInDebt > 0 ? repay / priceInDebt : 0

  // the unwind sells collateral for the debt it repays; quote it to price the exit
  const [debouncedSold] = useDebouncedValue(
    sold > 0 ? sold.toFixed(collateral.decimals) : "",
  )
  const { data: quote, isLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: pair.collateralAssetId,
      assetOut: pair.debtAssetId,
      amountIn: debouncedSold,
    }),
  )
  const exitCost = quote
    ? getExitCost({
        sold: Number(debouncedSold),
        quotedOut: Number(formatUnits(quote.amountOut, debt.decimals)),
        collateralPriceInDebt: priceInDebt,
      })
    : 0

  if (!(withdrawn > 0)) return null

  const cur = (value: number, symbol: string) =>
    t("common:currency", { value, symbol })
  const approx = (value: number, symbol: string) =>
    t("common:currency", {
      prefix: t("common:approx.short"),
      value,
      symbol,
    })

  // a partial withdraw pays the request and the position absorbs the cost;
  // a close pays out whatever equity is left after it
  const receive = isMax ? nav - exitCost : withdrawn
  const remainingNav = Math.max(0, nav - withdrawn - exitCost)
  // as it lands on the user: positive is a gain
  const impact = -exitCost

  return (
    <>
      <ModalContentDivider />
      <Summary separator={<ModalContentDivider />}>
        <SummaryRow
          label={t("multiply.withdraw.receive")}
          content={
            isMax
              ? approx(receive, collateral.symbol)
              : cur(receive, collateral.symbol)
          }
          loading={isMax && isLoading}
        />
        {isMax && (
          <SummaryRow
            label={t("multiply.withdraw.feeBudgetBack")}
            content={cur(
              Number(formatUnits(position.feeBudget, feeAsset.decimals)),
              feeAsset.symbol,
            )}
          />
        )}
        <SummaryRow
          label={
            impact > 0
              ? t("multiply.withdraw.exitGain")
              : t("multiply.withdraw.exitCost")
          }
          tooltip={t("multiply.withdraw.exitTooltip", { debt: debt.symbol })}
          content={
            <MultiplySwapResult
              value={impact}
              base={withdrawn}
              symbol={collateral.symbol}
            />
          }
          loading={isLoading}
        />
        {!isMax && (
          <SummaryRow
            label={t("multiply.withdraw.remainingNetValue")}
            content={approx(remainingNav, collateral.symbol)}
            loading={isLoading}
          />
        )}
        {!isMax && (
          <SummaryRow
            label={t("multiply.withdraw.remainingSize")}
            content={approx(remainingNav * leverage, collateral.symbol)}
            loading={isLoading}
          />
        )}
      </Summary>
    </>
  )
}
