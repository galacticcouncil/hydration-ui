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

import { CollateralState } from "@/components/primitives/CollateralState"
import { HealthFactorChange } from "@/components/primitives/HealthFactorChange"
import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { CollateralType } from "@/helpers/types"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedUserReserveData } from "@/hooks/commonTypes"
import { useSwapSlippageSettings } from "@/hooks/paraswap/useSwapRateProvider"
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
  const { formatCurrency, formatPercent } = useAppFormatters()
  const { swapSlippage, onSwapModalOpenChange } = useSwapSlippageSettings()

  const isPriceImpactWarning = priceImpactPct <= -1

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
        content={
          <ChangeValue
            loading={loading}
            from={formatPercent(Number(swapSource.reserve.supplyAPY) * 100)}
            to={formatPercent(Number(swapTarget.reserve.supplyAPY) * 100)}
          />
        }
      />

      <SummaryRow
        label="Collateralization"
        content={
          loading ? (
            <Skeleton width={80} height={16} />
          ) : (
            <Flex gap="s" align="center">
              <CollateralState collateralType={swapSource.collateralType} />
              <Icon size="xs" component={ArrowRight} />
              <CollateralState collateralType={swapTarget.collateralType} />
            </Flex>
          )
        }
      />

      <SummaryRow
        label="Liquidation threshold"
        content={
          <ChangeValue
            loading={loading}
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
        content={
          loading ? (
            <Skeleton width={100} height={32} />
          ) : (
            <Flex direction="column" align="flex-end" gap="s">
              <Flex gap="s" align="center">
                <ReserveLogo
                  address={swapSource.reserve.underlyingAsset}
                  size="small"
                />
                <Text>
                  {formatCurrency(sourceAmountAfterSwap.toString(), {
                    symbol: swapSource.reserve.symbol,
                  })}
                </Text>
                <Text color={getToken("text.medium")}>
                  (
                  {formatCurrency(
                    sourceAmountAfterSwap
                      .multipliedBy(
                        valueToBigNumber(swapSource.reserve.priceInUSD),
                      )
                      .toString(),
                  )}
                  )
                </Text>
              </Flex>
              <Flex gap="s" align="center">
                <ReserveLogo
                  address={swapTarget.reserve.underlyingAsset}
                  size="small"
                />
                <Text>
                  {formatCurrency(targetAmountAfterSwap.toString(), {
                    symbol: swapTarget.reserve.symbol,
                  })}
                </Text>
                <Text color={getToken("text.medium")}>
                  (
                  {formatCurrency(
                    targetAmountAfterSwap
                      .multipliedBy(
                        valueToBigNumber(swapTarget.reserve.priceInUSD),
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
