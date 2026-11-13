import { valueToBigNumber } from "@aave/math-utils"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Separator,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"

import { CollateralState } from "@/components/primitives/CollateralState"
import { HealthFactorChange } from "@/components/primitives/HealthFactorChange"
import { ValueChange } from "@/components/primitives/ValueChange"
import { ReserveAmount } from "@/components/transactions/Swap/ReserveAmount"
import { SwapPriceImpactSummaryRow } from "@/components/transactions/Swap/SwapPriceImpactSummaryRow"
import { SwapSlippageSummaryRow } from "@/components/transactions/Swap/SwapSlippageSummaryRow"
import { CollateralType } from "@/helpers/types"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedUserReserveData } from "@/hooks/commonTypes"
import { formatHealthFactorResult } from "@/utils"

export type SwapModalDetailsProps = {
  showHealthFactor: boolean
  healthFactor: string
  healthFactorAfterSwap: string
  swapSource: ComputedUserReserveData & { collateralType: CollateralType }
  swapTarget: ComputedUserReserveData & { collateralType: CollateralType }
  toAmount: string
  fromAmount: string
  priceImpactPct: number
  loading: boolean
}

export const SwapModalDetails: React.FC<SwapModalDetailsProps> = ({
  showHealthFactor,
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
  toAmount,
  fromAmount,
  priceImpactPct,
  loading,
}) => {
  const { formatPercent } = useAppFormatters()

  const sourceAmountAfterSwap = valueToBigNumber(
    swapSource.underlyingBalance,
  ).minus(valueToBigNumber(fromAmount))

  const targetAmountAfterSwap = valueToBigNumber(
    swapTarget.underlyingBalance,
  ).plus(valueToBigNumber(toAmount))

  const hf = formatHealthFactorResult({
    currentHF: healthFactor,
    futureHF: healthFactorAfterSwap,
  })

  return (
    <Stack
      separated
      separator={<Separator mx="var(--modal-content-inset)" />}
      withTrailingSeparator
    >
      <SwapSlippageSummaryRow />

      <SwapPriceImpactSummaryRow
        priceImpactPct={priceImpactPct}
        loading={loading}
      />

      {healthFactorAfterSwap && (
        <SummaryRow
          label="Health Factor"
          content={
            <HealthFactorChange
              {...hf}
              loading={loading}
              isSignificantChange={showHealthFactor && hf.isSignificantChange}
            />
          }
        />
      )}

      <SummaryRow
        label="Supply APY"
        loading={loading}
        content={
          <ValueChange
            from={formatPercent(Number(swapSource.reserve.supplyAPY) * 100)}
            to={formatPercent(Number(swapTarget.reserve.supplyAPY) * 100)}
          />
        }
      />

      <SummaryRow
        label="Collateralization"
        loading={loading}
        content={
          <Flex gap="s" align="center">
            <CollateralState collateralType={swapSource.collateralType} />
            <Icon size="xs" component={ArrowRight} />
            <CollateralState collateralType={swapTarget.collateralType} />
          </Flex>
        }
      />

      <SummaryRow
        label="Liquidation threshold"
        loading={loading}
        content={
          <ValueChange
            from={formatPercent(
              Number(swapSource.reserve.formattedReserveLiquidationThreshold) *
                100,
            )}
            to={formatPercent(
              Number(swapTarget.reserve.formattedReserveLiquidationThreshold) *
                100,
            )}
          />
        }
      />

      <SummaryRow
        label="Supply balance after swap"
        align="flex-start"
        loading={loading}
        content={
          <Flex direction="column" align="flex-end" gap="s">
            <ReserveAmount
              reserve={swapSource.reserve}
              amount={sourceAmountAfterSwap}
            />
            <ReserveAmount
              reserve={swapTarget.reserve}
              amount={targetAmountAfterSwap}
            />
          </Flex>
        }
      />
    </Stack>
  )
}
