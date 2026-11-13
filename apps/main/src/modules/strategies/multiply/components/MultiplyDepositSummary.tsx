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
import { getEntryCost } from "@/modules/strategies/multiply/utils/projection"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  pair: MultiplyPair
  position: MultiplyPosition
  // human units
  amount: string
  collateralPriceUsd: number
  debtPriceUsd: number
}

// What a deposit adds. The position ramps the deposit to its target leverage,
// borrowing debt and swapping it into collateral, as an open does.
export const MultiplyDepositSummary: React.FC<Props> = ({
  pair,
  position,
  amount,
  collateralPriceUsd,
  debtPriceUsd,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const rpc = useRpcProvider()
  const display = useResolveAssetDisplay()
  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)

  const nav = Number(formatUnits(position.nav, collateral.decimals))
  const leverage = Number(formatUnits(position.targetLeverage, 18))
  const priceInDebt = debtPriceUsd > 0 ? collateralPriceUsd / debtPriceUsd : 0
  const deposited = Number(amount || 0)
  const borrowed = deposited * (leverage - 1) * priceInDebt

  const [debouncedBorrowed] = useDebouncedValue(
    borrowed > 0 ? borrowed.toFixed(debt.decimals) : "",
  )
  const { data: quote, isLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: pair.debtAssetId,
      assetOut: pair.collateralAssetId,
      amountIn: debouncedBorrowed,
    }),
  )
  const entryCost = quote
    ? getEntryCost({
        amount: deposited,
        debt: Number(debouncedBorrowed),
        quotedOut: Number(formatUnits(quote.amountOut, collateral.decimals)),
        collateralPriceInDebt: priceInDebt,
      }).cost
    : 0

  if (!(deposited > 0)) return null

  const approx = (value: number) =>
    t("common:currency", {
      prefix: t("common:approx.short"),
      value,
      symbol: collateral.symbol,
    })

  const newNav = nav + deposited - entryCost

  return (
    <>
      <ModalContentDivider />
      <Summary separator={<ModalContentDivider />}>
        <SummaryRow
          label={
            entryCost < 0
              ? t("multiply.open.entryGain")
              : t("multiply.open.entryCost")
          }
          tooltip={t("multiply.open.entryTooltip")}
          content={
            <MultiplySwapResult
              value={-entryCost}
              base={deposited}
              symbol={collateral.symbol}
            />
          }
          loading={isLoading}
        />
        <SummaryRow
          label={t("multiply.deposit.newNetValue")}
          content={approx(newNav)}
          loading={isLoading}
        />
        <SummaryRow
          label={t("multiply.deposit.newSize")}
          content={approx(newNav * leverage)}
          loading={isLoading}
        />
      </Summary>
    </>
  )
}
