import { valueToBigNumber } from "@aave/math-utils"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Separator,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"

import { IncentivesButton } from "@/components/primitives/IncentivesButton"
import { ValueChange } from "@/components/primitives/ValueChange"
import { ReserveAmount } from "@/components/transactions/Swap/ReserveAmount"
import { SwapPriceImpactSummaryRow } from "@/components/transactions/Swap/SwapPriceImpactSummaryRow"
import { SwapSlippageSummaryRow } from "@/components/transactions/Swap/SwapSlippageSummaryRow"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedUserReserveData } from "@/hooks/commonTypes"

export type DebtSwitchModalDetailsProps = {
  switchSource: ComputedUserReserveData
  switchTarget: ComputedUserReserveData
  toAmount: string
  fromAmount: string
  loading: boolean
  sourceBalance: string
  sourceBorrowAPY: string
  targetBorrowAPY: string
  priceImpactPct: number
}

export const DebtSwitchModalDetails: React.FC<DebtSwitchModalDetailsProps> = ({
  switchSource,
  switchTarget,
  toAmount,
  fromAmount,
  loading,
  sourceBalance,
  sourceBorrowAPY,
  targetBorrowAPY,
  priceImpactPct,
}) => {
  const { formatPercent } = useAppFormatters()

  const sourceAmountAfterSwap = valueToBigNumber(sourceBalance).minus(
    valueToBigNumber(fromAmount),
  )

  const targetAmountAfterSwap = valueToBigNumber(
    switchTarget.variableBorrows,
  ).plus(valueToBigNumber(toAmount))

  const sourceIncentives = switchSource.reserve.vIncentivesData
  const targetIncentives = switchTarget.reserve.vIncentivesData
  const shouldRenderIncentives =
    (sourceIncentives && sourceIncentives.length > 0) ||
    (targetIncentives && targetIncentives.length > 0)

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

      <SummaryRow
        label="Borrow APY"
        loading={loading}
        content={
          <ValueChange
            from={formatPercent(Number(sourceBorrowAPY) * 100)}
            to={formatPercent(Number(targetBorrowAPY) * 100)}
          />
        }
      />

      {shouldRenderIncentives && (
        <SummaryRow
          label="Incentives"
          loading={loading}
          content={
            <Flex gap="s" align="center">
              <IncentivesButton
                incentives={sourceIncentives}
                symbol={switchSource.reserve.symbol}
              />
              <Icon size="xs" component={ArrowRight} />
              <IncentivesButton
                incentives={targetIncentives}
                symbol={switchTarget.reserve.symbol}
              />
            </Flex>
          }
        />
      )}

      <SummaryRow
        label="Borrow balance after switch"
        align="flex-start"
        loading={loading}
        content={
          <Flex direction="column" align="flex-end" gap="s">
            <ReserveAmount
              reserve={switchSource.reserve}
              amount={sourceAmountAfterSwap}
            />
            <ReserveAmount
              reserve={switchTarget.reserve}
              amount={targetAmountAfterSwap}
            />
          </Flex>
        }
      />
    </Stack>
  )
}
