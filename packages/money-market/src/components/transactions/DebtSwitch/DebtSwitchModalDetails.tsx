import { valueToBigNumber } from "@aave/math-utils"
import { ArrowRight, Settings } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonTransparent,
  Flex,
  Icon,
  Separator,
  Skeleton,
  Stack,
  SummaryRow,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"

import { IncentivesButton } from "@/components/primitives/IncentivesButton"
import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedUserReserveData } from "@/hooks/commonTypes"
import { useSwapSlippageSettings } from "@/hooks/paraswap/useSwapRateProvider"

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

const ChangeValue: React.FC<{
  from: ReactNode
  to: ReactNode
  loading: boolean
}> = ({ from, to, loading }) => {
  if (loading) {
    return <Skeleton width={80} height={16} />
  }

  return (
    <Flex gap="s" align="center">
      <Text fw={500}>{from}</Text>
      <Icon size="xs" component={ArrowRight} />
      <Text fw={500}>{to}</Text>
    </Flex>
  )
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
  const { formatCurrency, formatPercent } = useAppFormatters()
  const { swapSlippage, onSwapModalOpenChange } = useSwapSlippageSettings()

  const isPriceImpactWarning = priceImpactPct <= -1

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
      <SummaryRow
        label="Slippage tolerance"
        content={
          <Flex gap="s" align="center">
            <SummaryRowValue>{formatPercent(swapSlippage)}</SummaryRowValue>
            <ButtonTransparent
              onClick={() => onSwapModalOpenChange(true)}
              sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
            >
              <Icon size="s" component={Settings} />
            </ButtonTransparent>
          </Flex>
        }
      />

      <SummaryRow
        label="Price impact"
        loading={loading}
        content={
          <SummaryRowValue
            color={
              isPriceImpactWarning
                ? getToken("accents.danger.emphasis")
                : getToken("text.high")
            }
          >
            {formatPercent(priceImpactPct)}
          </SummaryRowValue>
        }
      />

      <SummaryRow
        label="Borrow APY"
        content={
          <ChangeValue
            loading={loading}
            from={formatPercent(Number(sourceBorrowAPY) * 100)}
            to={formatPercent(Number(targetBorrowAPY) * 100)}
          />
        }
      />

      {shouldRenderIncentives && (
        <SummaryRow
          label="Incentives"
          content={
            loading ? (
              <Skeleton width={80} height={16} />
            ) : (
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
            )
          }
        />
      )}

      <SummaryRow
        label="Borrow balance after switch"
        align="flex-start"
        content={
          loading ? (
            <Skeleton width={100} height={32} />
          ) : (
            <Flex direction="column" align="flex-end" gap="s">
              <Flex gap="s" align="center">
                <ReserveLogo
                  address={switchSource.reserve.underlyingAsset}
                  size="small"
                />
                <Text>
                  {formatCurrency(sourceAmountAfterSwap.toString(), {
                    symbol: switchSource.reserve.symbol,
                  })}
                </Text>
                <Text color={getToken("text.medium")}>
                  (
                  {formatCurrency(
                    sourceAmountAfterSwap
                      .multipliedBy(
                        valueToBigNumber(switchSource.reserve.priceInUSD),
                      )
                      .toString(),
                  )}
                  )
                </Text>
              </Flex>
              <Flex gap="s" align="center">
                <ReserveLogo
                  address={switchTarget.reserve.underlyingAsset}
                  size="small"
                />
                <Text>
                  {formatCurrency(targetAmountAfterSwap.toString(), {
                    symbol: switchTarget.reserve.symbol,
                  })}
                </Text>
                <Text color={getToken("text.medium")}>
                  (
                  {formatCurrency(
                    targetAmountAfterSwap
                      .multipliedBy(
                        valueToBigNumber(switchTarget.reserve.priceInUSD),
                      )
                      .toString(),
                  )}
                  )
                </Text>
              </Flex>
            </Flex>
          )
        }
      />
    </Stack>
  )
}
